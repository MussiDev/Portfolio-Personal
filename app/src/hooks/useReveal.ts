"use client";

import { useEffect } from "react";

/**
 * Animates the [data-reveal] blocks in as they enter the viewport (with a
 * fallback if there's no IntersectionObserver), and strips the hero's
 * welcome animation's .enter classes after 2.5s — both are cleanup for the
 * entrance choreography, with the same safety timeout in case something
 * doesn't fire.
 */
export const useReveal = (pathname: string) => {
	useEffect(() => {
		const blocks = Array.from(
			document.querySelectorAll<HTMLElement>("[data-reveal]"),
		);
		if (!blocks.length) return;

		const reveal = (el: HTMLElement) => el.classList.add("visible");

		if (typeof IntersectionObserver === "undefined") {
			blocks.forEach(reveal);
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (!e.isIntersecting) continue;
					reveal(e.target as HTMLElement);
					observer.unobserve(e.target);
				}
			},
			{ rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
		);
		blocks.forEach((b) => observer.observe(b));

		const safetyTimer = window.setTimeout(() => blocks.forEach(reveal), 2500);
		return () => {
			window.clearTimeout(safetyTimer);
			observer.disconnect();
		};
		// The blocks belong to the page, and this hook lives in the layout:
		// without re-running per route, a page reached by client navigation
		// would keep every [data-reveal] block at opacity 0 forever.
	}, [pathname]);

	useEffect(() => {
		const safetyTimer = window.setTimeout(() => {
			document
				.querySelectorAll<HTMLElement>(".enter")
				.forEach((el) => el.classList.remove("enter"));
		}, 2500);
		return () => window.clearTimeout(safetyTimer);
	}, [pathname]);
};
