"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

/**
 * Un diagrama de Mermaid a su tamaño real, con scroll horizontal si no
 * entra — a propósito: achicarlo hasta el ancho de la columna lo vuelve
 * ilegible.
 *
 * Tres cosas que le faltaban y que no se veían desde el mouse:
 * - Nombre accesible. Tenía role="img" sin etiqueta: un lector de pantalla
 *   anunciaba "imagen" y nada más.
 * - Foco por teclado cuando desborda. Una zona que scrollea y no se puede
 *   enfocar deja el resto del diagrama fuera de alcance sin mouse ni
 *   trackpad (WCAG 2.1.1).
 * - Una pista de que hay más a la derecha: un degradé en el borde y un
 *   "deslizá". Solo aparecen cuando de verdad desborda.
 */
const BlueprintDiagram = ({
	code,
	label,
	pista,
}: {
	code: string;
	/** Qué es el diagrama, para quien no lo ve. */
	label: string;
	/** Texto visible cuando el diagrama es más ancho que la columna. */
	pista: string;
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const id = useId().replace(/:/g, "");
	const [error, setError] = useState(false);
	const [desborde, setDesborde] = useState({ hay: false, alInicio: true, alFinal: true });

	const medir = useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;
		setDesborde({
			hay: el.scrollWidth > el.clientWidth + 1,
			alInicio: el.scrollLeft <= 1,
			alFinal: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
		});
	}, []);

	// El ancho cambia con el viewport y cuando Mermaid termina de dibujar;
	// ResizeObserver cubre los dos (también dispara al empezar a observar).
	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		const observer = new ResizeObserver(medir);
		observer.observe(el);
		if (ref.current) observer.observe(ref.current);
		return () => observer.disconnect();
	}, [medir]);

	useEffect(() => {
		let cancelled = false;

		import("mermaid").then(async ({ default: mermaid }) => {
			if (cancelled) return;

			const root = getComputedStyle(document.documentElement);
			const channel = (name: string, fallback: string) =>
				root.getPropertyValue(name).trim() || fallback;

			const signalColor = `rgb(${channel("--senal", "232 237 245")})`;
			const membraneColor = `rgb(${channel("--membrana", "12 17 26")})`;
			const synapseChannels = channel("--sinapsis", "109 140 180");
			const synapseColor = `rgb(${synapseChannels})`;
			const synapseFaint = `rgb(${synapseChannels} / 0.45)`;

			mermaid.initialize({
				startOnLoad: false,
				theme: "base",
				themeVariables: {
					background: "transparent",
					primaryColor: "transparent",
					primaryBorderColor: synapseColor,
					primaryTextColor: signalColor,
					lineColor: synapseColor,
					secondaryColor: "transparent",
					tertiaryColor: "transparent",
					textColor: signalColor,
					nodeTextColor: signalColor,
					titleColor: signalColor,
					clusterBkg: "transparent",
					clusterBorder: synapseFaint,
					fontFamily: "var(--font-pieza), SFMono-Regular, Consolas, monospace",
					fontSize: "13px",
					edgeLabelBackground: membraneColor,
				},
				flowchart: { curve: "linear", padding: 12 },
			});

			const narrow = (ref.current?.clientWidth ?? 0) < 520;
			const source = narrow
				? code
						.replace(/^(\s*)flowchart\s+(LR|RL)/m, "$1flowchart TB")
						.replace(/^(\s*)graph\s+(LR|RL)/m, "$1graph TB")
						.replace(/\bdirection\s+(LR|RL)\b/g, "direction TB")
				: code;

			try {
				const { svg } = await mermaid.render(`blueprint-${id}`, source);
				if (cancelled || !ref.current) return;
				ref.current.innerHTML = svg;

				const svgEl = ref.current.querySelector("svg");
				const box = svgEl?.viewBox.baseVal;
				if (svgEl && box) {
					svgEl.removeAttribute("width");
					svgEl.removeAttribute("height");
					svgEl.style.width = `${box.width}px`;
					svgEl.style.height = `${box.height}px`;
					svgEl.style.maxWidth = "none";
				}
				medir();
			} catch {
				if (!cancelled) setError(true);
			}
		});

		return () => {
			cancelled = true;
		};
	}, [code, id, medir]);

	if (error) return null;

	return (
		<div className='flex flex-col gap-2'>
			<div className='relative'>
				<div
					ref={scrollRef}
					onScroll={medir}
					role='img'
					aria-label={label}
					// Enfocable solo si hay algo que scrollear: un tab stop que no
					// hace nada es ruido para quien navega con teclado.
					tabIndex={desborde.hay ? 0 : undefined}
					// px-3 en angosto: en mobile el diagrama ya se reordena en vertical
					// para entrar, y con px-5 desbordaba por 14px de puro relleno —
					// suficiente para mostrar una pista y un degradé que tapaban texto.
					className='overflow-x-auto border border-sinapsis/30 bg-membrana-honda px-3 py-6 text-center sm:px-5'
				>
					<div ref={ref} />
				</div>
				{desborde.hay && !desborde.alInicio && (
					<div
						aria-hidden='true'
						className='pointer-events-none absolute inset-y-px left-px w-12 bg-gradient-to-r from-membrana-honda to-transparent'
					/>
				)}
				{desborde.hay && !desborde.alFinal && (
					<div
						aria-hidden='true'
						className='pointer-events-none absolute inset-y-px right-px w-16 bg-gradient-to-l from-membrana-honda to-transparent'
					/>
				)}
			</div>
			{desborde.hay && (
				<p className='m-0 font-pieza text-[10px] uppercase tracking-[.14em] text-mielina'>
					{pista}
				</p>
			)}
		</div>
	);
};

export default BlueprintDiagram;
