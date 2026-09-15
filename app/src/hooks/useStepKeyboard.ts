"use client";

import { useEffect, type RefObject } from "react";

import type { Section } from "../common/Brain3D";

/**
 * Atajos globales dentro del scope del cerebro: Enter abre la sección
 * activa (si el foco no está ya sobre un link/botón propio), Backspace
 * vuelve al hero. Se ignora si el foco está en un campo de texto.
 */
export const useStepKeyboard = (
	containerRef: RefObject<HTMLDivElement | null>,
	activeRef: RefObject<number | null>,
	sections: Section[],
	goToStep: (step: number) => void,
	setHover: (v: number | null) => void,
) => {
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement | null;
			if (
				target?.closest("input, textarea, select, [contenteditable='true']")
			) {
				return;
			}
			const container = containerRef.current;
			const withinScope =
				target === document.body ||
				(!!container && (target === container || container.contains(target)));
			if (!withinScope) return;

			const i = activeRef.current;
			if (e.key === "Enter" && i !== null && !e.metaKey && !e.ctrlKey) {
				if (target?.closest("a, button")) return;
				e.preventDefault();
				const s = sections[i];
				window.open(s.href, s.external ? "_blank" : "_self");
			}
			if (e.key === "Backspace") {
				e.preventDefault();
				setHover(null);
				goToStep(0);
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sections, goToStep]);
};
