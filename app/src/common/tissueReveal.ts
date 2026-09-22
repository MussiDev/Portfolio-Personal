/**
 * Pure curve for the tissue's build-up: given a 0→1 progress, how many
 * points and edges to show. Separated from Brain3D.tsx (which can't be
 * tested without a WebGL context) so the curve itself can be verified —
 * monotonic, within range, never splitting an edge segment in half.
 *
 * Points appear over the first 70% of progress; edges start at 25% and
 * finish at 100%, overlapping with the points ("they stretch out
 * afterward", not "after the points are done").
 */
export const revealCounts = (
	t: number,
	pointCount: number,
	edgeCount: number,
): { points: number; edges: number } => {
	const clamped = Math.max(0, Math.min(1, t));

	const points = Math.floor(pointCount * Math.min(1, clamped / 0.7));

	const edgeT = Math.max(0, Math.min(1, (clamped - 0.25) / 0.75));
	// An edge's vertex pair can't be split in half.
	const edges = Math.floor((edgeCount * edgeT) / 2) * 2;

	return { points, edges };
};

/** Cubic ease-out: starts fast, settles smoothly — keeps the build-up from
 * feeling linear/mechanical. */
export const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;
