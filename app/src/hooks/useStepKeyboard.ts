"use client";

import { useEffect, type RefObject } from "react";

import type { Section } from "../common/Brain3D";

/**
 * Global shortcuts within the brain's scope: Enter opens the active
 * section (if focus isn't already on its own link/button), Backspace
 * returns to the hero. Ignored if focus is on a text field.
 */
export const useStepKeyboard = (
	containerRef: RefObject<HTMLDivElement | null>,
	activeRef: RefObject<number | null>,
	sections: Section[],
	goToStep: (step: number) => void,
	setHover: (v: number | null) => void,
	/** The shortcuts belong to the walkthrough: on a case page Backspace is
	 * the browser's, not ours. */
	active: boolean,
) => {
	useEffect(() => {
		if (!active) return;
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
				// Same path as the click (onGo → goToStep): smooth scroll and
				// the hash written. This used to do window.open(href, "_self")
				// with an href="#step-N", i.e. a native hash jump — another
				// navigation, another visual result, for the same action.
				if (s.step === undefined) window.open(s.href, s.external ? "_blank" : "_self");
				else goToStep(s.step);
			}
			// Escape alongside Backspace: it's the key people already
			// associate with "get out of this", and it doesn't compete with
			// any prior habit. Backspace stays because the HUD shows it as
			// the affordance.
			if (e.key === "Backspace" || e.key === "Escape") {
				e.preventDefault();
				setHover(null);
				goToStep(0);
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sections, goToStep, active]);
};
