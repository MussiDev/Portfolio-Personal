"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { useActiveBeat } from "../hooks/useActiveBeat";
import { useActiveStep } from "../hooks/useActiveStep";
import { useHashEntry } from "../hooks/useHashEntry";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useReveal } from "../hooks/useReveal";
import { PARTICLES, useSignalCord } from "../hooks/useSignalCord";
import { useStepKeyboard } from "../hooks/useStepKeyboard";
import { useStepLinks } from "../hooks/useStepLinks";
import BrainCanvas from "./BrainLazy";
import { sceneForRoute } from "./scene";
import { relatedTo } from "./relations";
import type { Section } from "./Brain3D";
import NervousSystemMobile from "./NervousSystemMobile";

/** How long each region stays lit during the hero's mobile walkthrough. */
const CYCLE_MS = 2800;

/**
 * The nervous system, mounted once in the [lang] layout.
 *
 * Living in the layout is the point: navigating from the home to a case no
 * longer unmounts the brain, so the same WebGL session and the same tissue
 * carry over instead of the world going dark between pages. Which scene a
 * route wants comes from scene.ts; a route that wants none (the blog, the
 * 404) renders its children and nothing else — no canvas, no listeners.
 */
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
	connectedLabel,
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
	connectedLabel: string;
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const streamRef = useRef<SVGSVGElement>(null);
	const cordRef = useRef<SVGPathElement>(null);
	const particlesRef = useRef<(SVGCircleElement | null)[]>([]);
	const anchorRef = useRef({ x: 0, y: 0, ready: false });

	const [ready, setReady] = useState(false);
	const [hover, setHover] = useState<number | null>(null);
	const isDesktop = useIsDesktop();

	const pathname = usePathname();
	const scene = useMemo(() => sceneForRoute(pathname, sections), [pathname, sections]);
	const isHome = scene.mode === "home";
	const hasBrain = scene.mode !== "none";

	const withStep = sections.filter((section) => section.step !== undefined);

	// The hash gets written, not cleared: it's the only URL that identifies a
	// section, and next.config.js's 301s (/contacto → /#step-5) and the
	// blog's BreadcrumbList depend on it. replaceState is used instead of
	// pushState so the history doesn't fill up with one entry per scroll:
	// the browser's back still leaves the site, instead of walking steps.
	const goToStep = useCallback((step: number) => {
		const target = document.getElementById(`step-${step}`);
		target?.scrollIntoView({
			behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
				? "auto"
				: "smooth",
			block: "start",
		});
		// Scrolling alone leaves focus on the control that was activated, so
		// the next Tab continued through the step dots instead of entering
		// the section. preventScroll: the smooth scroll above is already
		// under way and a focus jump would cut it short.
		target?.focus({ preventScroll: true });
		const { pathname, search } = window.location;
		history.replaceState(null, "", step === 0 ? pathname + search : `${pathname}${search}#step-${step}`);
	}, []);

	// `pathname` is a dependency, not decoration: the hooks below read the
	// DOM of the page being shown, and with the system in the layout that DOM
	// is replaced under them on every client navigation.
	const activeStep = useActiveStep(containerRef, sections, setHover, pathname, isHome);
	// Reading a case is what moves the signal: each beat on screen lights one
	// more segment of the trace over the tissue.
	const beat = useActiveBeat(pathname, scene.mode === "case");

	const active = isHome
		? (hover ?? activeStep)
		: scene.mode === "case"
			? scene.region
			: null;
	// The hero is the home's first screen and nothing else: on a case the
	// index steps aside and the region that owns the page holds the focus.
	const inHero = isHome && activeStep === null;

	/**
	 * The mobile concept.
	 *
	 * On desktop the brain is the index and gets discovered with the mouse:
	 * hovering a region lights it up, shows its real connections, and the
	 * labels respond. On a phone there's no mouse, and without this the
	 * tissue was just a drawing: six unnumbered nodes, no relation to the
	 * list, and never an active region in the hero.
	 *
	 * So on mobile's hero the tissue walks the regions on its own — the
	 * active one lights up, its connections are drawn, and the list below
	 * responds the same way desktop's labels do. With keyboard, focusing a
	 * row lights it and stops the walkthrough. With reduced motion there's
	 * no walkthrough: 01 stays lit, still.
	 *
	 * Kept separate from `active` on purpose: `active` is also read by the
	 * keyboard shortcuts, and an Enter can't open the section the cycle
	 * happened to have lit at that instant.
	 */
	const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
	const relations = useMemo(
		() => sections.map((_section, i) => relatedTo(sections, i)),
		[sections],
	);
	const [cycle, setCycle] = useState(0);
	const [focusedRow, setFocusedRow] = useState<number | null>(null);
	const demoMobile = isDesktop === false && inHero;

	useEffect(() => {
		if (!demoMobile || reducedMotion !== false || focusedRow !== null) return;
		const id = window.setInterval(
			() => setCycle((c) => (c + 1) % sections.length),
			CYCLE_MS,
		);
		return () => window.clearInterval(id);
	}, [demoMobile, reducedMotion, focusedRow, sections.length]);

	useEffect(() => {
		if (isDesktop !== false) return;
		const onFocusIn = (e: FocusEvent) => {
			const row = (e.target as HTMLElement | null)?.closest?.<HTMLElement>("[data-region]");
			setFocusedRow(row ? Number(row.dataset.region) : null);
		};
		document.addEventListener("focusin", onFocusIn);
		return () => document.removeEventListener("focusin", onFocusIn);
	}, [isDesktop]);

	const heroRegion = demoMobile ? (focusedRow ?? cycle) : null;

	// The mobile <nav> rows render on the server and don't read this state:
	// it's passed to them as data-state and CSS does the rest.
	useEffect(() => {
		const linked = new Set(heroRegion !== null ? relations[heroRegion] : []);
		document.querySelectorAll<HTMLElement>("[data-region]").forEach((el) => {
			const i = Number(el.dataset.region);
			el.dataset.state =
				i === heroRegion ? "active" : linked.has(i) ? "linked" : "idle";
		});
	}, [heroRegion, relations]);
	// Synced in an effect, not in the render body: writing a ref during
	// render is a side effect during the render phase. The consumers
	// (useStepKeyboard, useSignalCord) read it inside handlers and inside a
	// rAF loop, where a one-frame difference isn't noticeable.
	const activeRef = useRef<number | null>(active);
	useEffect(() => {
		activeRef.current = active;
	}, [active]);

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

	useHashEntry(pathname);
	useStepLinks(goToStep, setHover);
	useReveal(pathname);
	useStepKeyboard(containerRef, activeRef, sections, goToStep, setHover, isHome);
	useSignalCord(streamRef, cordRef, particlesRef, anchorRef, activeRef, sections, isHome);

	const liftVeil = useCallback(() => setReady(true), []);

	useEffect(() => {
		const t = setTimeout(liftVeil, 8000);
		return () => clearTimeout(t);
	}, [liftVeil]);

	// Mobile's tissue is now also built (2D canvas) and signals via onReady
	// when it's done, just like the 3D brain — even if the canvas fails.
	// There's no longer a need to reveal it by hand on detecting mobile; the
	// 8s timeout above still stands as a safety net.

	// The blog, the 404: they render inside the same shell but ask for no
	// brain, so nothing here mounts — no canvas, no scroll listeners, no
	// tissue downloaded.
	if (!hasBrain) return <>{children}</>;

	/*
	 * DOM order and visual order differ on purpose. The page goes first in
	 * the DOM so the tab order is name → CTA → language → brain index →
	 * steps; with the brain layer first, the six labels came before the H1.
	 * `order` puts the sticky layer back on top visually, and the content
	 * rises over it with -mt-[100svh].
	 */
	return (
		// `nervous-system` sits here, not on the page's <main>: the brain
		// layer, the cord and the rail live in this subtree now, and the
		// class is what carries the world's surface and its focus styles.
		<div ref={containerRef} className='nervous-system relative flex flex-col'>
			{/* pointer-events-none only on the home, where the page is a column
			 * beside the brain and every block opts back in: that is what lets
			 * the mouse reach the regions through the gaps. A case is a plain
			 * document over the tissue, so it keeps its events. */}
			<div
				className={`relative z-10 order-2 -mt-[100svh] ${
					isHome ? "pointer-events-none" : ""
				}`}
			>
				{children}
			</div>

			<div
				// On mobile the tissue runs at full intensity while it's the
				// hero (nothing sits above it to read) and only drops to 40%
				// once a step's content sits over it. It used to be fixed at
				// 40%, so the tissue's build-up was seen half-lit exactly when
				// it's the protagonist.
				className={`sweep pointer-events-none sticky top-0 z-0 order-1 h-[100svh] shrink-0 overflow-hidden transition-opacity duration-700 ease-impulse ${
					isHome
						? `desk:opacity-100 ${inHero ? "opacity-100" : "opacity-40"}`
						: // A case keeps its column on the right, so the tissue
							// holds the left at full strength on a wide screen and
							// dims on a phone, where the text runs over it.
							"opacity-40 desk:opacity-100"
				} ${ready ? "" : "!opacity-0"}`}
			>
				{isDesktop && (
					<BrainCanvas
						sections={sections}
						active={active}
						onActive={(i) => setHover(inHero ? i : null)}
						onGo={go}
						inHero={inHero}
						beat={beat}
						anchorRef={anchorRef}
						loadingText={loadingText}
						activityText={activityText}
						navLabel={navLabel}
						onProgress={() => {}}
						onReady={liftVeil}
					/>
				)}
				{isDesktop === false && (
					<NervousSystemMobile
						sectionCount={sections.length}
						active={inHero ? heroRegion : active}
						relations={relations}
						anchorRef={anchorRef}
						onReady={liftVeil}
					/>
				)}

				<div
					className={`absolute bottom-20 left-0 z-20 hidden max-w-[22rem] px-8 transition-all duration-700 ease-impulse desk:block lg:px-14 ${
						inHero && active !== null
							? "translate-y-0 opacity-100"
							: "pointer-events-none translate-y-2 opacity-0"
					}`}
				>
					{inHero && active !== null && (
						<div className='border-l-2 border-impulse pl-4'>
							<p className='m-0 flex items-baseline gap-2 font-label text-[11px] font-bold uppercase tracking-[.14em] text-impulse'>
								<span className='font-mono tabular-nums'>
									{String(active + 1).padStart(2, "0")}
								</span>
								{sections[active].label}
							</p>
							<p className='m-0 mt-2 font-label text-[13px] leading-relaxed text-myelin'>
								{sections[active].summary}
							</p>
							{/* Names go in the same faint orange their labels get on
							the brain: that way the panel and what lights up read as
							the same statement, not two separate things. The list
							comes from relatedTo, same as the lighting, so they can't
							diverge. */}
							{relatedTo(sections, active).length > 0 && (
								<p className='m-0 mt-2 font-mono text-[10px] uppercase tracking-[.12em] text-synapse'>
									{connectedLabel}{" "}
									{relatedTo(sections, active).map((i, n) => (
										<span key={sections[i].href + sections[i].label}>
											{n > 0 && " · "}
											<span className='text-impulse/65'>{sections[i].label}</span>
										</span>
									))}
								</p>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Below the content layer (z-10) without the 3D index: on a phone the
			 * card column covers the screen, and above it the cord's particles
			 * ran across the text. On desktop the column leaves the brain side
			 * free, so the cord can travel over everything. */}
			<svg
				ref={streamRef}
				className='pointer-events-none fixed inset-0 z-[5] h-full w-full transition-opacity duration-300 desk:z-30'
				aria-hidden='true'
				opacity='0'
			>
				<path
					ref={cordRef}
					className='animate-conduction'
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

			{isHome && (
			<nav
				aria-label={stepsLabel}
				className='pointer-events-none fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 desk:flex'
			>
				<span className='font-mono text-[10px] tabular-nums text-myelin'>
					{String(inHero ? 0 : (activeStep ?? 0) + 1).padStart(2, "0")}
				</span>
				<span className='h-px w-3 bg-synapse/40' />
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
								className={`block rounded-full transition-all duration-500 ease-impulse ${
									here
										? "h-2.5 w-2.5 bg-impulse shadow-[0_0_12px_2px_rgb(255_106_58/.6)]"
										: past
											? "h-1.5 w-1.5 bg-synapse"
											: "h-1.5 w-1.5 bg-synapse/35"
								}`}
							/>
						</button>
					);
				})}
				<span className='h-px w-3 bg-synapse/40' />
				<span className='font-mono text-[10px] tabular-nums text-synapse'>
					{String(withStep.length).padStart(2, "0")}
				</span>
			</nav>
			)}

			{isHome && (
			<>
			<div
				className={`pointer-events-none fixed bottom-6 left-8 z-40 hidden items-center gap-6 transition-all duration-500 ease-impulse desk:flex ${
					active === null
						? "translate-y-3 opacity-0"
						: "translate-y-0 opacity-100"
				}`}
			>
				<span className='membrane flex items-center gap-6 rounded-full px-5 py-2.5'>
					<span className='font-mono text-[10px] uppercase tracking-[.14em] text-myelin'>
						{active !== null && sections[active].label}
					</span>
					<span className='h-4 w-px bg-synapse/30' />
					{inHero && (
						<LiveKey face='enter' tone='impulse' onTrigger={() => active !== null && go(active)}>
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
				className={`pointer-events-none fixed bottom-6 left-8 z-40 hidden flex-col items-center gap-1.5 transition-all duration-500 ease-impulse desk:flex ${
					active === null
						? "pointer-events-auto translate-y-0 opacity-100"
						: "translate-y-3 opacity-0"
				}`}
			>
				<span className='font-mono text-[10px] uppercase tracking-[.14em] text-myelin'>
					{scrollHintText}
				</span>
				<span aria-hidden='true' className='animate-breathe text-synapse'>
					⌄
				</span>
			</button>
			</>
			)}
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
	tone?: "impulse" | "synapse";
	children: ReactNode;
	onTrigger: () => void;
}) => {
	const glyph = face === "enter" ? "↵" : "⌫";
	const lit = tone === "impulse";
	return (
		<button
			type='button'
			onClick={onTrigger}
			className='group pointer-events-auto inline-flex items-center gap-2.5'
		>
			<span
				aria-hidden='true'
				className={`inline-flex h-7 min-w-[2.6rem] items-center justify-center rounded-[5px] border px-2 font-mono text-[12px] leading-none transition-all duration-150 ease-impulse group-hover:translate-y-[2px] group-hover:shadow-none group-active:translate-y-[2px] group-active:shadow-none ${
					lit
						? "border-impulse/60 bg-impulse/10 text-impulse shadow-[0_2px_0_0_rgb(255_106_58/.45)]"
						: "border-synapse/50 bg-membrane-deep text-myelin shadow-[0_2px_0_0_rgb(124_152_190/.35)]"
				}`}
			>
				{glyph}
			</span>
			<span
				className={`font-label text-[11px] font-bold uppercase tracking-[.14em] transition-colors duration-200 ease-impulse group-hover:text-signal ${
					lit ? "text-impulse" : "text-myelin"
				}`}
			>
				{children}
			</span>
		</button>
	);
};

export default NervousSystem;
