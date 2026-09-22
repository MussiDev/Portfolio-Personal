"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

/**
 * A Mermaid diagram at its real size, with horizontal scroll if it doesn't
 * fit — on purpose: shrinking it down to the column's width makes it
 * unreadable.
 *
 * Three things it was missing that weren't visible from the mouse:
 * - Accessible name. It had role="img" with no label: a screen reader
 *   announced "image" and nothing else.
 * - Keyboard focus when it overflows. A zone that scrolls and can't be
 *   focused leaves the rest of the diagram out of reach without a mouse or
 *   trackpad (WCAG 2.1.1).
 * - A hint that there's more to the right: a gradient on the edge and a
 *   "scroll to see". They only appear when it actually overflows.
 */
const BlueprintDiagram = ({
	code,
	label,
	hint,
}: {
	code: string;
	/** What the diagram is, for anyone who can't see it. */
	label: string;
	/** Visible text when the diagram is wider than the column. */
	hint: string;
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const id = useId().replace(/:/g, "");
	const [error, setError] = useState(false);
	const [overflow, setOverflow] = useState({ has: false, atStart: true, atEnd: true });

	const measure = useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;
		setOverflow({
			has: el.scrollWidth > el.clientWidth + 1,
			atStart: el.scrollLeft <= 1,
			atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1,
		});
	}, []);

	// The width changes with the viewport and when Mermaid finishes drawing;
	// ResizeObserver covers both (it also fires as soon as it starts observing).
	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		if (ref.current) observer.observe(ref.current);
		return () => observer.disconnect();
	}, [measure]);

	useEffect(() => {
		let cancelled = false;

		import("mermaid").then(async ({ default: mermaid }) => {
			if (cancelled) return;

			const root = getComputedStyle(document.documentElement);
			const channel = (name: string, fallback: string) =>
				root.getPropertyValue(name).trim() || fallback;

			const signalColor = `rgb(${channel("--signal", "232 237 245")})`;
			const membraneColor = `rgb(${channel("--membrane", "12 17 26")})`;
			const synapseChannels = channel("--synapse", "109 140 180");
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
					fontFamily: "var(--font-mono), SFMono-Regular, Consolas, monospace",
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
				measure();
			} catch {
				if (!cancelled) setError(true);
			}
		});

		return () => {
			cancelled = true;
		};
	}, [code, id, measure]);

	if (error) return null;

	return (
		<div className='flex flex-col gap-2'>
			<div className='relative'>
				<div
					ref={scrollRef}
					onScroll={measure}
					role='img'
					aria-label={label}
					// Focusable only if there's something to scroll: a tab stop
					// that does nothing is noise for keyboard navigation.
					tabIndex={overflow.has ? 0 : undefined}
					// px-3 when narrow: on mobile the diagram already reflows
					// vertically to fit, and with px-5 it overflowed by 14px of
					// pure padding — enough to show a hint and a gradient that
					// covered text.
					className='overflow-x-auto border border-synapse/30 bg-membrane-deep px-3 py-6 text-center sm:px-5'
				>
					<div ref={ref} />
				</div>
				{overflow.has && !overflow.atStart && (
					<div
						aria-hidden='true'
						className='pointer-events-none absolute inset-y-px left-px w-12 bg-gradient-to-r from-membrane-deep to-transparent'
					/>
				)}
				{overflow.has && !overflow.atEnd && (
					<div
						aria-hidden='true'
						className='pointer-events-none absolute inset-y-px right-px w-16 bg-gradient-to-l from-membrane-deep to-transparent'
					/>
				)}
			</div>
			{overflow.has && (
				<p className='m-0 font-mono text-[10px] uppercase tracking-[.14em] text-myelin'>
					{hint}
				</p>
			)}
		</div>
	);
};

export default BlueprintDiagram;
