"use client";

import { useEffect, useRef } from "react";

const ReadingProgress = ({ targetId }: { targetId: string }) => {
	const barRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const target = document.getElementById(targetId);
		if (!target) return;

		let ticking = false;
		const update = () => {
			ticking = false;
			const rect = target.getBoundingClientRect();
			const total = rect.height - window.innerHeight;
			const read = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
			barRef.current?.style.setProperty("--progreso", String(read));
		};

		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(update);
		};

		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
		};
	}, [targetId]);

	return (
		<div
			className='fixed left-0 top-0 z-40 h-[2px] w-full bg-membrana-honda'
			role='progressbar'
			aria-hidden='true'
		>
			<div
				ref={barRef}
				className='h-full origin-left bg-impulso transition-transform duration-100 ease-linear'
				style={{ transform: "scaleX(var(--progreso, 0))" }}
			/>
		</div>
	);
};

export default ReadingProgress;
