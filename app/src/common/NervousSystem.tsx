"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { useActiveStep } from "../hooks/useActiveStep";
import { useHashCleanup } from "../hooks/useHashCleanup";
import { useReveal } from "../hooks/useReveal";
import { PARTICLES, useSignalCord } from "../hooks/useSignalCord";
import { useStepKeyboard } from "../hooks/useStepKeyboard";
import { useStepLinks } from "../hooks/useStepLinks";
import BrainCanvas from "./BrainLazy";
import type { Section } from "./Brain3D";

const NervousSystem = ({
	sections,
	children,
	loadingText,
	activityText,
	openText,
	backText,
	stepsLabel,
	scrollHintText,
	navLabel,
}: {
	sections: Section[];
	children: ReactNode;
	loadingText: string;
	activityText: string;
	openText: string;
	backText: string;
	stepsLabel: string;
	scrollHintText: string;
	navLabel: string;
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const streamRef = useRef<SVGSVGElement>(null);
	const cordRef = useRef<SVGPathElement>(null);
	const particlesRef = useRef<(SVGCircleElement | null)[]>([]);
	const anchorRef = useRef({ x: 0, y: 0, ready: false });

	const [ready, setReady] = useState(false);
	const [hover, setHover] = useState<number | null>(null);

	const withStep = sections.filter((section) => section.step !== undefined);

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

	const activeStep = useActiveStep(containerRef, sections, setHover);

	const active = hover ?? activeStep;
	const inHero = activeStep === null;
	const activeRef = useRef<number | null>(active);
	activeRef.current = active;

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

	useHashCleanup();
	useStepLinks(goToStep, setHover);
	useReveal();
	useStepKeyboard(containerRef, activeRef, sections, goToStep, setHover);
	useSignalCord(streamRef, cordRef, particlesRef, anchorRef, activeRef, sections);

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
					navLabel={navLabel}
					onProgress={() => {}}
					onReady={liftVeil}
				/>

				<div
					className={`absolute bottom-20 left-0 z-20 hidden max-w-[22rem] px-8 transition-all duration-700 ease-impulso md:block lg:px-14 ${
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
				className={`pointer-events-none fixed bottom-6 left-8 z-40 hidden items-center gap-6 transition-all duration-500 ease-impulso md:flex ${
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
				className={`pointer-events-none fixed bottom-6 left-8 z-40 hidden flex-col items-center gap-1.5 transition-all duration-500 ease-impulso md:flex ${
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
