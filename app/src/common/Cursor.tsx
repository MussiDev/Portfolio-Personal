"use client";

import { useEffect, useRef } from "react";

const Cursor = () => {
	const ringRef = useRef<HTMLDivElement>(null);
	const dotRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fine = window.matchMedia("(pointer: fine)");
		if (!fine.matches) return;

		const reducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (reducedMotion) return;

		const ring = ringRef.current;
		const dot = dotRef.current;
		if (!ring || !dot) return;

		document.documentElement.classList.add("cursor-propio");

		let x = window.innerWidth / 2;
		let y = window.innerHeight / 2;
		let ax = x;
		let ay = y;
		let inside = false;
		let active = false;

		const onMove = (e: PointerEvent) => {
			x = e.clientX;
			y = e.clientY;
			if (!inside) {
				ax = x;
				ay = y;
				inside = true;
				ring.style.opacity = "1";
				dot.style.opacity = "1";
			}
			const target = e.target as HTMLElement | null;
			active = !!target?.closest?.(
				"a, button, summary, input, textarea, select, [role='button']",
			);
		};

		const onLeave = () => {
			inside = false;
			ring.style.opacity = "0";
			dot.style.opacity = "0";
		};

		let alive = true;
		const draw = () => {
			if (!alive) return;
			ax += (x - ax) * 0.22;
			ay += (y - ay) * 0.22;
			const scale = active ? 1.7 : 1;
			ring.style.transform = `translate3d(${ax}px, ${ay}px, 0) translate(-50%, -50%) scale(${scale})`;
			dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
			ring.dataset.activo = active ? "si" : "no";
			dot.dataset.activo = active ? "si" : "no";
			requestAnimationFrame(draw);
		};
		draw();

		window.addEventListener("pointermove", onMove, { passive: true });
		document.addEventListener("pointerleave", onLeave);
		window.addEventListener("blur", onLeave);

		return () => {
			alive = false;
			document.documentElement.classList.remove("cursor-propio");
			window.removeEventListener("pointermove", onMove);
			document.removeEventListener("pointerleave", onLeave);
			window.removeEventListener("blur", onLeave);
		};
	}, []);

	return (
		<>
			<div
				ref={ringRef}
				aria-hidden='true'
				className='cursor-anillo pointer-events-none fixed left-0 top-0 z-[100] h-7 w-7 rounded-full border opacity-0'
			/>
			<div
				ref={dotRef}
				aria-hidden='true'
				className='cursor-punto pointer-events-none fixed left-0 top-0 z-[100] h-1 w-1 rounded-full opacity-0'
			/>
		</>
	);
};

export default Cursor;
