"use client";

import { useEffect, useState, type RefObject } from "react";

import type { Section } from "../common/Brain3D";

/**
 * Scroll-spy: whichever [data-step] occupies the most viewport right now
 * is the active section. It also lights the badge (.animate-fire) of the
 * section that becomes active and turns off the previous one's.
 */
export const useActiveStep = (
	containerRef: RefObject<HTMLDivElement | null>,
	sections: Section[],
	setHover: (v: number | null) => void,
	/** Current route: the steps live in the page, and the page is replaced
	 * under this hook on every client navigation. */
	pathname: string,
	/** Only the home has steps to spy on. */
	active: boolean,
): number | null => {
	const [activeStep, setActiveStep] = useState<number | null>(null);

	useEffect(() => {
		if (!active) return;
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
							`#step-${sections[i].step} [data-drop-target]`,
						)
					: null;
			if (nextBadge !== litBadge) {
				litBadge?.classList.remove("animate-fire");
				nextBadge?.classList.add("animate-fire");
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
			litBadge?.classList.remove("animate-fire");
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sections, pathname, active]);

	// Derived, not stored: a scene without steps has no active step, and
	// writing that into state from the effect only buys a cascading render.
	// Coming back to the home re-runs the effect, which measures at once.
	return active ? activeStep : null;
};
