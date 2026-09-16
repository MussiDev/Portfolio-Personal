"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";

import { buildTissue } from "./mobileTissue";
import { easeOutCubic, revealCounts } from "./tissueReveal";

/**
 * El sistema nervioso en mobile: canvas 2D, no three.js.
 *
 * Antes esto era un SVG de seis círculos fijos. Era barato y honesto en
 * cuanto a performance, pero el concepto del sitio — el tejido que se
 * construye, los nodos que respiran, el impulso que baja hasta la sección
 * — simplemente no existía debajo de 768px. La decisión de d3d9cb0 (no
 * descargar three.js en mobile) sigue en pie: lo que cambia es el
 * sustituto, no la decisión.
 *
 * Misma curva de construcción que el cerebro 3D (`revealCounts` +
 * `easeOutCubic`, ya testeadas) y mismo contrato de anchor: publica en
 * `anchorRef` la posición en pantalla del nodo de la sección activa, que
 * es lo que `useSignalCord` necesita para tender el cordón hasta el badge
 * numerado. Una sola implementación del cordón para los dos breakpoints.
 *
 * El canvas es decoración: aria-hidden. La navegación real de mobile es
 * el <nav> de HeroSection, con links de verdad que funcionan sin JS.
 */

const POINTS = 900;
const SPARKS = 16;
const REVEAL_MS = 900;

const TISSUE_RGB = "124, 152, 190";
const IMPULSE_RGB = "255, 106, 58";

type Anchor = { x: number; y: number; ready: boolean };

const NervousSystemMobile = ({
	sectionCount,
	active,
	anchorRef,
	onReady,
}: {
	sectionCount: number;
	active: number | null;
	anchorRef: MutableRefObject<Anchor>;
	onReady: () => void;
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const tissue = useMemo(
		() => buildTissue(POINTS, sectionCount),
		[sectionCount],
	);

	// El loop lee el valor vivo por ref: rehacer el efecto en cada cambio de
	// sección reiniciaría la construcción del tejido desde cero. La sync va
	// en un efecto, no en el cuerpo del render — escribir un ref durante el
	// render es un side effect en fase de render, que con renders
	// concurrentes puede correr dos veces o descartarse. El frame de lag que
	// introduce es invisible en un loop de rAF.
	const activeRef = useRef<number | null>(active);
	const onReadyRef = useRef(onReady);
	useEffect(() => {
		activeRef.current = active;
		onReadyRef.current = onReady;
	});

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		// El objeto anchor se captura una vez: su identidad no cambia (el ref
		// se crea una sola vez en NervousSystem y solo se mutan sus campos),
		// y leer anchorRef.current recién en el cleanup es justo el patrón
		// que react-hooks advierte.
		const anchor = anchorRef.current;
		// Sin contexto 2D no hay nada que dibujar, pero el velo de
		// NervousSystem sigue esperando esta señal: sin avisar, mobile se
		// queda ocho segundos en negro por una decoración que falló.
		if (!canvas || !ctx) {
			onReadyRef.current();
			return;
		}

		const reducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		let width = 0;
		let height = 0;
		const measure = () => {
			const rect = canvas.getBoundingClientRect();
			if (!rect.width || !rect.height) return;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			width = rect.width;
			height = rect.height;
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		measure();
		const resizeObserver = new ResizeObserver(measure);
		resizeObserver.observe(canvas);

		// Cuadrado (normalizado es [0,1]²: estirarlo al contenedor vertical lo
		// deformaría), ubicado en el tercio superior y NO centrado en el alto:
		// el <nav> del hero ocupa el fondo de la pantalla, y un tejido
		// centrado en 100svh queda mitad detrás de la lista.
		const box = () => {
			const size = Math.min(width * 0.94, height * 0.48);
			return { size, ox: (width - size) / 2, oy: height * 0.17 };
		};

		const { points, edges, nodes } = tissue;
		const pointCount = points.length / 2;
		const edgeCount = edges.length / 2;

		const sparkIndex: number[] = [];
		const sparkPhase: number[] = [];
		for (let i = 0; i < SPARKS; i += 1) {
			sparkIndex.push(Math.floor((i / SPARKS) * pointCount));
			sparkPhase.push((i / SPARKS) * Math.PI * 2);
		}

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
			if (!start) start = now;
			if (!width || !height) {
				raf = requestAnimationFrame(draw);
				return;
			}

			const t = reducedMotion ? 1 : Math.min(1, (now - start) / REVEAL_MS);
			const shown = revealCounts(easeOutCubic(t), pointCount, edgeCount);
			const { size, ox, oy } = box();
			const px = (i: number) => ox + points[i * 2] * size;
			const py = (i: number) => oy + points[i * 2 + 1] * size;

			ctx.clearRect(0, 0, width, height);

			ctx.strokeStyle = `rgba(${TISSUE_RGB}, 0.13)`;
			ctx.lineWidth = 1;
			ctx.beginPath();
			for (let e = 0; e < shown.edges; e += 2) {
				ctx.moveTo(ox + edges[e * 2] * size, oy + edges[e * 2 + 1] * size);
				ctx.lineTo(ox + edges[e * 2 + 2] * size, oy + edges[e * 2 + 3] * size);
			}
			ctx.stroke();

			ctx.fillStyle = `rgba(${TISSUE_RGB}, 0.55)`;
			for (let i = 0; i < shown.points; i += 1) {
				ctx.fillRect(px(i) - 0.75, py(i) - 0.75, 1.5, 1.5);
			}

			// Chispas espontáneas: mismo gesto que los 120 sparks del cerebro
			// 3D (pow(f, 7) da destellos breves y separados, no un latido
			// uniforme), en menor cantidad porque acá se ven más grandes.
			if (!reducedMotion && t >= 1) {
				for (let i = 0; i < SPARKS; i += 1) {
					const f = (Math.sin(frame / 42 + sparkPhase[i]) + 1) / 2;
					const spike = f ** 7;
					if (spike < 0.02) continue;
					const k = sparkIndex[i];
					// Chicas a propósito: si crecen, compiten con los nodos de
					// sección y el usuario cuenta doce destinos donde hay seis.
					ctx.fillStyle = `rgba(${IMPULSE_RGB}, ${spike * 0.8})`;
					ctx.beginPath();
					ctx.arc(px(k), py(k), 1.1, 0, Math.PI * 2);
					ctx.fill();
				}
			}

			// Nodos de sección: respiran siempre, y el activo se enciende.
			const activeNow = activeRef.current;
			nodes.forEach((k, i) => {
				// El nodo no puede existir antes que el punto del tejido sobre
				// el que está apoyado.
				if (k >= shown.points) return;
				const lit = activeNow === i;
				const breath = reducedMotion
					? 0.7
					: 0.45 + 0.55 * ((Math.sin(frame / 48 + i * 1.7) + 1) / 2);
				const x = px(k);
				const y = py(k);

				// Anillo + punto, como los targets de los callouts en desktop:
				// es lo que separa "destino" de "chispa del tejido". Un punto
				// más grande no alcanzaba — se leía como ruido más gordo.
				if (lit) {
					ctx.fillStyle = `rgba(${IMPULSE_RGB}, 0.16)`;
					ctx.beginPath();
					ctx.arc(x, y, 13, 0, Math.PI * 2);
					ctx.fill();
				}
				ctx.strokeStyle = lit
					? `rgba(${IMPULSE_RGB}, 0.9)`
					: `rgba(${TISSUE_RGB}, ${0.35 + breath * 0.3})`;
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.arc(x, y, lit ? 7 : 5, 0, Math.PI * 2);
				ctx.stroke();

				ctx.fillStyle = lit
					? `rgba(${IMPULSE_RGB}, 1)`
					: `rgba(${TISSUE_RGB}, ${breath})`;
				ctx.beginPath();
				ctx.arc(x, y, lit ? 3 : 2, 0, Math.PI * 2);
				ctx.fill();
			});

			// Contrato con useSignalCord: coordenadas de viewport, porque el
			// SVG del cordón es `fixed`. El canvas es sticky a top:0, así que
			// hay que sumarle su offset real, no asumir 0.
			const rect = canvas.getBoundingClientRect();
			if (activeNow !== null && activeNow < nodes.length && t >= 1) {
				anchor.x = rect.left + px(nodes[activeNow]);
				anchor.y = rect.top + py(nodes[activeNow]);
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
		startLoop();

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
	}, [tissue, anchorRef]);

	return (
		<canvas
			ref={canvasRef}
			aria-hidden='true'
			className='h-full w-full'
		/>
	);
};

export default NervousSystemMobile;
