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
import { escenaDeRuta } from "./escena";
import { relatedTo } from "./relations";
import type { Section } from "./Brain3D";
import NervousSystemMobile from "./NervousSystemMobile";

/** Cuánto dura encendida cada región en el recorrido del hero en mobile. */
const CICLO_MS = 2800;

/**
 * The nervous system, mounted once in the [lang] layout.
 *
 * Living in the layout is the point: navigating from the home to a case no
 * longer unmounts the brain, so the same WebGL session and the same tissue
 * carry over instead of the world going dark between pages. Which scene a
 * route wants comes from escena.ts; a route that wants none (the blog, the
 * 404) renders its children and nothing else — no canvas, no listeners.
 */
const Sistema = ({
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
	const escena = useMemo(() => escenaDeRuta(pathname, sections), [pathname, sections]);
	const esHome = escena.modo === "home";
	const conCerebro = escena.modo !== "ninguna";

	const withStep = sections.filter((section) => section.step !== undefined);

	// El hash se escribe, no se borra: es la única URL que identifica a una
	// sección, y de ella dependen los 301 de next.config.js (/contacto →
	// /#paso-5) y el BreadcrumbList del blog. Se usa replaceState en vez de
	// pushState para no llenar el historial con un paso por cada scroll:
	// el back del navegador sigue saliendo del sitio, no recorriendo pasos.
	const goToStep = useCallback((step: number) => {
		const target = document.getElementById(`paso-${step}`);
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
		history.replaceState(null, "", step === 0 ? pathname + search : `${pathname}${search}#paso-${step}`);
	}, []);

	// `pathname` is a dependency, not decoration: the hooks below read the
	// DOM of the page being shown, and with the system in the layout that DOM
	// is replaced under them on every client navigation.
	const activeStep = useActiveStep(containerRef, sections, setHover, pathname, esHome);
	// Reading a case is what moves the signal: each beat on screen lights one
	// more segment of the trace over the tissue.
	const beat = useActiveBeat(pathname, escena.modo === "caso");

	const active = esHome
		? (hover ?? activeStep)
		: escena.modo === "caso"
			? escena.region
			: null;
	// The hero is the home's first screen and nothing else: on a case the
	// index steps aside and the region that owns the page holds the focus.
	const inHero = esHome && activeStep === null;

	/**
	 * El concepto en mobile.
	 *
	 * En desktop el cerebro es el índice y se descubre con el mouse: al
	 * posarse en una región se enciende, muestra sus conexiones reales y las
	 * etiquetas responden. En un teléfono no hay mouse, y sin esto el tejido
	 * era un dibujo: seis nodos sin número, sin relación con la lista, y
	 * nunca una región activa en el hero.
	 *
	 * Así que en el hero de mobile el tejido recorre las regiones solo — la
	 * activa se enciende, se tienden sus conexiones, y la lista de abajo
	 * responde igual que las etiquetas de desktop. Con teclado, enfocar una
	 * fila la enciende y frena el recorrido. Con movimiento reducido no hay
	 * recorrido: queda la 01 encendida, quieta.
	 *
	 * Va aparte de `active` a propósito: `active` también lo leen los atajos
	 * de teclado, y un Enter no puede abrir la sección que el ciclo tenía
	 * encendida en ese instante.
	 */
	const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
	const relaciones = useMemo(
		() => sections.map((_section, i) => relatedTo(sections, i)),
		[sections],
	);
	const [ciclo, setCiclo] = useState(0);
	const [filaEnfocada, setFilaEnfocada] = useState<number | null>(null);
	const demoMobile = isDesktop === false && inHero;

	useEffect(() => {
		if (!demoMobile || reducedMotion !== false || filaEnfocada !== null) return;
		const id = window.setInterval(
			() => setCiclo((c) => (c + 1) % sections.length),
			CICLO_MS,
		);
		return () => window.clearInterval(id);
	}, [demoMobile, reducedMotion, filaEnfocada, sections.length]);

	useEffect(() => {
		if (isDesktop !== false) return;
		const onFocusIn = (e: FocusEvent) => {
			const fila = (e.target as HTMLElement | null)?.closest?.<HTMLElement>("[data-region]");
			setFilaEnfocada(fila ? Number(fila.dataset.region) : null);
		};
		document.addEventListener("focusin", onFocusIn);
		return () => document.removeEventListener("focusin", onFocusIn);
	}, [isDesktop]);

	const regionHero = demoMobile ? (filaEnfocada ?? ciclo) : null;

	// Las filas del <nav> mobile se renderizan en el server y no leen este
	// estado: se les pasa como data-estado y el CSS hace el resto.
	useEffect(() => {
		const vinculadas = new Set(regionHero !== null ? relaciones[regionHero] : []);
		document.querySelectorAll<HTMLElement>("[data-region]").forEach((el) => {
			const i = Number(el.dataset.region);
			el.dataset.estado =
				i === regionHero ? "activo" : vinculadas.has(i) ? "vinculado" : "reposo";
		});
	}, [regionHero, relaciones]);
	// Sincronizado en un efecto y no en el cuerpo del render: escribir un ref
	// durante el render es un side effect en fase de render. Los consumidores
	// (useStepKeyboard, useSignalCord) lo leen dentro de handlers y de un
	// loop de rAF, donde un frame de diferencia no se percibe.
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
	useStepKeyboard(containerRef, activeRef, sections, goToStep, setHover, esHome);
	useSignalCord(streamRef, cordRef, particlesRef, anchorRef, activeRef, sections, esHome);

	const liftVeil = useCallback(() => setReady(true), []);

	useEffect(() => {
		const t = setTimeout(liftVeil, 8000);
		return () => clearTimeout(t);
	}, [liftVeil]);

	// El tejido de mobile ahora también se construye (canvas 2D) y avisa por
	// onReady cuando terminó, igual que el cerebro 3D — incluso si el canvas
	// falla. Ya no hace falta revelarlo a mano al detectar mobile; el
	// timeout de 8s de arriba sigue como red.

	// The blog, the 404: they render inside the same shell but ask for no
	// brain, so nothing here mounts — no canvas, no scroll listeners, no
	// tissue downloaded.
	if (!conCerebro) return <>{children}</>;

	/*
	 * DOM order and visual order differ on purpose. The page goes first in
	 * the DOM so the tab order is name → CTA → language → brain index →
	 * steps; with the brain layer first, the six labels came before the H1.
	 * `order` puts the sticky layer back on top visually, and the content
	 * rises over it with -mt-[100svh].
	 */
	return (
		// `sistema` sits here, not on the page's <main>: the brain layer, the
		// cord and the rail live in this subtree now, and the class is what
		// carries the world's surface and its focus styles.
		<div ref={containerRef} className='sistema relative flex flex-col'>
			{/* pointer-events-none only on the home, where the page is a column
			 * beside the brain and every block opts back in: that is what lets
			 * the mouse reach the regions through the gaps. A case is a plain
			 * document over the tissue, so it keeps its events. */}
			<div
				className={`relative z-10 order-2 -mt-[100svh] ${
					esHome ? "pointer-events-none" : ""
				}`}
			>
				{children}
			</div>

			<div
				// En mobile el tejido va a plena intensidad mientras es el hero
				// (no hay nada encima que leer) y recién baja a 40% cuando el
				// contenido de un paso se le pone arriba. Antes estaba fijo en
				// 40%, así que la construcción del tejido se veía a media luz
				// justo en el momento en que es el protagonista.
				className={`barrido pointer-events-none sticky top-0 z-0 order-1 h-[100svh] shrink-0 overflow-hidden transition-opacity duration-700 ease-impulso ${
					esHome
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
						active={inHero ? regionHero : active}
						relaciones={relaciones}
						anchorRef={anchorRef}
						onReady={liftVeil}
					/>
				)}

				<div
					className={`absolute bottom-20 left-0 z-20 hidden max-w-[22rem] px-8 transition-all duration-700 ease-impulso desk:block lg:px-14 ${
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
							<p className='m-0 mt-2 font-rotulo text-[13px] leading-relaxed text-mielina'>
								{sections[active].summary}
							</p>
							{/* Los nombres van en el mismo naranja tenue que reciben
							sus etiquetas en el cerebro: así el panel y lo que se
							ilumina se leen como la misma afirmación, no como dos
							cosas sueltas. La lista sale de relatedTo, igual que la
							iluminación, para que no puedan divergir. */}
							{relatedTo(sections, active).length > 0 && (
								<p className='m-0 mt-2 font-pieza text-[10px] uppercase tracking-[.12em] text-sinapsis'>
									{connectedLabel}{" "}
									{relatedTo(sections, active).map((i, n) => (
										<span key={sections[i].href + sections[i].label}>
											{n > 0 && " · "}
											<span className='text-impulso/65'>{sections[i].label}</span>
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

			{esHome && (
			<nav
				aria-label={stepsLabel}
				className='pointer-events-none fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 desk:flex'
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
			)}

			{esHome && (
			<>
			<div
				className={`pointer-events-none fixed bottom-6 left-8 z-40 hidden items-center gap-6 transition-all duration-500 ease-impulso desk:flex ${
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
				className={`pointer-events-none fixed bottom-6 left-8 z-40 hidden flex-col items-center gap-1.5 transition-all duration-500 ease-impulso desk:flex ${
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

export default Sistema;
