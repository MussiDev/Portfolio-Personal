"use client";

import { useEffect, useState } from "react";

/**
 * `null` mientras no se sabe todavía (antes del primer effect) — a
 * propósito, para no tener que adivinar mobile o desktop y después
 * corregirse: el cerebro 3D nunca se monta hasta que esto resuelve a
 * `true`, así que un visitante mobile jamás dispara el import de
 * three.js ni por un instante.
 */
export const useIsDesktop = (breakpointPx = 768): boolean | null => {
	const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

	useEffect(() => {
		const mq = window.matchMedia(`(min-width: ${breakpointPx}px)`);
		setIsDesktop(mq.matches);
		const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, [breakpointPx]);

	return isDesktop;
};
