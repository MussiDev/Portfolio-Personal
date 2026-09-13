"use client";

import { useEffect, useId, useRef, useState } from "react";

const BlueprintDiagram = ({ code }: { code: string }) => {
	const ref = useRef<HTMLDivElement>(null);
	const id = useId().replace(/:/g, "");
	const [error, setError] = useState(false);

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
			} catch {
				if (!cancelled) setError(true);
			}
		});

		return () => {
			cancelled = true;
		};
	}, [code, id]);

	if (error) return null;

	return (
		<div
			ref={ref}
			role='img'
			className='overflow-x-auto border border-sinapsis/30 bg-membrana-honda px-5 py-6 text-center'
		/>
	);
};

export default BlueprintDiagram;
