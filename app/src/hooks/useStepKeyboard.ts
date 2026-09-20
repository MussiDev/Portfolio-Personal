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
	/** The shortcuts belong to the walkthrough: on a case page Backspace is
	 * the browser's, not ours. */
	activo: boolean,
) => {
	useEffect(() => {
		if (!activo) return;
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
				// Mismo camino que el click (onGo → goToStep): scroll suave y
				// hash escrito. Antes esto hacía window.open(href, "_self") con
				// un href="#paso-N", o sea un salto por hash nativo — otra
				// navegación, otro resultado visual, para la misma acción.
				if (s.step === undefined) window.open(s.href, s.external ? "_blank" : "_self");
				else goToStep(s.step);
			}
			// Escape además de Backspace: es la tecla que la gente ya asocia
			// con "salir de esto", y no compite con ningún hábito previo.
			// Backspace se mantiene porque el HUD lo muestra como afordancia.
			if (e.key === "Backspace" || e.key === "Escape") {
				e.preventDefault();
				setHover(null);
				goToStep(0);
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sections, goToStep, activo]);
};
