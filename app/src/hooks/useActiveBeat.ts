"use client";

import { useEffect, useState } from "react";

/**
 * Which of a case's six beats is on screen.
 *
 * Same rule as useActiveStep — the element covering the most viewport wins —
 * but over [data-tiempo] inside a case. It drives the decision trace in the
 * brain, so reading the case IS what advances the signal.
 */
export const useActiveBeat = (pathname: string, activo: boolean): number | null => {
	const [beat, setBeat] = useState<number | null>(null);

	useEffect(() => {
		if (!activo) return;
		const beats = Array.from(document.querySelectorAll<HTMLElement>("[data-tiempo]"));
		if (!beats.length) return;

		let requestId = 0;
		const measure = () => {
			requestId = 0;
			const vh = window.innerHeight;
			let best: HTMLElement | null = null;
			let maxVisible = 0;
			for (const el of beats) {
				const r = el.getBoundingClientRect();
				const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
				if (visible > maxVisible) {
					maxVisible = visible;
					best = el;
				}
			}
			// Nothing on screen yet (the case opens above the beats): keep the
			// first one lit rather than retracting the trace.
			setBeat(best && maxVisible > 0 ? Number(best.dataset.tiempo) : 0);
		};

		const onScroll = () => {
			if (!requestId) requestId = requestAnimationFrame(measure);
		};
		measure();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		return () => {
			if (requestId) cancelAnimationFrame(requestId);
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
		};
	}, [pathname, activo]);

	return activo ? beat : null;
};
