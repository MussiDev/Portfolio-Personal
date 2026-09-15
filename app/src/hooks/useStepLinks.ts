"use client";

import { useEffect } from "react";

/**
 * Delega clicks en cualquier <a href="#paso-N"> del documento (los hay
 * fuera de este componente, p. ej. en el nav mobile de la home) hacia
 * goToStep, en vez de dejar que el navegador salte por hash nativo.
 */
export const useStepLinks = (
	goToStep: (step: number) => void,
	setHover: (v: number | null) => void,
) => {
	useEffect(() => {
		const onClick = (e: MouseEvent) => {
			if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
			const target = (e.target as HTMLElement | null)?.closest?.(
				'a[href^="#paso-"]',
			) as HTMLAnchorElement | null;
			if (!target) return;
			const step = Number(target.getAttribute("href")?.replace("#paso-", ""));
			if (Number.isNaN(step)) return;
			e.preventDefault();
			setHover(null);
			goToStep(step);
		};
		document.addEventListener("click", onClick);
		return () => document.removeEventListener("click", onClick);
	}, [goToStep, setHover]);
};
