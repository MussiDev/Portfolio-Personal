"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Un plano: diagrama Mermaid dibujado como plano de ingeniería, no como
 * gráfico de presentación. Sin relleno, trazo fino en tinta de línea,
 * tipografía de pieza — el mismo aparato de dibujo que usan las cotas.
 *
 * Mermaid carga en cliente y solo bajo demanda: es la única concesión de
 * peso que hace el mecanismo, y entra lazy para no pagarla en el resto
 * del taller (ver el descartado de Three.js en la mesa — misma regla).
 */
const PlanoDiagrama = ({ codigo }: { codigo: string }) => {
	const ref = useRef<HTMLDivElement>(null);
	const id = useId().replace(/:/g, "");
	const [error, setError] = useState(false);

	useEffect(() => {
		let cancelado = false;

		import("mermaid").then(async ({ default: mermaid }) => {
			if (cancelado) return;

			mermaid.initialize({
				startOnLoad: false,
				theme: "base",
				themeVariables: {
					background: "transparent",
					primaryColor: "transparent",
					primaryBorderColor: "rgb(47, 92, 126)",
					primaryTextColor: "rgb(31, 33, 36)",
					lineColor: "rgb(47, 92, 126)",
					secondaryColor: "transparent",
					tertiaryColor: "transparent",
					fontFamily: "var(--font-pieza), SFMono-Regular, Consolas, monospace",
					fontSize: "13px",
					edgeLabelBackground: "rgb(247, 246, 241)",
				},
				flowchart: { curve: "linear", padding: 12 },
			});

			try {
				const { svg } = await mermaid.render(`plano-${id}`, codigo);
				if (cancelado || !ref.current) return;
				ref.current.innerHTML = svg;

				// Mermaid graba width="100%" en el propio <svg>: sin esto se
				// encoge al ancho del celular y el texto se vuelve ilegible.
				// El viewBox ya trae el tamaño real del plano; se lo devolvemos.
				const dibujo = ref.current.querySelector("svg");
				const caja = dibujo?.viewBox.baseVal;
				if (dibujo && caja) {
					dibujo.removeAttribute("width");
					dibujo.removeAttribute("height");
					dibujo.style.width = `${caja.width}px`;
					dibujo.style.height = `${caja.height}px`;
					dibujo.style.maxWidth = "none";
				}
			} catch {
				if (!cancelado) setError(true);
			}
		});

		return () => {
			cancelado = true;
		};
	}, [codigo, id]);

	if (error) return null;

	return (
		// Tamaño natural, no encogido: un plano con texto ilegible no es un
		// plano. En pantallas angostas se recorre igual que el bloque de
		// código de al lado — con scroll horizontal, no con una lupa.
		<div
			ref={ref}
			role='img'
			className='overflow-x-auto border border-linea/30 bg-hoja-honda px-5 py-6 text-center'
		/>
	);
};

export default PlanoDiagrama;
