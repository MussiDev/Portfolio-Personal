"use client";

import { useEffect, type RefObject } from "react";

import type { Section } from "../common/Brain3D";

export const PARTICLES = 9;

type Anchor = { x: number; y: number; ready: boolean };

/**
 * Dibuja el cordón de señal (streamRef/cordRef) y sus partículas entre el
 * cerebro y la sección activa. Guardas de performance: no hace nada por
 * debajo de md (el cordón es `hidden md:block`, así que animarlo ahí es
 * puro costo sin resultado visible) y cachea el querySelector del
 * data-drop-target por índice de sección en vez de re-resolverlo cada
 * frame — solo cambia cuando cambia la sección activa, no a 60fps.
 */
export const useSignalCord = (
	streamRef: RefObject<SVGSVGElement | null>,
	cordRef: RefObject<SVGPathElement | null>,
	particlesRef: RefObject<(SVGCircleElement | null)[]>,
	anchorRef: RefObject<Anchor>,
	activeRef: RefObject<number | null>,
	sections: Section[],
) => {
	useEffect(() => {
		const reducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		const desktopMQ = window.matchMedia("(min-width: 768px)");

		let alive = true;
		let idleTimer = 0;
		let t = 0;
		let cachedFor: number | null | undefined;
		let cachedDropTarget: HTMLElement | null = null;
		const draw = () => {
			if (!alive) return;
			const stream = streamRef.current;
			const cord = cordRef.current;
			const i = activeRef.current;
			const anchor = anchorRef.current;

			if (!desktopMQ.matches) {
				stream?.setAttribute("opacity", "0");
				idleTimer = window.setTimeout(() => requestAnimationFrame(draw), 250);
				return;
			}

			if (cachedFor !== i) {
				cachedFor = i;
				cachedDropTarget =
					i !== null && sections[i].step !== undefined
						? document.querySelector<HTMLElement>(
								`#paso-${sections[i].step} [data-drop-target]`,
							)
						: null;
			}
			const dropTarget = cachedDropTarget;

			if (!stream || !cord || !anchor.ready || !dropTarget) {
				stream?.setAttribute("opacity", "0");
				idleTimer = window.setTimeout(() => requestAnimationFrame(draw), 250);
				return;
			}

			const r = dropTarget.getBoundingClientRect();
			const hx = r.left + r.width / 2;
			const hy = r.top + r.height / 2;
			if (hy < -40 || hy > window.innerHeight + 40) {
				stream.setAttribute("opacity", "0");
				idleTimer = window.setTimeout(() => requestAnimationFrame(draw), 250);
				return;
			}
			stream.setAttribute("opacity", "1");

			const cx = (anchor.x + hx) / 2;
			const cy = (anchor.y + hy) / 2 + Math.abs(hx - anchor.x) * 0.18;
			cord.setAttribute(
				"d",
				`M ${anchor.x} ${anchor.y} Q ${cx} ${cy} ${hx} ${hy}`,
			);

			if (!reducedMotion) t = (t + 0.006) % 1;
			particlesRef.current.forEach((particle, k) => {
				if (!particle) return;
				const u = (t + k / PARTICLES) % 1;
				const mu = 1 - u;
				const x = mu * mu * anchor.x + 2 * mu * u * cx + u * u * hx;
				const y = mu * mu * anchor.y + 2 * mu * u * cy + u * u * hy;
				particle.setAttribute("cx", String(x));
				particle.setAttribute("cy", String(y));
				particle.setAttribute("opacity", String(Math.sin(u * Math.PI) * 0.9));
				particle.setAttribute("r", String(1.4 + Math.sin(u * Math.PI) * 1.8));
			});

			requestAnimationFrame(draw);
		};
		draw();
		return () => {
			alive = false;
			window.clearTimeout(idleTimer);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sections]);
};
