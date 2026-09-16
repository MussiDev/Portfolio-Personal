"use client";

import { useEffect, type RefObject } from "react";

import type { Section } from "../common/Brain3D";

export const PARTICLES = 9;

type Anchor = { x: number; y: number; ready: boolean };

/**
 * Dibuja el cordón de señal (streamRef/cordRef) y sus partículas entre el
 * tejido y la sección activa. Una sola implementación para los dos
 * breakpoints: quien publique `anchorRef` decide de dónde sale el cordón —
 * Brain3D en desktop, NervousSystemMobile en mobile. El cordón es el gesto
 * que mejor cuenta el concepto del sitio, así que dejarlo fuera de mobile
 * (como estaba) era dejar el concepto fuera de mobile.
 *
 * Guarda de performance que sí se mantiene: el querySelector del
 * data-drop-target se cachea por índice de sección en vez de re-resolverse
 * cada frame — solo cambia cuando cambia la sección activa, no a 60fps.
 * Cuando no hay nada que dibujar el loop baja a un tick de 250ms en vez de
 * pedir un rAF por frame.
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
