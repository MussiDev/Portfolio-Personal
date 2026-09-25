"use client";

import { useEffect, useRef, type MutableRefObject } from "react";

import { ANCHORS_2D, BRAIN2D_PATH } from "./brain2dAsset";
import { parseBrain2D, type Brain2D } from "./brain2dFormat";
import { easeOutCubic, revealCounts } from "./tissueReveal";

/**
 * The nervous system on mobile: the same brain as desktop, in 2D.
 *
 * Mobile doesn't download three.js or the 466 KB .bin (decision from
 * d3d9cb0). The previous substitute was a generic lobed silhouette with six
 * points: something organic, but not a brain, and unrelated to the
 * sections. This draws the real brain — desktop's mesh projected to a side
 * view at build time (scripts/prepare-brain-2d.mjs), ~27 KB — and every
 * section sits at its real anchor, the same region as on desktop.
 *
 * Same build-up curve as the 3D one (`revealCounts` + `easeOutCubic`) and
 * the same contract with `useSignalCord`: it publishes to `anchorRef` where
 * the active region sits on screen, so the cord can stretch to the step's
 * badge.
 *
 * The canvas is decoration: aria-hidden. Mobile's real navigation is
 * HeroSection's <nav>, with real links that work without JS.
 */

const SPARKS = 18;
const REVEAL_MS = 900;
/** Breathing room between the anchors and the text above or the list below. */
const MARGIN = 26;
/** Room kept free at the sides so the outer anchors' labels still fit. */
const SIDE = 48;
/** Reference height for density: at this size everything gets drawn. */
const REFERENCE_HEIGHT = 300;
/** Below this height, the six numbers start overlapping each other. */
const HEIGHT_FOR_ALL_NUMBERS = 150;
/** How far a lit region spreads through the tissue, over the brain's width. */
const REGION_RADIUS = 0.17;
/** How long the impulse wave takes to cross the brain after a change. */
const WAVE_MS = 1100;

const TISSUE_RGB = "124, 152, 190";
const IMPULSE_RGB = "255, 106, 58";
/** The impulse at its hottest: the lit node's core and the pulses' heads. */
const HOT_RGB = "255, 214, 196";
/** --tissue, for the plate under the lit region's name. */
const MEDIUM_RGB = "5, 7, 13";
/** Heat bands for the tissue's points: one fill per band. */
const HEAT_LEVELS = 4;

/** The bounding box of the six anchors: the part of the brain that has to
 * stay in the clear. The rest of the tissue may run under the text or the
 * list. */
const anchorBounds = () => {
	let minX = 1, maxX = 0, minY = 1, maxY = 0;
	for (const [x, y] of ANCHORS_2D) {
		minX = Math.min(minX, x);
		maxX = Math.max(maxX, x);
		minY = Math.min(minY, y);
		maxY = Math.max(maxY, y);
	}
	return { minX, maxX, minY, maxY };
};

type Anchor = { x: number; y: number; ready: boolean };

const NervousSystemMobile = ({
	sectionCount,
	labels,
	active,
	relations,
	anchorRef,
	onReady,
}: {
	sectionCount: number;
	/** Each section's label: the lit region is named on the tissue. */
	labels: string[];
	active: number | null;
	/** Each section's relatedTo(), in order: the same real connections
	 * desktop's brain draws. */
	relations: number[][];
	anchorRef: MutableRefObject<Anchor>;
	onReady: () => void;
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// The loop reads live values through refs: redoing the effect on every
	// section change would restart the build-up from scratch. The sync
	// happens in an effect, not in render.
	const activeRef = useRef<number | null>(active);
	const relationsRef = useRef(relations);
	const labelsRef = useRef(labels);
	const onReadyRef = useRef(onReady);
	useEffect(() => {
		activeRef.current = active;
		relationsRef.current = relations;
		labelsRef.current = labels;
		onReadyRef.current = onReady;
	});

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		// The anchor object is captured once: its identity never changes.
		const anchor = anchorRef.current;
		// With no 2D context there's nothing to draw, but the veil is still
		// waiting on this signal: without notifying, mobile would sit eight
		// seconds in black over a decoration that failed.
		if (!canvas || !ctx) {
			onReadyRef.current();
			return;
		}

		if (ANCHORS_2D.length !== sectionCount) {
			console.warn(
				`brain2dAsset.ts has ${ANCHORS_2D.length} anchors and there are ${sectionCount} sections. ` +
					"Run `pnpm run brain:2d`.",
			);
		}

		// The canvas doesn't understand CSS variables: this resolves the real
		// family name next/font registered for --font-mono.
		const monoFont =
			getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() ||
			"monospace";
		const labelFont =
			getComputedStyle(document.documentElement).getPropertyValue("--font-label").trim() ||
			"sans-serif";
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		let width = 0;
		let height = 0;
		// The hero's free strip in page coordinates (with the canvas sticky
		// above everything, these match the canvas's own coordinates while
		// the hero is on screen).
		let band: { top: number; bottom: number } | null = null;
		const from = document.querySelector<HTMLElement>("[data-tissue-from]");
		const to = document.querySelector<HTMLElement>("[data-tissue-to]");
		const measure = () => {
			const rect = canvas.getBoundingClientRect();
			if (!rect.width || !rect.height) return;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			width = rect.width;
			height = rect.height;
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			if (from && to) {
				const y = window.scrollY;
				band = {
					top: from.getBoundingClientRect().bottom + y,
					bottom: to.getBoundingClientRect().top + y,
				};
			}
		};
		measure();
		const resizeObserver = new ResizeObserver(measure);
		resizeObserver.observe(canvas);
		// The hero's text changes height when fonts load or when the pitch
		// wraps to a different number of lines.
		if (from) resizeObserver.observe(from);
		if (to) resizeObserver.observe(to);

		// The brain is sized by its anchors, not its outline: the six regions
		// have to sit in the free strip between the hero's text and the list,
		// but the tissue around them may run under both. Fitting the whole
		// silhouette into the strip left a ~130px thumbnail on a phone — a
		// scatter plot, not a brain.
		const bounds = anchorBounds();
		const box = (aspect: number) => {
			const free = band ?? { top: height * 0.25, bottom: height * 0.7 };
			const freeHeight = Math.max(0, free.bottom - free.top - MARGIN * 2);
			const spanX = Math.max(0.01, bounds.maxX - bounds.minX);
			const spanY = Math.max(0.01, bounds.maxY - bounds.minY);
			const boxWidth = Math.min((width - SIDE * 2) / spanX, (freeHeight / spanY) * aspect);
			const boxHeight = boxWidth / aspect;
			return {
				boxWidth,
				boxHeight,
				ox: width / 2 - ((bounds.minX + bounds.maxX) / 2) * boxWidth,
				oy: (free.top + free.bottom) / 2 - ((bounds.minY + bounds.maxY) / 2) * boxHeight,
				fadeTop: free.top,
			};
		};

		let brain: Brain2D | null = null;
		let alive = true;
		let raf = 0;
		let frame = 0;
		let start = 0;
		let announced = false;
		let intersecting = true;
		let pageVisible = document.visibilityState !== "hidden";
		const isVisible = () => intersecting && pageVisible;

		// The impulse wave: every time the active region changes, a front
		// leaves it and crosses the tissue. Timestamped, not frame-counted,
		// so it lasts the same on a 120 Hz screen.
		let lastActive: number | null = null;
		let waveStart = Number.NEGATIVE_INFINITY;
		// Per-point screen position and heat, reused frame to frame.
		let sx = new Float32Array(0);
		let sy = new Float32Array(0);
		let heat = new Float32Array(0);

		const draw = (now: number) => {
			if (!alive) return;
			if (!isVisible()) {
				raf = 0;
				return;
			}
			if (!brain || !width || !height) {
				raf = requestAnimationFrame(draw);
				return;
			}
			if (!start) start = now;

			const { points, edges, aspect } = brain;
			const { boxWidth, boxHeight, ox, oy, fadeTop } = box(aspect);
			const px = (x: number) => ox + x * boxWidth;
			const py = (y: number) => oy + y * boxHeight;

			// Constant density: on a short screen a prefix of points and edges
			// gets drawn (they come pre-shuffled from build, so any prefix is
			// an even sample). Everything on a small brain would look like a
			// smudge.
			const density = Math.min(1, Math.max(0.3, (boxHeight / REFERENCE_HEIGHT) ** 2));
			const totalPoints = Math.round((points.length / 2) * density);
			const totalEdges = Math.round((edges.length / 4) * density);

			const t = reducedMotion ? 1 : Math.min(1, (now - start) / REVEAL_MS);
			// revealCounts works with edge vertices (in pairs).
			const shown = revealCounts(easeOutCubic(t), totalPoints, totalEdges * 2);
			const visibleEdges = shown.edges / 2;

			// The regions: the same anchor as on desktop, three states like
			// desktop's labels — active, linked (real content relationship)
			// and idle. They appear once the tissue has built up.
			const activeNow = t >= 0.7 ? activeRef.current : null;
			const linked = new Set(
				activeNow !== null ? (relationsRef.current[activeNow] ?? []) : [],
			);
			const onScreen = (i: number) => {
				const a = ANCHORS_2D[i];
				return a ? { x: px(a[0]), y: py(a[1]) } : null;
			};
			if (activeNow !== lastActive) {
				lastActive = activeNow;
				waveStart = reducedMotion ? Number.NEGATIVE_INFINITY : now;
			}

			// Where the tissue is lit: the active region at full strength, its
			// real connections at half, plus the passing wave front. The region
			// is the tissue itself warming up, not a target icon drawn on top.
			const radius = boxWidth * REGION_RADIUS;
			const origin = activeNow !== null ? onScreen(activeNow) : null;
			const sources: { x: number; y: number; k: number }[] = [];
			if (origin) sources.push({ ...origin, k: 1 });
			for (const j of linked) {
				const p = onScreen(j);
				if (p) sources.push({ ...p, k: 0.45 });
			}
			const waveAge = (now - waveStart) / WAVE_MS;
			const waveR = waveAge * boxWidth * 0.9;
			const waveK = waveAge < 1 ? (1 - waveAge) ** 1.5 : 0;

			if (sx.length < shown.points) {
				sx = new Float32Array(points.length / 2);
				sy = new Float32Array(points.length / 2);
				heat = new Float32Array(points.length / 2);
			}
			for (let i = 0; i < shown.points; i += 1) {
				const x = px(points[i * 2]);
				const y = py(points[i * 2 + 1]);
				sx[i] = x;
				sy[i] = y;
				let h = 0;
				for (const src of sources) {
					const d = Math.hypot(x - src.x, y - src.y) / radius;
					if (d < 1) h = Math.max(h, src.k * (1 - d) ** 2);
				}
				if (waveK > 0 && origin) {
					const d = Math.abs(Math.hypot(x - origin.x, y - origin.y) - waveR);
					if (d < 16) h = Math.max(h, waveK * 0.7 * (1 - d / 16));
				}
				heat[i] = h;
			}

			ctx.clearRect(0, 0, width, height);

			ctx.strokeStyle = `rgba(${TISSUE_RGB}, 0.17)`;
			ctx.lineWidth = 0.7;
			ctx.beginPath();
			for (let e = 0; e < visibleEdges; e += 1) {
				const k = e * 4;
				ctx.moveTo(px(edges[k]), py(edges[k + 1]));
				ctx.lineTo(px(edges[k + 2]), py(edges[k + 3]));
			}
			ctx.stroke();

			// The lit region's own fibres, over the grey ones.
			if (origin) {
				ctx.strokeStyle = `rgba(${IMPULSE_RGB}, 0.32)`;
				ctx.lineWidth = 0.8;
				ctx.beginPath();
				for (let e = 0; e < visibleEdges; e += 1) {
					const k = e * 4;
					const ax = px(edges[k]);
					const ay = py(edges[k + 1]);
					if (Math.hypot(ax - origin.x, ay - origin.y) > radius * 0.8) continue;
					ctx.moveTo(ax, ay);
					ctx.lineTo(px(edges[k + 2]), py(edges[k + 3]));
				}
				ctx.stroke();
			}

			// Points in heat bands: one fill per band instead of one per point.
			for (let level = 0; level <= HEAT_LEVELS; level += 1) {
				const k = level / HEAT_LEVELS;
				const size = level > 0 ? 1.3 + k : 1.3;
				ctx.fillStyle =
					level > 0 ? `rgba(${IMPULSE_RGB}, ${0.35 + 0.65 * k})` : `rgba(${TISSUE_RGB}, 0.6)`;
				ctx.beginPath();
				for (let i = 0; i < shown.points; i += 1) {
					const l = Math.max(0, Math.min(HEAT_LEVELS, Math.ceil(heat[i] * HEAT_LEVELS - 0.15)));
					if (l !== level) continue;
					ctx.rect(sx[i] - size / 2, sy[i] - size / 2, size, size);
				}
				ctx.fill();
			}

			// Spontaneous sparks, the same gesture as the 3D sparks:
			// pow(f, 7) gives brief, separated flickers, not a uniform pulse.
			if (!reducedMotion && t >= 1) {
				for (let i = 0; i < SPARKS; i += 1) {
					const f = (Math.sin(frame / 42 + (i / SPARKS) * Math.PI * 2) + 1) / 2;
					const spike = f ** 7;
					if (spike < 0.02) continue;
					const k = Math.floor((i / SPARKS) * totalPoints) * 2;
					ctx.fillStyle = `rgba(${IMPULSE_RGB}, ${spike * 0.8})`;
					ctx.beginPath();
					ctx.arc(px(points[k]), py(points[k + 1]), 1.1, 0, Math.PI * 2);
					ctx.fill();
				}
			}

			const numberAll = boxHeight >= HEIGHT_FOR_ALL_NUMBERS;

			if (origin) {
				// The glow is added light, not paint: it brightens the tissue
				// under it instead of covering it.
				ctx.save();
				ctx.globalCompositeOperation = "lighter";
				const glow = ctx.createRadialGradient(origin.x, origin.y, 0, origin.x, origin.y, radius);
				glow.addColorStop(0, `rgba(${IMPULSE_RGB}, 0.22)`);
				glow.addColorStop(1, `rgba(${IMPULSE_RGB}, 0)`);
				ctx.fillStyle = glow;
				ctx.fillRect(origin.x - radius, origin.y - radius, radius * 2, radius * 2);
				ctx.restore();

				// Connections bow like desktop's cord and carry pulses outward:
				// a signal travelling, not a dashed diagram line.
				for (const j of linked) {
					const d = onScreen(j);
					if (!d) continue;
					const len = Math.hypot(d.x - origin.x, d.y - origin.y) || 1;
					const cx = (origin.x + d.x) / 2 - (d.y - origin.y) * 0.22;
					const cy = (origin.y + d.y) / 2 + (d.x - origin.x) * 0.22;
					ctx.strokeStyle = `rgba(${IMPULSE_RGB}, 0.4)`;
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.moveTo(origin.x, origin.y);
					ctx.quadraticCurveTo(cx, cy, d.x, d.y);
					ctx.stroke();
					if (reducedMotion) continue;
					for (let q = 0; q < 2; q += 1) {
						// Same speed in px/s on long and short connections.
						const u = ((now * 0.12) / len + q / 2 + j * 0.13) % 1;
						const qx = (1 - u) ** 2 * origin.x + 2 * (1 - u) * u * cx + u ** 2 * d.x;
						const qy = (1 - u) ** 2 * origin.y + 2 * (1 - u) * u * cy + u ** 2 * d.y;
						const fade = Math.sin(u * Math.PI);
						ctx.fillStyle = `rgba(${IMPULSE_RGB}, ${0.25 * fade})`;
						ctx.beginPath();
						ctx.arc(qx, qy, 5, 0, Math.PI * 2);
						ctx.fill();
						ctx.fillStyle = `rgba(${HOT_RGB}, ${0.95 * fade})`;
						ctx.beginPath();
						ctx.arc(qx, qy, 1.5, 0, Math.PI * 2);
						ctx.fill();
					}
				}
			}

			if (t >= 0.7) {
				ctx.textBaseline = "middle";
				for (let i = 0; i < sectionCount; i += 1) {
					const p = onScreen(i);
					if (!p) continue;
					const lit = activeNow === i;
					const isLinked = linked.has(i);
					const breath = reducedMotion
						? 0.7
						: 0.45 + 0.55 * ((Math.sin(frame / 48 + i * 1.7) + 1) / 2);

					if (lit && !reducedMotion) {
						// A ring that keeps leaving the node: the region firing.
						const r = ((now - waveStart) / 1600) % 1;
						ctx.strokeStyle = `rgba(${IMPULSE_RGB}, ${0.6 * (1 - r)})`;
						ctx.lineWidth = 1;
						ctx.beginPath();
						ctx.arc(p.x, p.y, 4 + r * 18, 0, Math.PI * 2);
						ctx.stroke();
					}
					ctx.fillStyle = lit
						? `rgba(${HOT_RGB}, 1)`
						: isLinked
							? `rgba(${IMPULSE_RGB}, 0.9)`
							: `rgba(${TISSUE_RGB}, ${0.5 + breath * 0.5})`;
					ctx.beginPath();
					ctx.arc(p.x, p.y, lit ? 3.2 : isLinked ? 2.4 : 2, 0, Math.PI * 2);
					ctx.fill();
					if (lit) {
						ctx.strokeStyle = `rgba(${IMPULSE_RGB}, 1)`;
						ctx.lineWidth = 1.5;
						ctx.stroke();
					}

					// The section's number, the same one the list below and
					// desktop's labels use: the map's legend. The lit one also
					// gets its name on a leader, like desktop's labels. On a
					// short brain (an iPhone SE) the numbers overlap, so only the
					// lit regions get numbered; the list below shows all six.
					if (!numberAll && !lit && !isLinked) continue;
					// Labels point inward, so the outer ones never leave the screen.
					const dir = p.x > width * 0.62 ? -1 : 1;
					const num = String(i + 1).padStart(2, "0");
					ctx.textAlign = dir < 0 ? "right" : "left";
					if (lit) {
						const name = (labelsRef.current[i] ?? "").toUpperCase();
						const text = dir < 0 ? `${name}  ${num}` : `${num}  ${name}`;
						const lead = 22;
						ctx.strokeStyle = `rgba(${IMPULSE_RGB}, 0.7)`;
						ctx.lineWidth = 1;
						ctx.beginPath();
						ctx.moveTo(p.x + dir * 7, p.y);
						ctx.lineTo(p.x + dir * lead, p.y);
						ctx.stroke();
						ctx.font = `700 11px ${labelFont}`;
						// A plate the colour of the medium keeps the name legible
						// over lit tissue without drawing a box around it.
						const w = ctx.measureText(text).width;
						const tx = p.x + dir * (lead + 6);
						ctx.fillStyle = `rgba(${MEDIUM_RGB}, 0.75)`;
						ctx.fillRect(dir < 0 ? tx - w - 5 : tx - 5, p.y - 10, w + 10, 20);
						ctx.fillStyle = `rgba(${IMPULSE_RGB}, 1)`;
						ctx.fillText(text, tx, p.y + 0.5);
						continue;
					}
					ctx.font = `500 10px ${monoFont}`;
					ctx.fillStyle = isLinked
						? `rgba(${IMPULSE_RGB}, 0.85)`
						: `rgba(${TISSUE_RGB}, 0.85)`;
					ctx.fillText(num, p.x + dir * 9, p.y);
				}
			}

			// On a short screen the tissue runs up under the hero's text: it
			// fades there instead of putting points on the letters.
			ctx.save();
			ctx.globalCompositeOperation = "destination-out";
			const fade = ctx.createLinearGradient(0, fadeTop - 40, 0, fadeTop + 16);
			fade.addColorStop(0, "rgba(0, 0, 0, 0.85)");
			fade.addColorStop(1, "rgba(0, 0, 0, 0)");
			ctx.fillStyle = fade;
			ctx.fillRect(0, 0, width, Math.max(0, fadeTop + 16));
			ctx.restore();

			// Contract with useSignalCord: viewport coordinates, because the
			// cord's SVG is `fixed`.
			const rect = canvas.getBoundingClientRect();
			const activeSpot = activeNow !== null && t >= 1 ? onScreen(activeNow) : null;
			if (activeSpot) {
				anchor.x = rect.left + activeSpot.x;
				anchor.y = rect.top + activeSpot.y;
				anchor.ready = true;
			} else {
				anchor.ready = false;
			}

			if (t >= 1 && !announced) {
				announced = true;
				onReadyRef.current();
			}

			frame += 1;
			raf = requestAnimationFrame(draw);
		};

		const startLoop = () => {
			if (!raf) raf = requestAnimationFrame(draw);
		};

		// Kicked off by the layout's startup script preload (same pattern as
		// desktop's .bin), so this usually arrives from cache.
		fetch(BRAIN2D_PATH)
			.then((r) => {
				if (!r.ok) throw new Error(`HTTP ${r.status}`);
				return r.arrayBuffer();
			})
			.then((buffer) => {
				if (!alive) return;
				brain = parseBrain2D(buffer);
				startLoop();
			})
			.catch((e) => {
				console.error("Could not load the 2D brain:", e);
				onReadyRef.current();
			});

		const visibilityObserver = new IntersectionObserver(
			([entry]) => {
				intersecting = entry.isIntersecting;
				if (isVisible()) startLoop();
			},
			{ threshold: 0 },
		);
		visibilityObserver.observe(canvas);

		const onVisibilityChange = () => {
			pageVisible = document.visibilityState !== "hidden";
			if (isVisible()) startLoop();
		};
		document.addEventListener("visibilitychange", onVisibilityChange);

		return () => {
			alive = false;
			if (raf) cancelAnimationFrame(raf);
			resizeObserver.disconnect();
			visibilityObserver.disconnect();
			document.removeEventListener("visibilitychange", onVisibilityChange);
			anchor.ready = false;
		};
	}, [anchorRef, sectionCount]);

	return <canvas ref={canvasRef} aria-hidden='true' className='h-full w-full' />;
};

export default NervousSystemMobile;
