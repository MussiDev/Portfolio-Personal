"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { BIN_HEADER_SIZE, parseBinHeader, unpackVectors } from "./binFormat";
import { BRAIN_BIN_PATH, SNAPPED_ANCHORS } from "./brainAsset";
import { aPantalla, pesosVisibles, puntosDelCallout } from "./brainLayout";
import { crearEscenaDelCerebro } from "./brainScene";
import { relatedTo } from "./relations";
import { leerTejido } from "./tissueLoader";
import { easeOutCubic, revealCounts } from "./tissueReveal";

export type Section = {
	label: string;
	fact: string;
	summary: string;
	href: string;
	external?: boolean;
	step?: number;
	/** Índices (en el array `sections`) de otras secciones con las que esta
	 * tiene una relación real de contenido — no decorativa. Ver page.tsx
	 * para qué conexiones existen y por qué. */
	related?: number[];
};

const BASE_ROTATION = -Math.PI / 2;


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
	const connectionsRef = useRef<(SVGLineElement | null)[]>([]);
	const pulseRef = useRef<SVGCircleElement>(null);
	const readoutRef = useRef<HTMLSpanElement>(null);

	// El efecto de WebGL corre una sola vez y su loop de rAF necesita leer los
	// valores vivos, no los del primer render: de ahí los refs. La sync va en
	// un efecto y no en el cuerpo del render — escribir un ref durante el
	// render es un side effect en fase de render, que con renders concurrentes
	// puede ejecutarse dos veces o descartarse. Un frame de diferencia es
	// invisible a 60fps.
	const callbacksRef = useRef({ onProgress, onReady });
	const activeRef = useRef<number | null>(active);
	const inHeroRef = useRef(inHero);
	useEffect(() => {
		callbacksRef.current = { onProgress, onReady };
		activeRef.current = active;
		inHeroRef.current = inHero;
	});

	const half = Math.ceil(sections.length / 2);
	const columns = useMemo(
		() => [sections.slice(0, half), sections.slice(half)],
		[sections, half],
	);

	// Pares únicos [i, j] con relación real de contenido (ver Section.related
	// en page.tsx) — computado acá para que el JSX sepa cuántas <line> pintar,
	// y de nuevo (idéntico, sections no cambia tras el mount) dentro del
	// efecto de WebGL, que no puede depender de este valor de render.
	//
	// Por relatedTo y no leyendo `related` directo: una relación declarada en
	// un solo sentido (B dice conocer a A, pero A no lo dice) se perdía con
	// el filtro `j > i`, y entonces la etiqueta se iluminaba sin que hubiera
	// una línea que la conectara — la promesa rota otra vez, al revés.
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

		// Toda la infraestructura de render (renderer, composer, cámara, bloom
		// diferido, medición y disposal) vive en brainScene.ts. Acá queda la
		// navegación: scroll-spy, callouts y el loop que los coordina.
		const escena = crearEscenaDelCerebro(mount, (ancho, alto) => {
			svgRef.current?.setAttribute("viewBox", `0 0 ${ancho} ${alto}`);
		});
		const { scene, camera, group } = escena;

		let bloomIdle = 0;

		const resizeObserver = new ResizeObserver(() => {
			escena.medir();
			mapSteps();
			measureLayout();
		});
		resizeObserver.observe(mount);

		let alive = true;
		let sparks: THREE.Points | null = null;
		let phases: number[] = [];
		let revealRaf = 0;

		let intersecting = true;
		let pageVisible = document.visibilityState !== "hidden";
		const isVisible = () => intersecting && pageVisible;

		// El streaming, el header partido entre chunks y el progreso viven en
		// tissueLoader.ts, con sus propios tests. Acá queda solo lo que de
		// verdad necesita WebGL.
		leerTejido(BRAIN_BIN_PATH, {
			sigueVivo: () => alive,
			onProgress: (fraccion) => {
				callbacksRef.current.onProgress(fraccion);
				if (readoutRef.current) {
					readoutRef.current.textContent = `${loadingText} · ${Math.round(fraccion * 100)}%`;
				}
			},
		})
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

				// El tejido se construye a la vista: los puntos aparecen primero,
				// las aristas se tienden después (drawRange crece sin tocar los
				// buffers ya parseados), y recién cuando termina se avisa onReady
				// — que dispara el barrido naranja en NervousSystem. Con
				// reduced-motion salta directo al estado final.
				cloud.setDrawRange(0, reducedMotion ? pointCount : 0);
				edgesGeo.setDrawRange(0, reducedMotion ? edgeCount : 0);

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
				sparks.visible = reducedMotion;
				group.add(sparks);

				const finish = () => {
					if (readoutRef.current) {
						readoutRef.current.textContent = `${sections.length} ${activityText}`;
					}
					if (alive) callbacksRef.current.onReady();
					// En idle: compilar los shaders del bloom justo cuando el
					// velo se levanta metería un tirón en el primer frame que
					// el usuario llega a ver. El timeout evita que se posponga
					// para siempre si la página nunca queda ociosa.
					if (typeof requestIdleCallback === "function") {
						bloomIdle = requestIdleCallback(escena.encenderBloom, { timeout: 2000 });
					} else {
						bloomIdle = window.setTimeout(escena.encenderBloom, 300);
					}
				};

				if (reducedMotion) {
					requestAnimationFrame(() => requestAnimationFrame(finish));
				} else {
					const REVEAL_MS = 900;
					const start = performance.now();
					const step = (now: number) => {
						if (!alive) return;
						const t = Math.min(1, (now - start) / REVEAL_MS);
						const { points, edges } = revealCounts(easeOutCubic(t), pointCount, edgeCount);
						cloud.setDrawRange(0, points);
						edgesGeo.setDrawRange(0, edges);

						if (t < 1) {
							revealRaf = requestAnimationFrame(step);
						} else {
							cloud.setDrawRange(0, pointCount);
							edgesGeo.setDrawRange(0, edgeCount);
							if (sparks) sparks.visible = true;
							finish();
						}
					};
					revealRaf = requestAnimationFrame(step);
				}
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

		// Layout cacheado, refrescado solo en scroll/resize en vez de leído
		// con getBoundingClientRect() en cada frame de animate(): eso forzaba
		// hasta ~12 reflows sincrónicos por frame (uno por step visible, uno
		// por el mount, uno por cada botón de región) incluso con la página
		// completamente quieta.
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
		const colorAux = new THREE.Color();

		const anchorScreen = sections.map(() => ({ x: 0, y: 0 }));

		const drawCallouts = (rect: DOMRect) => {
			sections.forEach((_section, i) => {
				vector
					.copy(anchors[i])
					.applyMatrix4(group.matrixWorld)
					.project(camera);
				const { x: ax, y: ay } = aPantalla(vector, rect);
				anchorScreen[i].x = ax;
				anchorScreen[i].y = ay;

				const line = calloutsRef.current[i];
				const target = targetsRef.current[i];
				const b = buttonRects[i];
				if (!line || !target || !b) return;

				line.setAttribute(
					"points",
					puntosDelCallout(b, { x: ax, y: ay }, rect, i < half),
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
				escena.ancho < 768
					? 0
					: Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
			shift += (target - shift) * (reducedMotion ? 1 : 0.08);
			if (escena.ancho && escena.alto) {
				camera.setViewOffset(
					escena.ancho,
					escena.alto,
					shift * escena.ancho * SHIFT,
					0,
					escena.ancho,
					escena.alto,
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

			const zHero = Math.max(Z_HERO, escena.zMinima);
			const zStep = Math.max(Z_STEP, escena.zMinima);
			const z = zHero + (zStep - zHero) * shift;

			// Qué tanto pesa cada paso es matemática pura y vive en
			// brainLayout.ts, con tests; acá queda solo mezclar los anclajes
			// en espacio de mundo, que sí necesita three.js.
			const { pesos, total: weight, fuerza: strength } = pesosVisibles(
				stepRects.map(({ index, rect: r }) => ({
					index,
					top: r.top,
					bottom: r.bottom,
				})),
				window.innerHeight,
			);
			blend.set(0, 0, 0);
			for (const { index, peso } of pesos) {
				aux
					.copy(anchors[index])
					.applyMatrix4(group.matrixWorld)
					.multiplyScalar(peso);
				blend.add(aux);
			}
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

			escena.render();
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
			if (revealRaf) cancelAnimationFrame(revealRaf);
			if (bloomIdle) {
				if (typeof cancelIdleCallback === "function") cancelIdleCallback(bloomIdle);
				else clearTimeout(bloomIdle);
			}
			if (scrollRequestId) cancelAnimationFrame(scrollRequestId);
			window.removeEventListener("scroll", onScroll);
			visibilityObserver.disconnect();
			document.removeEventListener("visibilitychange", onVisibilityChange);
			resizeObserver.disconnect();
			// Liberar GPU es responsabilidad de quien la tomó: la escena
			// destruye su renderer, su composer, el bloom y las geometrías.
			escena.destruir();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const vinculadas = useMemo(
		() => new Set(relatedTo(sections, active)),
		[active, sections],
	);

	/**
	 * Cuatro estados, no dos. El panel afirma "conectado con X · Y" y hasta
	 * ahora nada en pantalla lo mostraba: las vinculadas se apagaban igual
	 * que las ajenas (0.08), así que la conexión más valiosa del sitio era
	 * una línea naranja entre dos puntos anónimos del tejido. Con un nivel
	 * intermedio, el ojo puede recorrer el camino completo: etiqueta activa →
	 * su anclaje → conexión → anclaje vinculado → su etiqueta.
	 */
	const estado = (i: number): "activo" | "vinculado" | "reposo" | "ajeno" => {
		if (active === i) return "activo";
		if (vinculadas.has(i)) return "vinculado";
		return active === null ? "reposo" : "ajeno";
	};

	const renderLabel = (section: Section, i: number) => {
		const lit = active === i;
		const vinculado = vinculadas.has(i);
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
						: vinculado
							? "border-y-impulso/20"
							: "border-y-transparent hover:border-y-sinapsis/25"
				}`}
			>
				<span
					className={`flex items-baseline gap-2 font-rotulo text-[13px] font-bold uppercase tracking-[.06em] transition-colors duration-300 ease-impulso ${
						isLeft ? "" : "flex-row-reverse"
					} ${lit ? "text-impulso" : vinculado ? "text-impulso/65" : "text-senal"}`}
				>
					<span
						className={`font-pieza text-[10px] tabular-nums ${
							lit ? "text-impulso" : vinculado ? "text-impulso/50" : "text-sinapsis"
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
				{sections.map((s, i) => {
					// El callout y el target de una sección vinculada quedan en
					// naranja tenue: son el tramo del camino que va del anclaje a
					// su etiqueta. Sin esto la conexión moría dentro del tejido.
					const e = estado(i);
					const naranja = e === "activo" || e === "vinculado";
					return (
						<g key={s.href + s.label}>
							<polyline
								ref={(n) => {
									calloutsRef.current[i] = n;
								}}
								fill='none'
								stroke={naranja ? "rgb(255 106 58)" : "rgb(124 152 190)"}
								strokeOpacity={
									e === "activo"
										? 0.85
										: e === "vinculado"
											? 0.4
											: e === "reposo"
												? 0.3
												: 0.08
								}
								strokeWidth={e === "activo" ? 1.4 : 1}
								className='transition-[stroke-opacity] duration-300 ease-impulso'
							/>
							<circle
								ref={(n) => {
									targetsRef.current[i] = n;
								}}
								r={e === "activo" ? 5 : e === "vinculado" ? 3.5 : 2.5}
								fill='none'
								stroke={naranja ? "rgb(255 106 58)" : "rgb(124 152 190)"}
								strokeOpacity={
									e === "activo"
										? 0.9
										: e === "vinculado"
											? 0.6
											: e === "reposo"
												? 0.5
												: 0.1
								}
								strokeWidth={1.2}
								className='transition-[stroke-opacity] duration-300 ease-impulso'
							/>
						</g>
					);
				})}
				{connectionPairs.map(([a, b], k) => (
					// animate-conduccion (la misma del cordón de señal) hace que
					// el guionado corra a lo largo de la línea: la conexión deja
					// de ser una raya punteada y pasa a leerse como algo que
					// viaja de una región a la otra.
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
						className='animate-conduccion transition-opacity duration-300 ease-impulso'
					/>
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
