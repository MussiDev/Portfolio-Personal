"use client";

import { useEffect, useRef, type MutableRefObject } from "react";

import { ANCHORS_2D, BRAIN2D_PATH } from "./brain2dAsset";
import { parseBrain2D, type Brain2D } from "./brain2dFormat";
import { easeOutCubic, revealCounts } from "./tissueReveal";

/**
 * The nervous system on mobile: the same brain as desktop, in 2D.
 *
 * Mobile doesn't download three.js or the 466 KB .bin (decision from
 * d3d9cb0). The previous substitute was a generic lobed silhouette with six
 * points: something organic, but not a brain, and unrelated to the
 * sections. This draws the real brain — desktop's mesh projected to a side
 * view at build time (scripts/prepare-brain-2d.mjs), ~27 KB — and every
 * section sits at its real anchor, the same region as on desktop.
 *
 * Same build-up curve as the 3D one (`revealCounts` + `easeOutCubic`) and
 * the same contract with `useSignalCord`: it publishes to `anchorRef` where
 * the active region sits on screen, so the cord can stretch to the step's
 * badge.
 *
 * The canvas is decoration: aria-hidden. Mobile's real navigation is
 * HeroSection's <nav>, with real links that work without JS.
 */

const SPARKS = 18;
const REVEAL_MS = 900;
/** Breathing room between the brain and the text above or the list below. */
const MARGIN = 18;
/** Reference height for density: at this size everything gets drawn. */
const REFERENCE_HEIGHT = 300;
/** Below this height, the six numbers start overlapping each other. */
const HEIGHT_FOR_ALL_NUMBERS = 150;

const TISSUE_RGB = "124, 152, 190";
const IMPULSE_RGB = "255, 106, 58";

type Anchor = { x: number; y: number; ready: boolean };

const NervousSystemMobile = ({
	sectionCount,
	active,
	relations,
	anchorRef,
	onReady,
}: {
	sectionCount: number;
	active: number | null;
	/** Each section's relatedTo(), in order: the same real connections
	 * desktop's brain draws. */
	relations: number[][];
	anchorRef: MutableRefObject<Anchor>;
	onReady: () => void;
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// The loop reads live values through refs: redoing the effect on every
	// section change would restart the build-up from scratch. The sync
	// happens in an effect, not in render.
	const activeRef = useRef<number | null>(active);
	const relationsRef = useRef(relations);
	const onReadyRef = useRef(onReady);
	useEffect(() => {
		activeRef.current = active;
		relationsRef.current = relations;
		onReadyRef.current = onReady;
	});

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		// The anchor object is captured once: its identity never changes.
		const anchor = anchorRef.current;
		// With no 2D context there's nothing to draw, but the veil is still
		// waiting on this signal: without notifying, mobile would sit eight
		// seconds in black over a decoration that failed.
		if (!canvas || !ctx) {
			onReadyRef.current();
			return;
		}

		if (ANCHORS_2D.length !== sectionCount) {
			console.warn(
				`brain2dAsset.ts has ${ANCHORS_2D.length} anchors and there are ${sectionCount} sections. ` +
					"Run `pnpm run brain:2d`.",
			);
		}

		// The canvas doesn't understand CSS variables: this resolves the real
		// family name next/font registered for --font-mono.
		const monoFont =
			getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() ||
			"monospace";
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

		let width = 0;
		let height = 0;
		// The hero's free strip in page coordinates (with the canvas sticky
		// above everything, these match the canvas's own coordinates while
		// the hero is on screen).
		let band: { top: number; bottom: number } | null = null;
		const from = document.querySelector<HTMLElement>("[data-tissue-from]");
		const to = document.querySelector<HTMLElement>("[data-tissue-to]");
		const measure = () => {
			const rect = canvas.getBoundingClientRect();
			if (!rect.width || !rect.height) return;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			width = rect.width;
			height = rect.height;
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			if (from && to) {
				const y = window.scrollY;
				band = {
					top: from.getBoundingClientRect().bottom + y,
					bottom: to.getBoundingClientRect().top + y,
				};
			}
		};
		measure();
		const resizeObserver = new ResizeObserver(measure);
		resizeObserver.observe(canvas);
		// The hero's text changes height when fonts load or when the pitch
		// wraps to a different number of lines.
		if (from) resizeObserver.observe(from);
		if (to) resizeObserver.observe(to);

		// The brain fits into the free strip between the hero's text and the
		// list, without distorting: it's capped by width or by height,
		// whichever runs out first. No size floor — a floor pushed it under
		// the text on short screens.
		const box = (aspect: number) => {
			const free = band ?? { top: height * 0.17, bottom: height * 0.65 };
			const freeHeight = Math.max(0, free.bottom - free.top - MARGIN * 2);
			const boxWidth = Math.min(width * 0.94, freeHeight * aspect);
			const boxHeight = boxWidth / aspect;
			return {
				boxWidth,
				boxHeight,
				ox: (width - boxWidth) / 2,
				oy: free.top + MARGIN + (freeHeight - boxHeight) / 2,
			};
		};

		let brain: Brain2D | null = null;
		let alive = true;
		let raf = 0;
		let frame = 0;
		let start = 0;
		let announced = false;
		let intersecting = true;
		let pageVisible = document.visibilityState !== "hidden";
		const isVisible = () => intersecting && pageVisible;

		const draw = (now: number) => {
			if (!alive) return;
			if (!isVisible()) {
				raf = 0;
				return;
			}
			if (!brain || !width || !height) {
				raf = requestAnimationFrame(draw);
				return;
			}
			if (!start) start = now;

			const { points, edges, aspect } = brain;
			const { boxWidth, boxHeight, ox, oy } = box(aspect);
			const px = (x: number) => ox + x * boxWidth;
			const py = (y: number) => oy + y * boxHeight;

			// Constant density: on a short screen a prefix of points and edges
			// gets drawn (they come pre-shuffled from build, so any prefix is
			// an even sample). Everything on a small brain would look like a
			// smudge.
			const density = Math.min(1, Math.max(0.3, (boxHeight / REFERENCE_HEIGHT) ** 2));
			const totalPoints = Math.round((points.length / 2) * density);
			const totalEdges = Math.round((edges.length / 4) * density);

			const t = reducedMotion ? 1 : Math.min(1, (now - start) / REVEAL_MS);
			// revealCounts works with edge vertices (in pairs).
			const shown = revealCounts(easeOutCubic(t), totalPoints, totalEdges * 2);
			const visibleEdges = shown.edges / 2;

			ctx.clearRect(0, 0, width, height);

			ctx.strokeStyle = `rgba(${TISSUE_RGB}, 0.2)`;
			ctx.lineWidth = 0.8;
			ctx.beginPath();
			for (let e = 0; e < visibleEdges; e += 1) {
				const k = e * 4;
				ctx.moveTo(px(edges[k]), py(edges[k + 1]));
				ctx.lineTo(px(edges[k + 2]), py(edges[k + 3]));
			}
			ctx.stroke();

			ctx.fillStyle = `rgba(${TISSUE_RGB}, 0.6)`;
			for (let i = 0; i < shown.points; i += 1) {
				ctx.fillRect(px(points[i * 2]) - 0.6, py(points[i * 2 + 1]) - 0.6, 1.2, 1.2);
			}

			// Spontaneous sparks, the same gesture as the 3D sparks:
			// pow(f, 7) gives brief, separated flickers, not a uniform pulse.
			if (!reducedMotion && t >= 1) {
				for (let i = 0; i < SPARKS; i += 1) {
					const f = (Math.sin(frame / 42 + (i / SPARKS) * Math.PI * 2) + 1) / 2;
					const spike = f ** 7;
					if (spike < 0.02) continue;
					const k = Math.floor((i / SPARKS) * totalPoints) * 2;
					ctx.fillStyle = `rgba(${IMPULSE_RGB}, ${spike * 0.8})`;
					ctx.beginPath();
					ctx.arc(px(points[k]), py(points[k + 1]), 1.1, 0, Math.PI * 2);
					ctx.fill();
				}
			}

			// The regions: the same anchor as on desktop, three states like
			// desktop's labels — active, linked (real content relationship)
			// and idle. They appear once the tissue has built up.
			const activeNow = activeRef.current;
			const linked = new Set(
				activeNow !== null ? (relationsRef.current[activeNow] ?? []) : [],
			);
			const onScreen = (i: number) => {
				const a = ANCHORS_2D[i];
				return a ? { x: px(a[0]), y: py(a[1]) } : null;
			};

			const numberAll = boxHeight >= HEIGHT_FOR_ALL_NUMBERS;

			if (t >= 0.7) {
				// Connections first, so they sit under the nodes.
				const origin = activeNow !== null ? onScreen(activeNow) : null;
				if (origin) {
					ctx.save();
					ctx.strokeStyle = `rgba(${IMPULSE_RGB}, 0.75)`;
					ctx.lineWidth = 1.2;
					ctx.setLineDash([3, 4]);
					// The dashes run outward: it reads as a signal traveling.
					ctx.lineDashOffset = reducedMotion ? 0 : -frame * 0.35;
					for (const j of linked) {
						const destination = onScreen(j);
						if (!destination) continue;
						ctx.beginPath();
						ctx.moveTo(origin.x, origin.y);
						ctx.lineTo(destination.x, destination.y);
						ctx.stroke();
					}
					ctx.restore();
				}

				for (let i = 0; i < sectionCount; i += 1) {
					const p = onScreen(i);
					if (!p) continue;
					const lit = activeNow === i;
					const isLinked = linked.has(i);
					const breath = reducedMotion
						? 0.7
						: 0.45 + 0.55 * ((Math.sin(frame / 48 + i * 1.7) + 1) / 2);

					if (lit) {
						ctx.fillStyle = `rgba(${IMPULSE_RGB}, 0.18)`;
						ctx.beginPath();
						ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
						ctx.fill();
					}
					ctx.strokeStyle = lit
						? `rgba(${IMPULSE_RGB}, 0.95)`
						: isLinked
							? `rgba(${IMPULSE_RGB}, 0.65)`
							: `rgba(${TISSUE_RGB}, ${0.4 + breath * 0.3})`;
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.arc(p.x, p.y, lit ? 7 : isLinked ? 6 : 5, 0, Math.PI * 2);
					ctx.stroke();

					ctx.fillStyle = lit
						? `rgba(${IMPULSE_RGB}, 1)`
						: isLinked
							? `rgba(${IMPULSE_RGB}, 0.7)`
							: `rgba(${TISSUE_RGB}, ${breath})`;
					ctx.beginPath();
					ctx.arc(p.x, p.y, lit ? 3 : 2, 0, Math.PI * 2);
					ctx.fill();

					// The section's number, the same one the list below and
					// desktop's labels use: the map's legend. On a short brain
					// (an iPhone SE leaves ~130px) the six numbers overlap each
					// other, so only the lit regions get numbered; the list
					// below still shows all six.
					if (!numberAll && !lit && !isLinked) continue;
					// To the left of the node if it's pressed against the right edge.
					const toTheLeft = p.x > width - 36;
					ctx.font = `500 10px ${monoFont}`;
					ctx.textBaseline = "middle";
					ctx.textAlign = toTheLeft ? "right" : "left";
					ctx.fillStyle = lit
						? `rgba(${IMPULSE_RGB}, 1)`
						: isLinked
							? `rgba(${IMPULSE_RGB}, 0.8)`
							: `rgba(${TISSUE_RGB}, 0.85)`;
					ctx.fillText(
						String(i + 1).padStart(2, "0"),
						toTheLeft ? p.x - 11 : p.x + 11,
						p.y,
					);
				}
			}

			// Contract with useSignalCord: viewport coordinates, because the
			// cord's SVG is `fixed`.
			const rect = canvas.getBoundingClientRect();
			const activeSpot = activeNow !== null && t >= 1 ? onScreen(activeNow) : null;
			if (activeSpot) {
				anchor.x = rect.left + activeSpot.x;
				anchor.y = rect.top + activeSpot.y;
				anchor.ready = true;
			} else {
				anchor.ready = false;
			}

			if (t >= 1 && !announced) {
				announced = true;
				onReadyRef.current();
			}

			frame += 1;
			raf = requestAnimationFrame(draw);
		};

		const startLoop = () => {
			if (!raf) raf = requestAnimationFrame(draw);
		};

		// Kicked off by the layout's startup script preload (same pattern as
		// desktop's .bin), so this usually arrives from cache.
		fetch(BRAIN2D_PATH)
			.then((r) => {
				if (!r.ok) throw new Error(`HTTP ${r.status}`);
				return r.arrayBuffer();
			})
			.then((buffer) => {
				if (!alive) return;
				brain = parseBrain2D(buffer);
				startLoop();
			})
			.catch((e) => {
				console.error("Could not load the 2D brain:", e);
				onReadyRef.current();
			});

		const visibilityObserver = new IntersectionObserver(
			([entry]) => {
				intersecting = entry.isIntersecting;
				if (isVisible()) startLoop();
			},
			{ threshold: 0 },
		);
		visibilityObserver.observe(canvas);

		const onVisibilityChange = () => {
			pageVisible = document.visibilityState !== "hidden";
			if (isVisible()) startLoop();
		};
		document.addEventListener("visibilitychange", onVisibilityChange);

		return () => {
			alive = false;
			if (raf) cancelAnimationFrame(raf);
			resizeObserver.disconnect();
			visibilityObserver.disconnect();
			document.removeEventListener("visibilitychange", onVisibilityChange);
			anchor.ready = false;
		};
	}, [anchorRef, sectionCount]);

	return <canvas ref={canvasRef} aria-hidden='true' className='h-full w-full' />;
};

export default NervousSystemMobile;
