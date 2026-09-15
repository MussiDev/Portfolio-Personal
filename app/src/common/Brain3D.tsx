"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { BIN_HEADER_SIZE, parseBinHeader, unpackVectors } from "./binFormat";
import { BRAIN_BIN_PATH, SNAPPED_ANCHORS } from "./brainAsset";

export type Section = {
	label: string;
	fact: string;
	summary: string;
	href: string;
	external?: boolean;
	step?: number;
};

const BASE_ROTATION = -Math.PI / 2;

const FOV = 38;
const MODEL_WIDTH = 2.6;

const Z_HERO = 3.6;
const Z_STEP = 4.3;
const SHIFT = 0.24;

const TISSUE = new THREE.Color(0x7c98be);
const IMPULSE = new THREE.Color(0xff6a3a);

const SPONTANEOUS = 120;

const Brain3D = ({
	sections,
	active,
	onActive,
	onGo,
	inHero,
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
	const pulseRef = useRef<SVGCircleElement>(null);
	const readoutRef = useRef<HTMLSpanElement>(null);

	const callbacksRef = useRef({ onProgress, onReady });
	callbacksRef.current = { onProgress, onReady };

	const activeRef = useRef<number | null>(active);
	activeRef.current = active;
	const inHeroRef = useRef(inHero);
	inHeroRef.current = inHero;

	const half = Math.ceil(sections.length / 2);
	const columns = useMemo(
		() => [sections.slice(0, half), sections.slice(half)],
		[sections, half],
	);

	useEffect(() => {
		const mount = mountRef.current;
		if (!mount) return;

		const reducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
		camera.position.set(0, 0.1, Z_HERO);

		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		const narrow = window.matchMedia("(max-width: 767px)").matches;
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, narrow ? 1.25 : 2));
		renderer.setClearColor(0x000000, 0);
		mount.appendChild(renderer.domElement);
		renderer.domElement.style.width = "100%";
		renderer.domElement.style.height = "100%";
		renderer.domElement.style.display = "block";

		const composer = new EffectComposer(renderer);
		composer.addPass(new RenderPass(scene, camera));
		const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.8, 0.3);
		composer.addPass(bloom);

		const group = new THREE.Group();
		group.position.y = -0.22;
		scene.add(group);

		let width = 0;
		let height = 0;
		let minZ = 0;
		const measure = () => {
			const rect = mount.getBoundingClientRect();
			if (!rect.width || !rect.height) return;
			width = rect.width;
			height = rect.height;
			minZ =
				MODEL_WIDTH /
				(2 * Math.tan((FOV * Math.PI) / 360) * (width / height));
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height, false);
			composer.setSize(width, height);
			bloom.resolution.set(width, height);
			svgRef.current?.setAttribute("viewBox", `0 0 ${width} ${height}`);
		};
		measure();
		camera.position.setZ(Math.max(Z_HERO, minZ));
		const resizeObserver = new ResizeObserver(() => {
			measure();
			mapSteps();
		});
		resizeObserver.observe(mount);

		let alive = true;
		let sparks: THREE.Points | null = null;
		let phases: number[] = [];

		let intersecting = true;
		let pageVisible = document.visibilityState !== "hidden";
		const isVisible = () => intersecting && pageVisible;

		const loadTissue = async (): Promise<ArrayBuffer | null> => {
			const response = await fetch(BRAIN_BIN_PATH);
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			if (!response.body) return response.arrayBuffer();

			const reader = response.body.getReader();
			const chunks: Uint8Array[] = [];
			let read = 0;
			let total = 0;

			for (;;) {
				const { done, value } = await reader.read();
				if (done) break;
				if (!alive) {
					await reader.cancel();
					return null;
				}
				chunks.push(value);
				read += value.length;

				if (!total && read >= BIN_HEADER_SIZE) {
					const headerBytes = new Uint8Array(BIN_HEADER_SIZE);
					let written = 0;
					for (const c of chunks) {
						const count = Math.min(c.length, BIN_HEADER_SIZE - written);
						headerBytes.set(c.subarray(0, count), written);
						written += count;
						if (written >= BIN_HEADER_SIZE) break;
					}
					const headerView = new DataView(headerBytes.buffer);
					total = BIN_HEADER_SIZE + (headerView.getUint32(4, true) + headerView.getUint32(8, true)) * 3 * 2;
				}
				if (total) callbacksRef.current.onProgress(Math.min(1, read / total));
			}

			const full = new Uint8Array(read);
			let cursor = 0;
			for (const c of chunks) {
				full.set(c, cursor);
				cursor += c.length;
			}
			callbacksRef.current.onProgress(1);
			return full.buffer;
		};

		loadTissue()
			.then((buffer) => {
				if (!alive || !buffer) return;

				const { pointCount, edgeCount, min, range } = parseBinHeader(buffer);
				const raw = new Uint16Array(buffer, BIN_HEADER_SIZE);

				const positions = unpackVectors(raw, 0, pointCount, min, range);
				const edges = unpackVectors(raw, pointCount * 3, edgeCount, min, range);

				const edgesGeo = new THREE.BufferGeometry();
				edgesGeo.setAttribute("position", new THREE.BufferAttribute(edges, 3));
				group.add(
					new THREE.LineSegments(
						edgesGeo,
						new THREE.LineBasicMaterial({
							color: TISSUE,
							transparent: true,
							opacity: 0.14,
							depthWrite: false,
							blending: THREE.AdditiveBlending,
						}),
					),
				);

				const cloud = new THREE.BufferGeometry();
				cloud.setAttribute("position", new THREE.BufferAttribute(positions, 3));
				group.add(
					new THREE.Points(
						cloud,
						new THREE.PointsMaterial({
							color: TISSUE,
							size: 0.008,
							sizeAttenuation: true,
							transparent: true,
							opacity: 0.6,
							depthWrite: false,
						}),
					),
				);

				const total = positions.length / 3;
				const sparkPositions = new Float32Array(SPONTANEOUS * 3);
				const sparkColors = new Float32Array(SPONTANEOUS * 3);
				phases = [];
				for (let i = 0; i < SPONTANEOUS; i += 1) {
					const k = Math.floor(Math.random() * total) * 3;
					phases.push(Math.random() * Math.PI * 2);
					sparkPositions[i * 3] = positions[k];
					sparkPositions[i * 3 + 1] = positions[k + 1];
					sparkPositions[i * 3 + 2] = positions[k + 2];
				}
				const sparksGeo = new THREE.BufferGeometry();
				sparksGeo.setAttribute(
					"position",
					new THREE.BufferAttribute(sparkPositions, 3),
				);
				sparksGeo.setAttribute("color", new THREE.BufferAttribute(sparkColors, 3));
				sparks = new THREE.Points(
					sparksGeo,
					new THREE.PointsMaterial({
						size: 0.03,
						sizeAttenuation: true,
						transparent: true,
						opacity: 0.95,
						vertexColors: true,
						depthWrite: false,
						blending: THREE.AdditiveBlending,
					}),
				);
				group.add(sparks);

				if (readoutRef.current) {
					readoutRef.current.textContent = `${sections.length} ${activityText}`;
				}

				requestAnimationFrame(() =>
					requestAnimationFrame(() => {
						if (alive) callbacksRef.current.onReady();
					}),
				);
			})
			.catch((e) => {
				console.error("Could not load the brain tissue:", e);
				callbacksRef.current.onReady();
			});

		const axonGeo = new THREE.BufferGeometry();
		axonGeo.setAttribute(
			"position",
			new THREE.BufferAttribute(new Float32Array(6), 3),
		);
		const axonMat = new THREE.LineBasicMaterial({
			color: IMPULSE,
			transparent: true,
			opacity: 0,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
		});
		scene.add(new THREE.Line(axonGeo, axonMat));

		const impulseGeo = new THREE.BufferGeometry();
		impulseGeo.setAttribute(
			"position",
			new THREE.BufferAttribute(new Float32Array(3), 3),
		);
		const impulseMat = new THREE.PointsMaterial({
			color: IMPULSE,
			size: 0.09,
			sizeAttenuation: true,
			transparent: true,
			opacity: 0,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
		});
		scene.add(new THREE.Points(impulseGeo, impulseMat));

		const pinGeo = new THREE.BufferGeometry();
		pinGeo.setAttribute(
			"position",
			new THREE.BufferAttribute(new Float32Array(3), 3),
		);
		const pinMat = new THREE.PointsMaterial({
			color: IMPULSE,
			size: 0.16,
			sizeAttenuation: true,
			transparent: true,
			opacity: 0,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
		});
		scene.add(new THREE.Points(pinGeo, pinMat));

		const vector = new THREE.Vector3();
		const anchorWorld = new THREE.Vector3();
		const blend = new THREE.Vector3();
		const aux = new THREE.Vector3();

		// Ya snapeados al tejido más cercano en build time
		// (scripts/prepare-brain.mjs, ver entities/brainAnchors.ts) — evita
		// recorrer ~30k puntos por anchor en cada carga del cliente.
		if (SNAPPED_ANCHORS.length !== sections.length) {
			console.warn(
				`brainAsset.ts tiene ${SNAPPED_ANCHORS.length} anchors pero hay ${sections.length} sections. ` +
					"Actualizá entities/brainAnchors.ts y corré `npm run brain`.",
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
				const el = document.getElementById(`paso-${section.step}`);
				if (el) steps.push({ index: i, el });
			});
		};
		mapSteps();
		const targetCamera = new THREE.Vector3();
		const targetLookAt = new THREE.Vector3();
		const currentLookAt = new THREE.Vector3(0, 0, 0);
		const colorAux = new THREE.Color();

		const drawCallouts = (rect: DOMRect) => {
			sections.forEach((_section, i) => {
				const line = calloutsRef.current[i];
				const target = targetsRef.current[i];
				const button = labelsRef.current[i];
				if (!line || !target || !button) return;

				vector
					.copy(anchors[i])
					.applyMatrix4(group.matrixWorld)
					.project(camera);
				const ax = (vector.x * 0.5 + 0.5) * rect.width;
				const ay = (-vector.y * 0.5 + 0.5) * rect.height;

				const b = button.getBoundingClientRect();
				const isLeft = i < half;
				const bx = (isLeft ? b.right : b.left) - rect.left;
				const by = b.top + b.height / 2 - rect.top;
				const elbow = isLeft ? bx + 26 : bx - 26;

				line.setAttribute("points", `${bx},${by} ${elbow},${by} ${ax},${ay}`);
				target.setAttribute("cx", String(ax));
				target.setAttribute("cy", String(ay));
			});
		};

		const publishAnchor = (rect: DOMRect, point: THREE.Vector3) => {
			vector.copy(point).project(camera);
			anchorRef.current.x = rect.left + (vector.x * 0.5 + 0.5) * rect.width;
			anchorRef.current.y = rect.top + (-vector.y * 0.5 + 0.5) * rect.height;
			anchorRef.current.ready = true;
		};

		let frame = 0;
		let progress = 0;
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
				width < 768
					? 0
					: Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
			shift += (target - shift) * (reducedMotion ? 1 : 0.08);
			if (width && height) {
				camera.setViewOffset(
					width,
					height,
					shift * width * SHIFT,
					0,
					width,
					height,
				);
			}

			group.updateMatrixWorld(true);

			if (sparks && !reducedMotion) {
				const col = sparks.geometry.getAttribute(
					"color",
				) as THREE.BufferAttribute;
				for (let i = 0; i < SPONTANEOUS; i += 1) {
					const f = (Math.sin(frame / 42 + phases[i]) + 1) / 2;
					const spike = Math.pow(f, 7);
					colorAux
						.copy(TISSUE)
						.lerp(IMPULSE, spike)
						.multiplyScalar(0.25 + spike);
					col.setXYZ(i, colorAux.r, colorAux.g, colorAux.b);
				}
				col.needsUpdate = true;
			}

			const zHero = Math.max(Z_HERO, minZ);
			const zStep = Math.max(Z_STEP, minZ);
			const z = zHero + (zStep - zHero) * shift;

			const vh = window.innerHeight;
			let weight = 0;
			blend.set(0, 0, 0);
			for (const { index, el } of steps) {
				const r = el.getBoundingClientRect();
				const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
				const w = visible / vh;
				if (w <= 0.001) continue;
				aux
					.copy(anchors[index])
					.applyMatrix4(group.matrixWorld)
					.multiplyScalar(w);
				blend.add(aux);
				weight += w;
			}
			const strength = Math.min(1, weight);
			if (weight > 0.001) blend.divideScalar(weight);

			const choosing = inHeroRef.current && activeNow !== null;

			if (choosing && activeNow !== null) {
				anchorWorld
					.copy(anchors[activeNow])
					.applyMatrix4(group.matrixWorld);
				targetLookAt.copy(anchorWorld);
				targetCamera
					.copy(anchorWorld)
					.normalize()
					.multiplyScalar(0.95)
					.add(anchorWorld)
					.setZ(Math.max(anchorWorld.z + z * 0.45, z * 0.45));
			} else {
				anchorWorld.copy(blend);
				targetCamera.set(0, 0.1, z);
				targetLookAt.copy(blend).multiplyScalar(0.28 * strength);
			}

			const settled = choosing ? 1 : strength;
			if (!reducedMotion) {
				group.rotation.y =
					BASE_ROTATION + Math.sin(frame / 260) * 0.28 * (1 - settled);
			}

			if (weight <= 0.001 && !choosing) {
				axonMat.opacity += (0 - axonMat.opacity) * 0.1;
				impulseMat.opacity += (0 - impulseMat.opacity) * 0.1;
				pinMat.opacity += (0 - pinMat.opacity) * 0.1;
				anchorRef.current.ready = false;
				progress = 0;
			} else {
				const pos = axonGeo.getAttribute("position") as THREE.BufferAttribute;
				pos.setXYZ(0, 0, group.position.y, 0);
				pos.setXYZ(1, anchorWorld.x, anchorWorld.y, anchorWorld.z);
				pos.needsUpdate = true;
				axonMat.opacity += (0.5 * settled - axonMat.opacity) * 0.1;

				const cp = pinGeo.getAttribute(
					"position",
				) as THREE.BufferAttribute;
				cp.setXYZ(0, anchorWorld.x, anchorWorld.y, anchorWorld.z);
				cp.needsUpdate = true;
				const beat = reducedMotion ? 0 : Math.sin(frame / 30) * 0.25;
				pinMat.opacity +=
					((0.75 + beat) * settled - pinMat.opacity) * 0.12;

				progress = reducedMotion ? 1 : (progress + 0.016) % 1;
				const ip = impulseGeo.getAttribute("position") as THREE.BufferAttribute;
				ip.setXYZ(
					0,
					anchorWorld.x * progress,
					group.position.y + (anchorWorld.y - group.position.y) * progress,
					anchorWorld.z * progress,
				);
				ip.needsUpdate = true;
				impulseMat.opacity =
					(reducedMotion ? 0.9 : Math.sin(progress * Math.PI)) * settled;

				const pulseEl = pulseRef.current;
				const line =
					activeNow !== null ? calloutsRef.current[activeNow] : null;
				const calloutPoints = line?.getAttribute("points")?.split(" ");
				if (pulseEl && calloutPoints?.length === 3) {
					const [p0, p1, p2] = calloutPoints.map((q) => q.split(",").map(Number));
					const [a, b] = progress < 0.35 ? [p0, p1] : [p1, p2];
					const u =
						progress < 0.35 ? progress / 0.35 : (progress - 0.35) / 0.65;
					pulseEl.setAttribute("cx", String(a[0] + (b[0] - a[0]) * u));
					pulseEl.setAttribute("cy", String(a[1] + (b[1] - a[1]) * u));
				}
			}

			const smooth = reducedMotion ? 1 : 0.085;
			camera.position.lerp(targetCamera, smooth);
			currentLookAt.lerp(targetLookAt, smooth);
			camera.lookAt(currentLookAt);

			composer.render();
			const rect = mount.getBoundingClientRect();
			if (inHeroRef.current) drawCallouts(rect);
			if (weight > 0.001 || choosing) publishAnchor(rect, anchorWorld);
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
			visibilityObserver.disconnect();
			document.removeEventListener("visibilitychange", onVisibilityChange);
			resizeObserver.disconnect();
			composer.dispose();
			renderer.dispose();
			if (renderer.domElement.parentNode === mount) {
				mount.removeChild(renderer.domElement);
			}
			scene.traverse((o) => {
				const m = o as THREE.Mesh;
				if (m.geometry) m.geometry.dispose();
				const mat = m.material as THREE.Material | THREE.Material[] | undefined;
				if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
				else mat?.dispose();
			});
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const renderLabel = (section: Section, i: number) => {
		const lit = active === i;
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
				className={`pointer-events-auto flex w-[13.5rem] flex-col gap-1 border-y py-2 transition-colors duration-300 ease-impulso ${
					isLeft ? "items-start text-left" : "items-end text-right"
				} ${
					lit
						? "border-y-impulso/40"
						: "border-y-transparent hover:border-y-sinapsis/25"
				}`}
			>
				<span
					className={`flex items-baseline gap-2 font-rotulo text-[13px] font-bold uppercase tracking-[.06em] transition-colors duration-300 ease-impulso ${
						isLeft ? "" : "flex-row-reverse"
					} ${lit ? "text-impulso" : "text-senal"}`}
				>
					<span
						className={`font-pieza text-[10px] tabular-nums ${
							lit ? "text-impulso" : "text-sinapsis"
						}`}
					>
						{String(i + 1).padStart(2, "0")}
					</span>
					{section.label}
				</span>
				<span className='font-pieza text-[10px] uppercase tracking-[.1em] text-mielina'>
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
				className={`pointer-events-none absolute inset-0 hidden h-full w-full transition-opacity duration-700 ease-impulso md:block ${
					inHero ? "opacity-100" : "opacity-0"
				}`}
				preserveAspectRatio='none'
				aria-hidden='true'
			>
				{sections.map((s, i) => (
					<g key={s.href + s.label}>
						<polyline
							ref={(n) => {
								calloutsRef.current[i] = n;
							}}
							fill='none'
							stroke={active === i ? "rgb(255 106 58)" : "rgb(124 152 190)"}
							strokeOpacity={active === i ? 0.85 : active === null ? 0.3 : 0.08}
							strokeWidth={active === i ? 1.4 : 1}
						/>
						<circle
							ref={(n) => {
								targetsRef.current[i] = n;
							}}
							r={active === i ? 5 : 2.5}
							fill='none'
							stroke={active === i ? "rgb(255 106 58)" : "rgb(124 152 190)"}
							strokeOpacity={active === i ? 0.9 : active === null ? 0.5 : 0.1}
							strokeWidth={1.2}
						/>
					</g>
				))}
				{active !== null && inHero && (
					<circle ref={pulseRef} r={3.5} fill='rgb(255 106 58)' />
				)}
			</svg>

			<nav
				aria-label={navLabel}
				className={`absolute inset-0 z-10 hidden items-center justify-between px-8 transition-opacity duration-700 ease-impulso md:flex lg:px-14 ${
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
				className={`pointer-events-none absolute bottom-6 right-5 z-20 flex items-center gap-2 transition-opacity duration-500 ease-impulso md:right-10 ${
					inHero ? "opacity-100" : "opacity-0"
				}`}
			>
				<span className='h-1.5 w-1.5 animate-respirar rounded-full bg-sinapsis' />
				<span
					ref={readoutRef}
					className='font-pieza text-[10px] uppercase tracking-[.18em] text-mielina'
				>
					{loadingText}
				</span>
			</div>
		</>
	);
};

export default Brain3D;
