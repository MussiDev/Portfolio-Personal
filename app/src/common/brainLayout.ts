/**
 * Brain layout math, with no three.js and no DOM.
 *
 * These are the two calculations that decide what the user sees — where the
 * line runs that joins a label to its region, and where the camera points
 * while scrolling — and they used to live loose inside the WebGL
 * useEffect, where they couldn't be exercised without a GPU. Here they're
 * pure functions.
 */

/** How far the elbow sits from the label before turning toward the region. */
const ELBOW = 26;

export type Box = { left: number; right: number; top: number; height: number };
export type Origin = { left: number; top: number };

/**
 * The three points of the polyline that runs from a label to its region: it
 * leaves horizontally from the label's edge, makes an elbow, and from there
 * heads straight to the anchor.
 *
 * `towardRight` is for the left column, which leaves from its right edge;
 * the right column is mirrored.
 */
export const calloutPoints = (
	label: Box,
	anchor: { x: number; y: number },
	origin: Origin,
	towardRight: boolean,
): string => {
	const bx = (towardRight ? label.right : label.left) - origin.left;
	const by = label.top + label.height / 2 - origin.top;
	const elbow = towardRight ? bx + ELBOW : bx - ELBOW;
	return `${bx},${by} ${elbow},${by} ${anchor.x},${anchor.y}`;
};

/** Projects a normalised clip coordinate (-1..1) to the canvas pixel. */
export const toScreen = (
	clip: { x: number; y: number },
	size: { width: number; height: number },
): { x: number; y: number } => ({
	x: (clip.x * 0.5 + 0.5) * size.width,
	y: (-clip.y * 0.5 + 0.5) * size.height,
});

export type StepWeight = { index: number; weight: number };

/**
 * How much each step "weighs" based on what fraction of the viewport it
 * currently occupies.
 *
 * The camera doesn't jump from one section to another: it points at the
 * weighted average of the visible regions, so during the transition between
 * two steps it looks at a point in between. `strength` is how much
 * authority that average has — with the hero on screen it's ~0 and the
 * camera returns to its resting position.
 *
 * The 0.001 threshold discards barely-visible steps: without it, a
 * one-pixel edge would tug the camera toward a section the user isn't
 * looking at.
 */
export const visibleWeights = (
	steps: { index: number; top: number; bottom: number }[],
	viewportHeight: number,
): { weights: StepWeight[]; total: number; strength: number } => {
	const weights: StepWeight[] = [];
	let total = 0;

	for (const { index, top, bottom } of steps) {
		const visible = Math.max(0, Math.min(bottom, viewportHeight) - Math.max(top, 0));
		const weight = viewportHeight > 0 ? visible / viewportHeight : 0;
		if (weight <= 0.001) continue;
		weights.push({ index, weight });
		total += weight;
	}

	return { weights, total, strength: Math.min(1, total) };
};

/**
 * What fraction of the pulse's travel is spent on the callout's first leg
 * (the horizontal one, from the label to the elbow). It's short in pixels
 * but gets more than a third of the time: that way the pulse visibly
 * "leaves" the label before heading toward the tissue.
 */
const FIRST_LEG = 0.35;

/**
 * Where the pulse sits on the callout's polyline for a 0..1 progress.
 * `null` if the points aren't a three-vertex polyline (the callout hasn't
 * been measured yet, or the label isn't on screen).
 */
export const pointOnCallout = (
	points: string | null | undefined,
	progress: number,
): { x: number; y: number } | null => {
	const p = points?.split(" ").map((q) => q.split(",").map(Number));
	if (!p || p.length !== 3 || p.some((v) => v.length !== 2 || v.some(Number.isNaN))) {
		return null;
	}
	const [p0, p1, p2] = p;
	const inFirstLeg = progress < FIRST_LEG;
	const [a, b] = inFirstLeg ? [p0, p1] : [p1, p2];
	const u = inFirstLeg
		? progress / FIRST_LEG
		: (progress - FIRST_LEG) / (1 - FIRST_LEG);
	return { x: a[0] + (b[0] - a[0]) * u, y: a[1] + (b[1] - a[1]) * u };
};
