"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import BrainCanvas from "./BrainLazy";
import type { Section } from "./Brain3D";

const PARTICLES = 9;

const NervousSystem = ({
	sections,
	children,
	loadingText,
	activityText,
	openText,
	backText,
	stepsLabel,
	scrollHintText,
}: {
	sections: Section[];
	children: ReactNode;
	loadingText: string;
	activityText: string;
	openText: string;
	backText: string;
	stepsLabel: string;
	scrollHintText: string;
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const streamRef = useRef<SVGSVGElement>(null);
	const cordRef = useRef<SVGPathElement>(null);
	const particlesRef = useRef<(SVGCircleElement | null)[]>([]);
	const anchorRef = useRef({ x: 0, y: 0, ready: false });

	const [ready, setReady] = useState(false);

	const [activeStep, setActiveStep] = useState<number | null>(null);
	const [hover, setHover] = useState<number | null>(null);

	const withStep = sections.filter((section) => section.step !== undefined);

	const active = hover ?? activeStep;
	const inHero = activeStep === null;
	const activeRef = useRef<number | null>(active);
	activeRef.current = active;

	const goToStep = useCallback((step: number) => {
		document.getElementById(`paso-${step}`)?.scrollIntoView({
			behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
				? "auto"
				: "smooth",
			block: "start",
		});
		if (window.location.hash) {
			history.replaceState(null, "", window.location.pathname + window.location.search);
		}
	}, []);

	const go = useCallback(
		(i: number) => {
			const s = sections[i];
			setHover(null);
			if (s.step === undefined) {
				window.open(s.href, s.external ? "_blank" : "_self");
				return;
			}
			goToStep(s.step);
		},
		[sections, goToStep],
	);

	useEffect(() => {
		if (!/^#paso-\d+$/.test(window.location.hash)) return;
		history.replaceState(
			null,
			"",
			window.location.pathname + window.location.search,
		);
	}, []);

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
	}, [goToStep]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const steps = Array.from(
			container.querySelectorAll<HTMLElement>("[data-step]"),
		);
		if (!steps.length) return;

		let requestId = 0;
		let litBadge: HTMLElement | null = null;
		const measure = () => {
			requestId = 0;
			const vh = window.innerHeight;
			let best: HTMLElement | null = null;
			let maxVisible = 0;
			for (const el of steps) {
				const r = el.getBoundingClientRect();
				const visible = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
				if (visible > maxVisible) {
					maxVisible = visible;
					best = el;
				}
			}
			if (!best || maxVisible <= 0) return;

			const n = Number(best.dataset.step);
			const i = n === 0 ? null : sections.findIndex((section) => section.step === n);
			setActiveStep(i);
			if (i !== null) setHover(null);

			const nextBadge =
				i !== null && sections[i].step !== undefined
					? document.querySelector<HTMLElement>(
							`#paso-${sections[i].step} [data-drop-target]`,
						)
					: null;
			if (nextBadge !== litBadge) {
				litBadge?.classList.remove("animate-disparo");
				nextBadge?.classList.add("animate-disparo");
				litBadge = nextBadge;
			}
		};

		const onScroll = () => {
			if (!requestId) requestId = requestAnimationFrame(measure);
		};
		measure();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		return () => {
			if (requestId) cancelAnimationFrame(requestId);
			litBadge?.classList.remove("animate-disparo");
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
		};
	}, [sections]);

	useEffect(() => {
		const blocks = Array.from(
			document.querySelectorAll<HTMLElement>("[data-revelar]"),
		);
		if (!blocks.length) return;

		const reveal = (el: HTMLElement) => el.classList.add("visible");

		if (typeof IntersectionObserver === "undefined") {
			blocks.forEach(reveal);
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (!e.isIntersecting) continue;
					reveal(e.target as HTMLElement);
					observer.unobserve(e.target);
				}
			},
			{ rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
		);
		blocks.forEach((b) => observer.observe(b));

		const safetyTimer = window.setTimeout(() => blocks.forEach(reveal), 2500);
		return () => {
			window.clearTimeout(safetyTimer);
			observer.disconnect();
		};
	}, []);

	useEffect(() => {
		const safetyTimer = window.setTimeout(() => {
			document
				.querySelectorAll<HTMLElement>(".entra")
				.forEach((el) => el.classList.remove("entra"));
		}, 2500);
		return () => window.clearTimeout(safetyTimer);
	}, []);

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
	}, [sections, goToStep]);

	useEffect(() => {
		const reducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		let alive = true;
		let idleTimer = 0;
		let t = 0;
		const draw = () => {
			if (!alive) return;
			const stream = streamRef.current;
			const cord = cordRef.current;
			const i = activeRef.current;
			const anchor = anchorRef.current;

			const dropTarget =
				i !== null && sections[i].step !== undefined
					? document.querySelector<HTMLElement>(
							`#paso-${sections[i].step} [data-drop-target]`,
						)
					: null;

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
	}, [sections]);

	const liftVeil = useCallback(() => setReady(true), []);

	useEffect(() => {
		const t = setTimeout(liftVeil, 8000);
		return () => clearTimeout(t);
	}, [liftVeil]);

	return (
		<div ref={containerRef} className='relative'>
			<div
				className={`barrido pointer-events-none sticky top-0 z-0 h-[100svh] overflow-hidden opacity-40 transition-opacity duration-700 ease-impulso md:opacity-100 ${
					ready ? "" : "!opacity-0"
				}`}
			>
				<BrainCanvas
					sections={sections}
					active={active}
					onActive={(i) => setHover(inHero ? i : null)}
					onGo={go}
					inHero={inHero}
					anchorRef={anchorRef}
					loadingText={loadingText}
					activityText={activityText}
					onProgress={() => {}}
					onReady={liftVeil}
				/>

				<div
					className={`absolute bottom-0 left-0 z-20 hidden max-w-[22rem] px-8 pb-10 transition-all duration-700 ease-impulso md:block lg:px-14 ${
						inHero && active !== null
							? "translate-y-0 opacity-100"
							: "pointer-events-none translate-y-2 opacity-0"
					}`}
				>
					{inHero && active !== null && (
						<div className='border-l-2 border-impulso pl-4'>
							<p className='m-0 flex items-baseline gap-2 font-rotulo text-[11px] font-bold uppercase tracking-[.14em] text-impulso'>
								<span className='font-pieza tabular-nums'>
									{String(active + 1).padStart(2, "0")}
								</span>
								{sections[active].label}
							</p>
							<p className='m-0 mt-2 font-nota text-[13px] leading-relaxed text-mielina'>
								{sections[active].summary}
							</p>
						</div>
					)}
				</div>
			</div>

			<svg
				ref={streamRef}
				className='pointer-events-none fixed inset-0 z-30 hidden h-full w-full transition-opacity duration-300 md:block'
				aria-hidden='true'
				opacity='0'
			>
				<path
					ref={cordRef}
					className='animate-conduccion'
					fill='none'
					stroke='rgb(255 106 58)'
					strokeOpacity='0.28'
					strokeWidth='1'
					strokeDasharray='2 5'
					strokeDashoffset='700'
				/>
				{Array.from({ length: PARTICLES }).map((_, k) => (
					<circle
						key={k}
						ref={(n) => {
							particlesRef.current[k] = n;
						}}
						r='2'
						fill='rgb(255 106 58)'
					/>
				))}
			</svg>

			<div className='pointer-events-none relative z-10 -mt-[100svh]'>
				{children}
			</div>

			<nav
				aria-label={stepsLabel}
				className='pointer-events-none fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex'
			>
				<span className='font-pieza text-[10px] tabular-nums text-mielina'>
					{String(inHero ? 0 : (activeStep ?? 0) + 1).padStart(2, "0")}
				</span>
				<span className='h-px w-3 bg-sinapsis/40' />
				{withStep.map((section, i) => {
					const here = !inHero && activeStep === i;
					const past = !inHero && activeStep !== null && i < activeStep;
					return (
						<button
							key={section.href + section.label}
							type='button'
							onClick={() => section.step !== undefined && goToStep(section.step)}
							title={section.label}
							aria-label={section.label}
							aria-current={here ? "step" : undefined}
							className='pointer-events-auto flex h-4 w-4 items-center justify-center'
						>
							<span
								className={`block rounded-full transition-all duration-500 ease-impulso ${
									here
										? "h-2.5 w-2.5 bg-impulso shadow-[0_0_12px_2px_rgb(255_106_58/.6)]"
										: past
											? "h-1.5 w-1.5 bg-sinapsis"
											: "h-1.5 w-1.5 bg-sinapsis/35"
								}`}
							/>
						</button>
					);
				})}
				<span className='h-px w-3 bg-sinapsis/40' />
				<span className='font-pieza text-[10px] tabular-nums text-sinapsis'>
					{String(withStep.length).padStart(2, "0")}
				</span>
			</nav>

			<div
				className={`pointer-events-none fixed bottom-6 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-6 transition-all duration-500 ease-impulso md:flex ${
					active === null
						? "translate-y-3 opacity-0"
						: "translate-y-0 opacity-100"
				}`}
			>
				<span className='membrana flex items-center gap-6 rounded-full px-5 py-2.5'>
					<span className='font-pieza text-[10px] uppercase tracking-[.14em] text-mielina'>
						{active !== null && sections[active].label}
					</span>
					<span className='h-4 w-px bg-sinapsis/30' />
					{inHero && (
						<LiveKey face='enter' tone='impulso' onTrigger={() => active !== null && go(active)}>
							{openText}
						</LiveKey>
					)}
					<LiveKey
						face='backspace'
						onTrigger={() => {
							setHover(null);
							goToStep(0);
						}}
					>
						{backText}
					</LiveKey>
				</span>
			</div>

			<button
				type='button'
				onClick={() => goToStep(1)}
				className={`pointer-events-none fixed bottom-6 left-1/2 z-40 hidden -translate-x-1/2 flex-col items-center gap-1.5 transition-all duration-500 ease-impulso md:flex ${
					active === null
						? "pointer-events-auto translate-y-0 opacity-100"
						: "translate-y-3 opacity-0"
				}`}
			>
				<span className='font-pieza text-[10px] uppercase tracking-[.14em] text-mielina'>
					{scrollHintText}
				</span>
				<span aria-hidden='true' className='animate-respirar text-sinapsis'>
					⌄
				</span>
			</button>
		</div>
	);
};

const LiveKey = ({
	face,
	tone,
	children,
	onTrigger,
}: {
	face: "enter" | "backspace";
	tone?: "impulso" | "sinapsis";
	children: ReactNode;
	onTrigger: () => void;
}) => {
	const glyph = face === "enter" ? "↵" : "⌫";
	const lit = tone === "impulso";
	return (
		<button
			type='button'
			onClick={onTrigger}
			className='group pointer-events-auto inline-flex items-center gap-2.5'
		>
			<span
				aria-hidden='true'
				className={`inline-flex h-7 min-w-[2.6rem] items-center justify-center rounded-[5px] border px-2 font-pieza text-[12px] leading-none transition-all duration-150 ease-impulso group-hover:translate-y-[2px] group-hover:shadow-none group-active:translate-y-[2px] group-active:shadow-none ${
					lit
						? "border-impulso/60 bg-impulso/10 text-impulso shadow-[0_2px_0_0_rgb(255_106_58/.45)]"
						: "border-sinapsis/50 bg-membrana-honda text-mielina shadow-[0_2px_0_0_rgb(124_152_190/.35)]"
				}`}
			>
				{glyph}
			</span>
			<span
				className={`font-rotulo text-[11px] font-bold uppercase tracking-[.14em] transition-colors duration-200 ease-impulso group-hover:text-senal ${
					lit ? "text-impulso" : "text-mielina"
				}`}
			>
				{children}
			</span>
		</button>
	);
};

export default NervousSystem;
