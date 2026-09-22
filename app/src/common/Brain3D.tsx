"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { BRAIN_BIN_PATH, SNAPPED_ANCHORS } from "./brainAsset";
import {
	toScreen,
	visibleWeights,
	pointOnCallout,
	calloutPoints,
} from "./brainLayout";
import { createMarkers } from "./brainMarkers";
import { cloudRadius, walkTrace } from "./brainTrace";
import { createTrace, type Trace } from "./brainTraceObject";
import { createBrainScene } from "./brainScene";
import { buildTissue, type Tissue } from "./brainTissue";
import { relatedTo } from "./relations";
import { loadTissue } from "./tissueLoader";

export type Section = {
	label: string;
	fact: string;
	summary: string;
	href: string;
	external?: boolean;
	step?: number;
	/** Indexes (in the `sections` array) of other sections this one has a
	 * real content relationship with — not decorative. See page.tsx for
	 * which connections exist and why. */
	related?: number[];
	/** How many countable items back this region: companies plus work
	 * projects, written beats of the case, recommendations, posts,
	 * certifications. The tissue gets one mark per item (brainDensity.ts),
	 * so the cluster around a region can be checked against the section it
	 * points at. Zero is a real answer — see sections.ts. */
	evidence: number;
	/** The region's own page, language-agnostic ("/projects/nortear"). Only
	 * regions whose content has a URL of its own have one; scene.ts uses it
	 * to know which region a route belongs to. */
	route?: string;
};

const BASE_ROTATION = -Math.PI / 2;

/** The six beats of a case: problem, decision, mechanism, trade-off,
 * result, afterwards (see STAGES in projects.ts). */
const BEATS = 6;

const Z_HERO = 3.6;
const Z_STEP = 4.3;
const SHIFT = 0.24;

const Brain3D = ({
	sections,
	active,
	onActive,
	onGo,
	inHero,
	/** On a case: which of the six beats is on screen, or null elsewhere.
	 * Drives the decision trace over the tissue. */
	beat,
	anchorRef,
	loadingText,
	activityText,
	navLabel,
	onProgress,
	onReady,
}: {
	sections: Section[];
	active: number | null;
	onActive: (i: number | null) => void;
	onGo: (i: number) => void;
	inHero: boolean;
	beat: number | null;
	anchorRef: MutableRefObject<{ x: number; y: number; ready: boolean }>;
	loadingText: string;
	activityText: string;
	navLabel: string;
	onProgress: (fraction: number) => void;
	onReady: () => void;
}) => {
	const mountRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const labelsRef = useRef<(HTMLAnchorElement | null)[]>([]);
	const calloutsRef = useRef<(SVGPolylineElement | null)[]>([]);
	const targetsRef = useRef<(SVGCircleElement | null)[]>([]);
	const connectionsRef = useRef<(SVGLineElement | null)[]>([]);
	const pulseRef = useRef<SVGCircleElement>(null);
	const readoutRef = useRef<HTMLSpanElement>(null);

	// The WebGL effect runs exactly once and its rAF loop needs to read the
	// live values, not the ones from the first render: hence the refs. The
	// sync happens in an effect, not in the render body — writing a ref
	// during render is a side effect during the render phase, which with
	// concurrent renders can run twice or get discarded. A one-frame
	// difference is invisible at 60fps.
	const callbacksRef = useRef({ onProgress, onReady });
	const activeRef = useRef<number | null>(active);
	const inHeroRef = useRef(inHero);
	const beatRef = useRef<number | null>(beat);
	useEffect(() => {
		callbacksRef.current = { onProgress, onReady };
		activeRef.current = active;
		inHeroRef.current = inHero;
		beatRef.current = beat;
	});

	const half = Math.ceil(sections.length / 2);
	const columns = useMemo(
		() => [sections.slice(0, half), sections.slice(half)],
		[sections, half],
	);

	// Unique [i, j] pairs with a real content relationship (see
	// Section.related in page.tsx) — computed here so the JSX knows how many
	// <line>s to paint, and again (identical, sections doesn't change after
	// mount) inside the WebGL effect, which can't depend on this render value.
	//
	// Built from relatedTo instead of reading `related` directly: a
	// relationship declared in only one direction (B says it knows A, but A
	// doesn't say so) got lost with the `j > i` filter, and then the label
	// would light up with no line connecting it — the same broken promise,
	// backwards.
	const connectionPairs = useMemo(() => {
		const pairs: [number, number][] = [];
		sections.forEach((_section, i) => {
			for (const j of relatedTo(sections, i)) {
				if (j > i) pairs.push([i, j]);
			}
		});
		return pairs;
	}, [sections]);

	useEffect(() => {
		const mount = mountRef.current;
		if (!mount) return;

		const reducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		// All the render infrastructure (renderer, composer, camera, deferred
		// bloom, measuring and disposal) lives in brainScene.ts. What's left
		// here is navigation: scroll-spy, callouts, and the loop that
		// coordinates them.
		const brainScene = createBrainScene(mount, (width, height) => {
			svgRef.current?.setAttribute("viewBox", `0 0 ${width} ${height}`);
		});
		const { scene, camera, group } = brainScene;

		let bloomIdle = 0;

		const resizeObserver = new ResizeObserver(() => {
			brainScene.measure();
			mapSteps();
			measureLayout();
		});
		resizeObserver.observe(mount);

		let alive = true;
		let tissue: Tissue | null = null;

		/**
		 * The decision trace, built the first time a case asks for one and
		 * rebuilt only if another region takes the focus. The walk costs one
		 * pass over the cloud per step, so it happens once — never per frame.
		 */
		let trace: Trace | null = null;
		let traceOf: number | null = null;
		const gaze = new THREE.Vector3();
		const inverseMatrix = new THREE.Matrix4();
		const ensureTrace = (region: number) => {
			if (!tissue || traceOf === region) return;
			trace?.destroy();
			const anchor = anchors[region] ?? anchors[0];
			// The camera's line of sight, expressed in the model's own space:
			// the walk uses it to stay in the plane the reader is looking at
			// instead of heading into depth, where six steps project as two.
			camera.getWorldDirection(gaze);
			inverseMatrix.copy(group.matrixWorld).invert();
			gaze.transformDirection(inverseMatrix).normalize();
			// One tenth of the radius per beat left the six steps knotted
			// around the anchor; at a fifth the trace crosses real tissue and
			// reads as a path.
			const step = cloudRadius(tissue.positions) * 0.2;
			const route = walkTrace(
				tissue.positions,
				[anchor.x, anchor.y, anchor.z],
				BEATS,
				step,
				[gaze.x, gaze.y, gaze.z],
			);
			trace = createTrace(group, route, { reducedMotion });
			traceOf = region;
		};

		let intersecting = true;
		let pageVisible = document.visibilityState !== "hidden";
		const isVisible = () => intersecting && pageVisible;

		// The streaming, the header split across chunks, and the progress live
		// in tissueLoader.ts, with their own tests. What's left here is only
		// what WebGL actually needs.
		loadTissue(BRAIN_BIN_PATH, {
			stillAlive: () => alive,
			onProgress: (fraction) => {
				callbacksRef.current.onProgress(fraction);
				if (readoutRef.current) {
					readoutRef.current.textContent = `${loadingText} · ${Math.round(fraction * 100)}%`;
				}
			},
		})
			.then((buffer) => {
				if (!alive || !buffer) return;
				// The geometry and its reveal live in brainTissue.ts. What's left
				// here is coordination: telling the hero it can lift the veil and
				// scheduling the bloom for after the first useful frame.
				tissue = buildTissue(group, buffer, {
					reducedMotion,
					stillAlive: () => alive,
					// One mark per countable item, clustered on the region it
					// belongs to (brainDensity.ts). SNAPPED_ANCHORS is used here
					// rather than the Vector3 `anchors` below because the seeding
					// is plain arithmetic over the cloud — it needs no three.js.
					anchors: SNAPPED_ANCHORS,
					evidence: sections.map((section) => section.evidence),
					onDone: () => {
						if (readoutRef.current) {
							// The readout used to say "6 active regions", which was
							// sections.length wearing a lab coat. It now reports the
							// marks actually placed on the tissue, so the number on
							// screen is one a visitor can count.
							const marks = tissue?.marksPerRegion.reduce((a, b) => a + b, 0) ?? 0;
							readoutRef.current.textContent = `${marks} ${activityText}`;
						}
						if (!alive) return;
						callbacksRef.current.onReady();
						// At idle: compiling the bloom's shaders exactly when the
						// veil lifts would cause a stutter on the first frame the
						// user gets to see. The timeout keeps it from being
						// postponed forever if the page never goes idle.
						if (typeof requestIdleCallback === "function") {
							bloomIdle = requestIdleCallback(brainScene.turnOnBloom, { timeout: 2000 });
						} else {
							bloomIdle = window.setTimeout(brainScene.turnOnBloom, 300);
						}
					},
				});
			})
			.catch((e) => {
				console.error("Could not load the brain tissue:", e);
				callbacksRef.current.onReady();
			});

		// Axon, impulse and pin: the signal heading to the active region.
		const markers = createMarkers(scene, { reducedMotion });

		const vector = new THREE.Vector3();
		const anchorWorld = new THREE.Vector3();
		const blend = new THREE.Vector3();
		const aux = new THREE.Vector3();

		// Already snapped to the nearest tissue point at build time
		// (scripts/prepare-brain.mjs, see entities/brainAnchors.ts) — avoids
		// scanning ~30k points per anchor on every client load.
		if (SNAPPED_ANCHORS.length !== sections.length) {
			console.warn(
				`brainAsset.ts has ${SNAPPED_ANCHORS.length} anchors but there are ${sections.length} sections. ` +
					"Update entities/brainAnchors.ts and run `pnpm run brain`.",
			);
		}
		const anchors = sections.map(
			(_section, i) => new THREE.Vector3(...(SNAPPED_ANCHORS[i] ?? [0, 0, 0])),
		);

		let steps: { index: number; el: HTMLElement }[] = [];
		const mapSteps = () => {
			steps = [];
			sections.forEach((section, i) => {
				if (section.step === undefined) return;
				const el = document.getElementById(`step-${section.step}`);
				if (el) steps.push({ index: i, el });
			});
		};
		mapSteps();

		// Cached layout, refreshed only on scroll/resize instead of read with
		// getBoundingClientRect() on every animate() frame: that forced up to
		// ~12 synchronous reflows per frame (one per visible step, one for the
		// mount, one per region button) even with the page completely still.
		let mountRect: DOMRect = mount.getBoundingClientRect();
		let stepRects: { index: number; rect: DOMRect }[] = [];
		let buttonRects: (DOMRect | null)[] = [];
		const measureLayout = () => {
			mountRect = mount.getBoundingClientRect();
			stepRects = steps.map(({ index, el }) => ({ index, rect: el.getBoundingClientRect() }));
			buttonRects = sections.map((_section, i) => labelsRef.current[i]?.getBoundingClientRect() ?? null);
		};
		measureLayout();

		let scrollRequestId = 0;
		const onScroll = () => {
			if (scrollRequestId) return;
			scrollRequestId = requestAnimationFrame(() => {
				scrollRequestId = 0;
				measureLayout();
			});
		};
		window.addEventListener("scroll", onScroll, { passive: true });

		const targetCamera = new THREE.Vector3();
		const targetLookAt = new THREE.Vector3();
		const currentLookAt = new THREE.Vector3(0, 0, 0);

		const anchorScreen = sections.map(() => ({ x: 0, y: 0 }));

		const drawCallouts = (rect: DOMRect) => {
			sections.forEach((_section, i) => {
				vector
					.copy(anchors[i])
					.applyMatrix4(group.matrixWorld)
					.project(camera);
				const { x: ax, y: ay } = toScreen(vector, rect);
				anchorScreen[i].x = ax;
				anchorScreen[i].y = ay;

				const line = calloutsRef.current[i];
				const target = targetsRef.current[i];
				const b = buttonRects[i];
				if (!line || !target || !b) return;

				line.setAttribute(
					"points",
					calloutPoints(b, { x: ax, y: ay }, rect, i < half),
				);
				target.setAttribute("cx", String(ax));
				target.setAttribute("cy", String(ay));
			});
		};

		const drawConnections = (activeNow: number | null) => {
			connectionPairs.forEach(([a, b], k) => {
				const line = connectionsRef.current[k];
				if (!line) return;
				const lit = activeNow === a || activeNow === b;
				line.setAttribute("x1", String(anchorScreen[a].x));
				line.setAttribute("y1", String(anchorScreen[a].y));
				line.setAttribute("x2", String(anchorScreen[b].x));
				line.setAttribute("y2", String(anchorScreen[b].y));
				line.setAttribute("opacity", lit ? "0.9" : "0");
			});
		};

		const publishAnchor = (rect: DOMRect, point: THREE.Vector3) => {
			vector.copy(point).project(camera);
			anchorRef.current.x = rect.left + (vector.x * 0.5 + 0.5) * rect.width;
			anchorRef.current.y = rect.top + (-vector.y * 0.5 + 0.5) * rect.height;
			anchorRef.current.ready = true;
		};

		let frame = 0;
		let shift = 0;
		let looping = false;
		const animate = () => {
			if (!alive || !isVisible()) {
				looping = false;
				return;
			}
			looping = true;
			const activeNow = activeRef.current;

			const target =
				brainScene.width < 768
					? 0
					: Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
			shift += (target - shift) * (reducedMotion ? 1 : 0.08);
			if (brainScene.width && brainScene.height) {
				camera.setViewOffset(
					brainScene.width,
					brainScene.height,
					shift * brainScene.width * SHIFT,
					0,
					brainScene.width,
					brainScene.height,
				);
			}

			group.updateMatrixWorld(true);

			tissue?.pulse(frame);


			const zHero = Math.max(Z_HERO, brainScene.minZ);
			const zStep = Math.max(Z_STEP, brainScene.minZ);
			const z = zHero + (zStep - zHero) * shift;

			// How much each step weighs is plain math and lives in
			// brainLayout.ts, with tests; what's left here is only blending the
			// anchors in world space, which does need three.js.
			const { weights, total: weight, strength } = visibleWeights(
				stepRects.map(({ index, rect: r }) => ({
					index,
					top: r.top,
					bottom: r.bottom,
				})),
				window.innerHeight,
			);
			blend.set(0, 0, 0);
			for (const { index, weight: w } of weights) {
				aux
					.copy(anchors[index])
					.applyMatrix4(group.matrixWorld)
					.multiplyScalar(w);
				blend.add(aux);
			}
			if (weight > 0.001) blend.divideScalar(weight);

			// Two ways of holding a region: picking one in the hero, and
			// reading the case that belongs to it. Without the second, a case
			// left the camera in its wandering state and `settled` at 0, so
			// the axon, the pin and the trace all stayed invisible.
			const beatNow = beatRef.current;
			const readingCase = beatNow !== null && activeNow !== null;
			const choosing = (inHeroRef.current || readingCase) && activeNow !== null;

			if (choosing && activeNow !== null) {
				anchorWorld
					.copy(anchors[activeNow])
					.applyMatrix4(group.matrixWorld);
				targetLookAt.copy(anchorWorld);
				targetCamera
					.copy(anchorWorld)
					.normalize()
					// Reading a case needs room for the whole trace, not the
					// close-up the hero uses to present one region.
					.multiplyScalar(readingCase ? 2.3 : 0.95)
					.add(anchorWorld)
					.setZ(Math.max(anchorWorld.z + z * 0.45, z * 0.45));
			} else {
				anchorWorld.copy(blend);
				targetCamera.set(0, 0.1, z);
				targetLookAt.copy(blend).multiplyScalar(0.28 * strength);
			}

			const settled = choosing ? 1 : strength;

			// The decision trace only exists while a case is being read; on
			// the home `beat` is null and nothing gets built.
			if (readingCase && activeNow !== null) {
				ensureTrace(activeNow);
				trace?.draw(beatNow, settled, frame);
			} else {
				trace?.draw(null, 0, frame);
			}
			if (!reducedMotion) {
				group.rotation.y =
					BASE_ROTATION + Math.sin(frame / 260) * 0.28 * (1 - settled);
			}

			if (weight <= 0.001 && !choosing) {
				markers.turnOff();
				anchorRef.current.ready = false;
			} else {
				const progress = markers.pointAt(
					anchorWorld,
					group.position.y,
					settled,
					frame,
				);

				const pulseEl = pulseRef.current;
				const line =
					activeNow !== null ? calloutsRef.current[activeNow] : null;
				// The SVG pulse travels along the callout in sync with the 3D
				// impulse; the interpolation over the polyline lives in
				// brainLayout.
				const onCallout = pointOnCallout(line?.getAttribute("points"), progress);
				if (pulseEl && onCallout) {
					pulseEl.setAttribute("cx", String(onCallout.x));
					pulseEl.setAttribute("cy", String(onCallout.y));
				}
			}

			const smooth = reducedMotion ? 1 : 0.085;
			camera.position.lerp(targetCamera, smooth);
			currentLookAt.lerp(targetLookAt, smooth);
			camera.lookAt(currentLookAt);

			brainScene.render();
			if (inHeroRef.current) {
				drawCallouts(mountRect);
				drawConnections(activeNow);
			}
			if (weight > 0.001 || choosing) publishAnchor(mountRect, anchorWorld);
			frame += 1;
			requestAnimationFrame(animate);
		};
		const startLoop = () => {
			if (looping) return;
			animate();
		};
		startLoop();

		const visibilityObserver = new IntersectionObserver(
			([entry]) => {
				intersecting = entry.isIntersecting;
				if (isVisible()) startLoop();
			},
			{ threshold: 0 },
		);
		visibilityObserver.observe(mount);

		const onVisibilityChange = () => {
			pageVisible = document.visibilityState !== "hidden";
			if (isVisible()) startLoop();
		};
		document.addEventListener("visibilitychange", onVisibilityChange);

		return () => {
			alive = false;
			tissue?.cancel();
			trace?.destroy();
			if (bloomIdle) {
				if (typeof cancelIdleCallback === "function") cancelIdleCallback(bloomIdle);
				else clearTimeout(bloomIdle);
			}
			if (scrollRequestId) cancelAnimationFrame(scrollRequestId);
			window.removeEventListener("scroll", onScroll);
			visibilityObserver.disconnect();
			document.removeEventListener("visibilitychange", onVisibilityChange);
			resizeObserver.disconnect();
			// Freeing the GPU is whoever claimed it's responsibility: the scene
			// destroys its renderer, its composer, the bloom and the geometries.
			brainScene.destroy();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const linked = useMemo(
		() => new Set(relatedTo(sections, active)),
		[active, sections],
	);

	/**
	 * Four states, not two. The panel claims "connected to X · Y" and until
	 * now nothing on screen showed it: linked regions dimmed the same as
	 * unrelated ones (0.08), so the site's most valuable connection was an
	 * orange line between two anonymous points on the tissue. With a middle
	 * level, the eye can trace the whole path: active label → its anchor →
	 * connection → linked anchor → its label.
	 */
	const state = (i: number): "active" | "linked" | "idle" | "unrelated" => {
		if (active === i) return "active";
		if (linked.has(i)) return "linked";
		return active === null ? "idle" : "unrelated";
	};

	const renderLabel = (section: Section, i: number) => {
		const lit = active === i;
		const isLinked = linked.has(i);
		const isLeft = i < half;
		return (
			<a
				key={section.href + section.label}
				ref={(n) => {
					labelsRef.current[i] = n;
				}}
				href={section.href}
				target={section.external ? "_blank" : undefined}
				rel={section.external ? "noopener noreferrer" : undefined}
				onClick={(e) => {
					if (section.external || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
						return;
					}
					e.preventDefault();
					onGo(i);
				}}
				onMouseEnter={() => onActive(i)}
				onFocus={() => onActive(i)}
				onMouseLeave={() => onActive(null)}
				tabIndex={inHero ? 0 : -1}
				className={`pointer-events-auto flex w-[13.5rem] flex-col gap-1 border-y py-2 transition-colors duration-300 ease-impulse ${
					isLeft ? "items-start text-left" : "items-end text-right"
				} ${
					lit
						? "border-y-impulse/40"
						: isLinked
							? "border-y-impulse/20"
							: "border-y-transparent hover:border-y-synapse/25"
				}`}
			>
				<span
					className={`flex items-baseline gap-2 font-label text-[13px] font-bold uppercase tracking-[.06em] transition-colors duration-300 ease-impulse ${
						isLeft ? "" : "flex-row-reverse"
					} ${lit ? "text-impulse" : isLinked ? "text-impulse/65" : "text-signal"}`}
				>
					<span
						className={`font-mono text-[10px] tabular-nums ${
							lit ? "text-impulse" : isLinked ? "text-impulse/50" : "text-synapse"
						}`}
					>
						{String(i + 1).padStart(2, "0")}
					</span>
					{section.label}
				</span>
				<span className='font-mono text-[10px] uppercase tracking-[.1em] text-myelin'>
					{section.fact}
				</span>
			</a>
		);
	};

	return (
		<>
			<div ref={mountRef} aria-hidden='true' className='absolute inset-0' />

			<svg
				ref={svgRef}
				className={`pointer-events-none absolute inset-0 hidden h-full w-full transition-opacity duration-700 ease-impulse desk:block ${
					inHero ? "opacity-100" : "opacity-0"
				}`}
				preserveAspectRatio='none'
				aria-hidden='true'
			>
				{sections.map((s, i) => {
					// A linked section's callout and target stay in faint orange:
					// they're the leg of the path that runs from the anchor to its
					// label. Without this the connection died inside the tissue.
					const st = state(i);
					const orange = st === "active" || st === "linked";
					return (
						<g key={s.href + s.label}>
							<polyline
								ref={(n) => {
									calloutsRef.current[i] = n;
								}}
								fill='none'
								stroke={orange ? "rgb(255 106 58)" : "rgb(124 152 190)"}
								strokeOpacity={
									st === "active"
										? 0.85
										: st === "linked"
											? 0.4
											: st === "idle"
												? 0.3
												: 0.08
								}
								strokeWidth={st === "active" ? 1.4 : 1}
								className='transition-[stroke-opacity] duration-300 ease-impulse'
							/>
							<circle
								ref={(n) => {
									targetsRef.current[i] = n;
								}}
								r={st === "active" ? 5 : st === "linked" ? 3.5 : 2.5}
								fill='none'
								stroke={orange ? "rgb(255 106 58)" : "rgb(124 152 190)"}
								strokeOpacity={
									st === "active"
										? 0.9
										: st === "linked"
											? 0.6
											: st === "idle"
												? 0.5
												: 0.1
								}
								strokeWidth={1.2}
								className='transition-[stroke-opacity] duration-300 ease-impulse'
							/>
						</g>
					);
				})}
				{connectionPairs.map(([a, b], k) => (
					// animate-conduction (the same as the signal cord) makes the
					// dashes run along the line: the connection stops being a
					// dotted stroke and reads as something traveling from one
					// region to the other.
					<line
						key={`${a}-${b}`}
						ref={(n) => {
							connectionsRef.current[k] = n;
						}}
						stroke='rgb(255 106 58)'
						strokeWidth={1.2}
						strokeDasharray='3 4'
						strokeDashoffset={140}
						opacity={0}
						className='animate-conduction transition-opacity duration-300 ease-impulse'
					/>
				))}
				{active !== null && inHero && (
					<circle ref={pulseRef} r={3.5} fill='rgb(255 106 58)' />
				)}
			</svg>

			<nav
				aria-label={navLabel}
				className={`absolute inset-0 z-10 hidden items-center justify-between px-8 transition-opacity duration-700 ease-impulse desk:flex lg:px-14 ${
					inHero ? "opacity-100" : "pointer-events-none opacity-0"
				}`}
			>
				<div className='pointer-events-none flex flex-col gap-3'>
					{columns[0].map((s, i) => renderLabel(s, i))}
				</div>
				<div className='pointer-events-none flex flex-col gap-3'>
					{columns[1].map((s, i) => renderLabel(s, i + half))}
				</div>
			</nav>

			<div
				className={`pointer-events-none absolute bottom-6 right-5 z-20 flex items-center gap-2 transition-opacity duration-500 ease-impulse md:right-10 ${
					inHero ? "opacity-100" : "opacity-0"
				}`}
			>
				<span className='h-1.5 w-1.5 animate-breathe rounded-full bg-synapse' />
				<span
					ref={readoutRef}
					className='font-mono text-[10px] uppercase tracking-[.18em] text-myelin'
				>
					{loadingText}
				</span>
			</div>
		</>
	);
};

export default Brain3D;
