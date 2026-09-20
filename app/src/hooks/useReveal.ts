"use client";

import { useEffect } from "react";

/**
 * Anima la entrada de los bloques [data-revelar] cuando entran en
 * viewport (con fallback si no hay IntersectionObserver), y saca las
 * clases .entra de la animación de bienvenida del hero pasados 2.5s —
 * ambas son limpieza de la coreografía de entrada, con el mismo timeout
 * de seguridad por si algo no dispara.
 */
export const useReveal = (pathname: string) => {
	useEffect(() => {
		const blocks = Array.from(
			document.querySelectorAll<HTMLElement>("[data-revelar]"),
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
		// would keep every [data-revelar] block at opacity 0 forever.
	}, [pathname]);

	useEffect(() => {
		const safetyTimer = window.setTimeout(() => {
			document
				.querySelectorAll<HTMLElement>(".entra")
				.forEach((el) => el.classList.remove("entra"));
		}, 2500);
		return () => window.clearTimeout(safetyTimer);
	}, [pathname]);
};
