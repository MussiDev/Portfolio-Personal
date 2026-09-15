"use client";

import { useEffect, useState, type RefObject } from "react";

import type { Section } from "../common/Brain3D";

/**
 * Scroll-spy: qué [data-step] ocupa más viewport ahora mismo es la
 * sección activa. También prende el badge (.animate-disparo) de la
 * sección que se vuelve activa y lo apaga en la anterior.
 */
export const useActiveStep = (
	containerRef: RefObject<HTMLDivElement | null>,
	sections: Section[],
	setHover: (v: number | null) => void,
): number | null => {
	const [activeStep, setActiveStep] = useState<number | null>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const steps = Array.from(
			container.querySelectorAll<HTMLElement>("[data-step]"),
		);
		if (!steps.length) return;

		let requestId = 0;
		let litBadge: HTMLElement | null = null;
		const measure = () => {
			requestId = 0;
			const vh = window.innerHeight;
			let best: HTMLElement | null = null;
			let maxVisible = 0;
			for (const el of steps) {
				const r = el.getBoundingClientRect();
				const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
				if (visible > maxVisible) {
					maxVisible = visible;
					best = el;
				}
			}
			if (!best || maxVisible <= 0) return;

			const n = Number(best.dataset.step);
			const i = n === 0 ? null : sections.findIndex((section) => section.step === n);
			setActiveStep(i);
			if (i !== null) setHover(null);

			const nextBadge =
				i !== null && sections[i].step !== undefined
					? document.querySelector<HTMLElement>(
							`#paso-${sections[i].step} [data-drop-target]`,
						)
					: null;
			if (nextBadge !== litBadge) {
				litBadge?.classList.remove("animate-disparo");
				nextBadge?.classList.add("animate-disparo");
				litBadge = nextBadge;
			}
		};

		const onScroll = () => {
			if (!requestId) requestId = requestAnimationFrame(measure);
		};
		measure();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		return () => {
			if (requestId) cancelAnimationFrame(requestId);
			litBadge?.classList.remove("animate-disparo");
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sections]);

	return activeStep;
};
