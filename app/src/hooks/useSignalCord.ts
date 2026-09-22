"use client";

import { useEffect, type RefObject } from "react";

import type { Section } from "../common/Brain3D";

export const PARTICLES = 9;

type Anchor = { x: number; y: number; ready: boolean };

/**
 * Draws the signal cord (streamRef/cordRef) and its particles between the
 * tissue and the active section. A single implementation for both
 * breakpoints: whoever publishes `anchorRef` decides where the cord comes
 * from — Brain3D on desktop, NervousSystemMobile on mobile. The cord is
 * the gesture that best tells the site's concept, so leaving it out of
 * mobile (as it was) meant leaving the concept out of mobile.
 *
 * The performance guard that's kept: the data-drop-target querySelector is
 * cached by section index instead of being re-resolved every frame — it
 * only changes when the active section changes, not at 60fps. When
 * there's nothing to draw the loop drops to a 250ms tick instead of
 * requesting a rAF per frame.
 */
export const useSignalCord = (
	streamRef: RefObject<SVGSVGElement | null>,
	cordRef: RefObject<SVGPathElement | null>,
	particlesRef: RefObject<(SVGCircleElement | null)[]>,
	anchorRef: RefObject<Anchor>,
	activeRef: RefObject<number | null>,
	sections: Section[],
	/** The cord ends at a step's badge; with no steps on screen there is
	 * nothing to draw and no reason to keep a loop alive. */
	active: boolean,
) => {
	useEffect(() => {
		if (!active) return;
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
								`#step-${sections[i].step} [data-drop-target]`,
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
	}, [sections, active]);
};
