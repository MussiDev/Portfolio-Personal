"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { BRAIN_BIN_PATH, SNAPPED_ANCHORS } from "./brainAsset";
import {
	aPantalla,
	pesosVisibles,
	puntoSobreCallout,
	puntosDelCallout,
} from "./brainLayout";
import { crearMarcadores } from "./brainMarkers";
import { cloudRadius, walkTrace } from "./brainTrace";
import { crearTraza, type Traza } from "./brainTraceObject";
import { crearEscenaDelCerebro } from "./brainScene";
import { construirTejido, type Tejido } from "./brainTissue";
import { relatedTo } from "./relations";
import { leerTejido } from "./tissueLoader";

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
	/** The region's own page, language-agnostic ("/proyectos/nortear"). Only
	 * regions whose content has a URL of its own have one; escena.ts uses it
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

	// El efecto de WebGL corre una sola vez y su loop de rAF necesita leer los
	// valores vivos, no los del primer render: de ahí los refs. La sync va en
	// un efecto y no en el cuerpo del render — escribir un ref durante el
	// render es un side effect en fase de render, que con renders concurrentes
	// puede ejecutarse dos veces o descartarse. Un frame de diferencia es
	// invisible a 60fps.
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
		let tejido: Tejido | null = null;

		/**
		 * The decision trace, built the first time a case asks for one and
		 * rebuilt only if another region takes the focus. The walk costs one
		 * pass over the cloud per step, so it happens once — never per frame.
		 */
		let traza: Traza | null = null;
		let trazaDe: number | null = null;
		const mirada = new THREE.Vector3();
		const matrizInversa = new THREE.Matrix4();
		const asegurarTraza = (region: number) => {
			if (!tejido || trazaDe === region) return;
			traza?.destruir();
			const anchor = anchors[region] ?? anchors[0];
			// The camera's line of sight, expressed in the model's own space:
			// the walk uses it to stay in the plane the reader is looking at
			// instead of heading into depth, where six steps project as two.
			camera.getWorldDirection(mirada);
			matrizInversa.copy(group.matrixWorld).invert();
			mirada.transformDirection(matrizInversa).normalize();
			// One tenth of the radius per beat left the six steps knotted
			// around the anchor; at a fifth the trace crosses real tissue and
			// reads as a path.
			const paso = cloudRadius(tejido.posiciones) * 0.2;
			const ruta = walkTrace(
				tejido.posiciones,
				[anchor.x, anchor.y, anchor.z],
				BEATS,
				paso,
				[mirada.x, mirada.y, mirada.z],
			);
			traza = crearTraza(group, ruta, { reducedMotion });
			trazaDe = region;
		};

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
				// La geometría y su reveal viven en brainTissue.ts. Lo que queda acá
				// es la coordinación: avisar al hero que puede levantar el velo y
				// programar el bloom para después del primer frame útil.
				tejido = construirTejido(group, buffer, {
					reducedMotion,
					sigueVivo: () => alive,
					alTerminar: () => {
						if (readoutRef.current) {
							readoutRef.current.textContent = `${sections.length} ${activityText}`;
						}
						if (!alive) return;
						callbacksRef.current.onReady();
						// En idle: compilar los shaders del bloom justo cuando el velo
						// se levanta metería un tirón en el primer frame que el usuario
						// llega a ver. El timeout evita que se posponga para siempre si
						// la página nunca queda ociosa.
						if (typeof requestIdleCallback === "function") {
							bloomIdle = requestIdleCallback(escena.encenderBloom, { timeout: 2000 });
						} else {
							bloomIdle = window.setTimeout(escena.encenderBloom, 300);
						}
					},
				});
			})
			.catch((e) => {
				console.error("Could not load the brain tissue:", e);
				callbacksRef.current.onReady();
			});

		// Axón, impulso y pin: la señal que va hacia la región activa.
		const marcadores = crearMarcadores(scene, { reducedMotion });

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

			tejido?.latir(frame);


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

			// Two ways of holding a region: picking one in the hero, and
			// reading the case that belongs to it. Without the second, a case
			// left the camera in its wandering state and `settled` at 0, so
			// the axon, the pin and the trace all stayed invisible.
			const beatNow = beatRef.current;
			const leyendoCaso = beatNow !== null && activeNow !== null;
			const choosing = (inHeroRef.current || leyendoCaso) && activeNow !== null;

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
					.multiplyScalar(leyendoCaso ? 2.3 : 0.95)
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
			if (leyendoCaso && activeNow !== null) {
				asegurarTraza(activeNow);
				traza?.dibujar(beatNow, settled, frame);
			} else {
				traza?.dibujar(null, 0, frame);
			}
			if (!reducedMotion) {
				group.rotation.y =
					BASE_ROTATION + Math.sin(frame / 260) * 0.28 * (1 - settled);
			}

			if (weight <= 0.001 && !choosing) {
				marcadores.apagar();
				anchorRef.current.ready = false;
			} else {
				const progress = marcadores.apuntar(
					anchorWorld,
					group.position.y,
					settled,
					frame,
				);

				const pulseEl = pulseRef.current;
				const line =
					activeNow !== null ? calloutsRef.current[activeNow] : null;
				// El pulso del SVG recorre el callout sincronizado con el impulso
				// 3D; la interpolación sobre la polilínea está en brainLayout.
				const enCallout = puntoSobreCallout(line?.getAttribute("points"), progress);
				if (pulseEl && enCallout) {
					pulseEl.setAttribute("cx", String(enCallout.x));
					pulseEl.setAttribute("cy", String(enCallout.y));
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
			tejido?.cancelar();
			traza?.destruir();
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
				className={`pointer-events-none absolute inset-0 hidden h-full w-full transition-opacity duration-700 ease-impulso desk:block ${
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
				className={`absolute inset-0 z-10 hidden items-center justify-between px-8 transition-opacity duration-700 ease-impulso desk:flex lg:px-14 ${
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
