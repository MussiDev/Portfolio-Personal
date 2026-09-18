"use client";

import { useEffect, useRef, type MutableRefObject } from "react";

import { ANCHORS_2D, BRAIN2D_PATH } from "./brain2dAsset";
import { parseBrain2D, type Brain2D } from "./brain2dFormat";
import { easeOutCubic, revealCounts } from "./tissueReveal";

/**
 * El sistema nervioso en mobile: el mismo cerebro que desktop, en 2D.
 *
 * Mobile no descarga three.js ni el .bin de 466 KB (decisión de d3d9cb0).
 * El sustituto anterior era una silueta lobulada genérica con seis puntos:
 * algo orgánico, pero no un cerebro, y sin relación con las secciones. Esto
 * dibuja el cerebro real — la malla de desktop proyectada en vista lateral
 * en build (scripts/prepare-brain-2d.mjs), ~27 KB — y cada sección está en
 * su ancla real, la misma región que en desktop.
 *
 * Misma curva de construcción que el 3D (`revealCounts` + `easeOutCubic`) y
 * mismo contrato con `useSignalCord`: publica en `anchorRef` dónde está la
 * región activa en la pantalla, para tender el cordón hasta el badge del
 * paso.
 *
 * El canvas es decoración: aria-hidden. La navegación real de mobile es el
 * <nav> de HeroSection, con links de verdad que funcionan sin JS.
 */

const SPARKS = 18;
const REVEAL_MS = 900;
/** Aire entre el cerebro y el texto de arriba o la lista de abajo. */
const MARGEN = 18;
/** Alto de referencia para la densidad: a este tamaño se dibuja todo. */
const ALTO_REFERENCIA = 300;
/** Por debajo de este alto, los seis números se pisan entre sí. */
const ALTO_PARA_NUMERAR_TODO = 150;

const TISSUE_RGB = "124, 152, 190";
const IMPULSE_RGB = "255, 106, 58";

type Anchor = { x: number; y: number; ready: boolean };

const NervousSystemMobile = ({
	sectionCount,
	active,
	relaciones,
	anchorRef,
	onReady,
}: {
	sectionCount: number;
	active: number | null;
	/** relatedTo() de cada sección, en orden: las mismas conexiones reales
	 * que dibuja el cerebro de desktop. */
	relaciones: number[][];
	anchorRef: MutableRefObject<Anchor>;
	onReady: () => void;
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// El loop lee los valores vivos por ref: rehacer el efecto en cada cambio
	// de sección reiniciaría la construcción desde cero. La sync va en un
	// efecto, no en el render.
	const activeRef = useRef<number | null>(active);
	const relacionesRef = useRef(relaciones);
	const onReadyRef = useRef(onReady);
	useEffect(() => {
		activeRef.current = active;
		relacionesRef.current = relaciones;
		onReadyRef.current = onReady;
	});

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		// El objeto anchor se captura una vez: su identidad no cambia.
		const anchor = anchorRef.current;
		// Sin contexto 2D no hay nada que dibujar, pero el velo sigue
		// esperando esta señal: sin avisar, mobile quedaría ocho segundos en
		// negro por una decoración que falló.
		if (!canvas || !ctx) {
			onReadyRef.current();
			return;
		}

		if (ANCHORS_2D.length !== sectionCount) {
			console.warn(
				`brain2dAsset.ts tiene ${ANCHORS_2D.length} anclas y hay ${sectionCount} secciones. ` +
					"Corré `npm run brain:2d`.",
			);
		}

		// El canvas no entiende variables CSS: se resuelve el nombre real de la
		// familia que next/font registró para --font-pieza.
		const fuentePieza =
			getComputedStyle(document.documentElement).getPropertyValue("--font-pieza").trim() ||
			"monospace";
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		let width = 0;
		let height = 0;
		// La franja libre del hero en coordenadas de página (con el canvas
		// sticky arriba de todo, coinciden con las del canvas cuando el hero
		// está en pantalla).
		let banda: { top: number; bottom: number } | null = null;
		const desde = document.querySelector<HTMLElement>("[data-tejido-desde]");
		const hasta = document.querySelector<HTMLElement>("[data-tejido-hasta]");
		const measure = () => {
			const rect = canvas.getBoundingClientRect();
			if (!rect.width || !rect.height) return;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			width = rect.width;
			height = rect.height;
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			if (desde && hasta) {
				const y = window.scrollY;
				banda = {
					top: desde.getBoundingClientRect().bottom + y,
					bottom: hasta.getBoundingClientRect().top + y,
				};
			}
		};
		measure();
		const resizeObserver = new ResizeObserver(measure);
		resizeObserver.observe(canvas);
		// El texto del hero cambia de alto cuando cargan las fuentes o cuando
		// la frase se reparte en otra cantidad de líneas.
		if (desde) resizeObserver.observe(desde);
		if (hasta) resizeObserver.observe(hasta);

		// El cerebro entra en la franja libre entre el texto del hero y la
		// lista, sin deformarse: se limita por ancho o por alto según cuál se
		// acabe primero. Sin piso de tamaño — un piso lo metía debajo del
		// texto en pantallas bajas.
		const caja = (aspect: number) => {
			const libre = banda ?? { top: height * 0.17, bottom: height * 0.65 };
			const altoLibre = Math.max(0, libre.bottom - libre.top - MARGEN * 2);
			const ancho = Math.min(width * 0.94, altoLibre * aspect);
			const alto = ancho / aspect;
			return {
				ancho,
				alto,
				ox: (width - ancho) / 2,
				oy: libre.top + MARGEN + (altoLibre - alto) / 2,
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
			const { ancho, alto, ox, oy } = caja(aspect);
			const px = (x: number) => ox + x * ancho;
			const py = (y: number) => oy + y * alto;

			// Densidad constante: en una pantalla baja se dibuja un prefijo de
			// puntos y aristas (vienen mezclados de build, así que cualquier
			// prefijo es una muestra pareja). Todo en un cerebro chico se vería
			// como una mancha.
			const densidad = Math.min(1, Math.max(0.3, (alto / ALTO_REFERENCIA) ** 2));
			const totalPuntos = Math.round((points.length / 2) * densidad);
			const totalAristas = Math.round((edges.length / 4) * densidad);

			const t = reducedMotion ? 1 : Math.min(1, (now - start) / REVEAL_MS);
			// revealCounts trabaja con vértices de arista (de a pares).
			const shown = revealCounts(easeOutCubic(t), totalPuntos, totalAristas * 2);
			const aristasVisibles = shown.edges / 2;

			ctx.clearRect(0, 0, width, height);

			ctx.strokeStyle = `rgba(${TISSUE_RGB}, 0.2)`;
			ctx.lineWidth = 0.8;
			ctx.beginPath();
			for (let e = 0; e < aristasVisibles; e += 1) {
				const k = e * 4;
				ctx.moveTo(px(edges[k]), py(edges[k + 1]));
				ctx.lineTo(px(edges[k + 2]), py(edges[k + 3]));
			}
			ctx.stroke();

			ctx.fillStyle = `rgba(${TISSUE_RGB}, 0.6)`;
			for (let i = 0; i < shown.points; i += 1) {
				ctx.fillRect(px(points[i * 2]) - 0.6, py(points[i * 2 + 1]) - 0.6, 1.2, 1.2);
			}

			// Chispas espontáneas, el mismo gesto que los sparks del 3D:
			// pow(f, 7) da destellos breves y separados, no un latido parejo.
			if (!reducedMotion && t >= 1) {
				for (let i = 0; i < SPARKS; i += 1) {
					const f = (Math.sin(frame / 42 + (i / SPARKS) * Math.PI * 2) + 1) / 2;
					const spike = f ** 7;
					if (spike < 0.02) continue;
					const k = Math.floor((i / SPARKS) * totalPuntos) * 2;
					ctx.fillStyle = `rgba(${IMPULSE_RGB}, ${spike * 0.8})`;
					ctx.beginPath();
					ctx.arc(px(points[k]), py(points[k + 1]), 1.1, 0, Math.PI * 2);
					ctx.fill();
				}
			}

			// Las regiones: el mismo ancla que en desktop, tres estados como las
			// etiquetas de desktop — activa, vinculada (relación real de
			// contenido) y en reposo. Aparecen cuando el tejido ya se armó.
			const activeNow = activeRef.current;
			const vinculadas = new Set(
				activeNow !== null ? (relacionesRef.current[activeNow] ?? []) : [],
			);
			const enPantalla = (i: number) => {
				const a = ANCHORS_2D[i];
				return a ? { x: px(a[0]), y: py(a[1]) } : null;
			};

			const numerarTodas = alto >= ALTO_PARA_NUMERAR_TODO;

			if (t >= 0.7) {
				// Primero las conexiones, para que queden debajo de los nodos.
				const origen = activeNow !== null ? enPantalla(activeNow) : null;
				if (origen) {
					ctx.save();
					ctx.strokeStyle = `rgba(${IMPULSE_RGB}, 0.75)`;
					ctx.lineWidth = 1.2;
					ctx.setLineDash([3, 4]);
					// El guionado corre hacia afuera: se lee como señal que viaja.
					ctx.lineDashOffset = reducedMotion ? 0 : -frame * 0.35;
					for (const j of vinculadas) {
						const destino = enPantalla(j);
						if (!destino) continue;
						ctx.beginPath();
						ctx.moveTo(origen.x, origen.y);
						ctx.lineTo(destino.x, destino.y);
						ctx.stroke();
					}
					ctx.restore();
				}

				for (let i = 0; i < sectionCount; i += 1) {
					const p = enPantalla(i);
					if (!p) continue;
					const lit = activeNow === i;
					const vinculada = vinculadas.has(i);
					const breath = reducedMotion
						? 0.7
						: 0.45 + 0.55 * ((Math.sin(frame / 48 + i * 1.7) + 1) / 2);

					if (lit) {
						ctx.fillStyle = `rgba(${IMPULSE_RGB}, 0.18)`;
						ctx.beginPath();
						ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
						ctx.fill();
					}
					ctx.strokeStyle = lit
						? `rgba(${IMPULSE_RGB}, 0.95)`
						: vinculada
							? `rgba(${IMPULSE_RGB}, 0.65)`
							: `rgba(${TISSUE_RGB}, ${0.4 + breath * 0.3})`;
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.arc(p.x, p.y, lit ? 7 : vinculada ? 6 : 5, 0, Math.PI * 2);
					ctx.stroke();

					ctx.fillStyle = lit
						? `rgba(${IMPULSE_RGB}, 1)`
						: vinculada
							? `rgba(${IMPULSE_RGB}, 0.7)`
							: `rgba(${TISSUE_RGB}, ${breath})`;
					ctx.beginPath();
					ctx.arc(p.x, p.y, lit ? 3 : 2, 0, Math.PI * 2);
					ctx.fill();

					// El número de la sección, el mismo de la lista de abajo y de
					// las etiquetas de desktop: la leyenda del mapa. En un cerebro
					// bajo (un iPhone SE deja ~130px) los seis números se pisan
					// entre sí, así que se numeran solo las regiones encendidas;
					// la lista de abajo sigue mostrando los seis.
					if (!numerarTodas && !lit && !vinculada) continue;
					// A la izquierda del nodo si está pegado al borde derecho.
					const aLaIzquierda = p.x > width - 36;
					ctx.font = `500 10px ${fuentePieza}`;
					ctx.textBaseline = "middle";
					ctx.textAlign = aLaIzquierda ? "right" : "left";
					ctx.fillStyle = lit
						? `rgba(${IMPULSE_RGB}, 1)`
						: vinculada
							? `rgba(${IMPULSE_RGB}, 0.8)`
							: `rgba(${TISSUE_RGB}, 0.85)`;
					ctx.fillText(
						String(i + 1).padStart(2, "0"),
						aLaIzquierda ? p.x - 11 : p.x + 11,
						p.y,
					);
				}
			}

			// Contrato con useSignalCord: coordenadas de viewport, porque el SVG
			// del cordón es `fixed`.
			const rect = canvas.getBoundingClientRect();
			const activa = activeNow !== null && t >= 1 ? enPantalla(activeNow) : null;
			if (activa) {
				anchor.x = rect.left + activa.x;
				anchor.y = rect.top + activa.y;
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

		// Lo arranca el preload del script de arranque del layout (mismo
		// patrón que el .bin de desktop), así que esto suele llegar del caché.
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
