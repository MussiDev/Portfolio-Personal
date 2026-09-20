/**
 * The decision trace: the path the signal walks while a case is read.
 *
 * The six beats of a case (problem, decision, mechanism, trade-off, result,
 * afterwards) light one segment each as they reach the screen. The route is
 * not drawn over the brain: it is walked over the real point cloud
 * (Tejido.posiciones), so what lights up is tissue, not an overlay that
 * happens to sit on top of it.
 *
 * Pure on purpose — no three.js here — so the walk can be tested.
 */

export type Route = Float32Array;

const dist = (ax: number, ay: number, az: number, bx: number, by: number, bz: number) =>
	Math.hypot(ax - bx, ay - by, az - bz);

/** Largest distance from the centre: the cloud's own scale, so the step
 * length doesn't depend on the model's units. */
export const cloudRadius = (points: Float32Array): number => {
	let max = 0;
	for (let i = 0; i < points.length; i += 3) {
		const d = Math.hypot(points[i], points[i + 1], points[i + 2]);
		if (d > max) max = d;
	}
	return max;
};

/**
 * Walks `steps` points away from `origin`, preferring points that keep going
 * in the same direction and sit about one step away. Deterministic: the same
 * cloud and origin always produce the same route, so the trace of a case
 * doesn't change between visits.
 *
 * Returns (steps + 1) points, starting at the origin.
 */
export const walkTrace = (
	points: Float32Array,
	origin: readonly [number, number, number],
	steps: number,
	stepLength: number,
	/**
	 * Unit axis the walk should avoid travelling along — in practice the
	 * camera's line of sight. Without it the route wandered into depth and
	 * projected to two short strokes on screen: six real steps that read as
	 * none. Omit it to walk freely.
	 */
	avoid?: readonly [number, number, number],
): Route => {
	const route = new Float32Array((steps + 1) * 3);
	route[0] = origin[0];
	route[1] = origin[1];
	route[2] = origin[2];

	const used = new Set<number>();
	let [cx, cy, cz] = origin;
	// First direction: away from the centre of the brain, so the signal
	// reads as leaving the region instead of diving into it — projected onto
	// the viewing plane when there is one, so it starts off legible.
	let [ox, oy, oz] = [cx, cy, cz];
	if (avoid) {
		const along = ox * avoid[0] + oy * avoid[1] + oz * avoid[2];
		ox -= avoid[0] * along;
		oy -= avoid[1] * along;
		oz -= avoid[2] * along;
	}
	const norm = Math.hypot(ox, oy, oz) || 1;
	let [dx, dy, dz] = [ox / norm, oy / norm, oz / norm];

	for (let s = 1; s <= steps; s++) {
		let best = -1;
		let bestScore = -Infinity;
		let nearest = -1;
		let nearestDistance = Infinity;

		for (let i = 0; i < points.length; i += 3) {
			if (used.has(i)) continue;
			const d = dist(cx, cy, cz, points[i], points[i + 1], points[i + 2]);
			if (d === 0) continue;
			if (d < nearestDistance) {
				nearestDistance = d;
				nearest = i;
			}
			if (d < stepLength * 0.4 || d > stepLength * 1.8) continue;
			const align =
				((points[i] - cx) * dx + (points[i + 1] - cy) * dy + (points[i + 2] - cz) * dz) / d;
			let score = align - (Math.abs(d - stepLength) / stepLength) * 0.5;
			if (avoid) {
				const depth =
					((points[i] - cx) * avoid[0] +
						(points[i + 1] - cy) * avoid[1] +
						(points[i + 2] - cz) * avoid[2]) /
					d;
				score -= Math.abs(depth) * 1.5;
			}
			if (score > bestScore) {
				bestScore = score;
				best = i;
			}
		}

		// Nothing inside the band (a sparse edge of the cloud): take the
		// closest point rather than cutting the trace short.
		const chosen = best === -1 ? nearest : best;
		if (chosen === -1) {
			// Fewer points than steps: repeat the last one instead of leaving
			// zeros, which would draw a segment through the origin.
			route[s * 3] = cx;
			route[s * 3 + 1] = cy;
			route[s * 3 + 2] = cz;
			continue;
		}

		used.add(chosen);
		const [nx, ny, nz] = [points[chosen], points[chosen + 1], points[chosen + 2]];
		const len = dist(cx, cy, cz, nx, ny, nz) || 1;
		dx = (nx - cx) / len;
		dy = (ny - cy) / len;
		dz = (nz - cz) / len;
		cx = nx;
		cy = ny;
		cz = nz;
		route[s * 3] = cx;
		route[s * 3 + 1] = cy;
		route[s * 3 + 2] = cz;
	}

	return route;
};

/**
 * Where the head of the trace sits for a given progress in segments
 * (2.5 = halfway through the third segment), written into `out`.
 */
export const traceHead = (
	route: Route,
	progress: number,
	out: Float32Array,
): void => {
	const segments = route.length / 3 - 1;
	const p = Math.max(0, Math.min(segments, progress));
	const i = Math.min(Math.floor(p), segments - 1);
	const f = p - i;
	for (let k = 0; k < 3; k++) {
		const a = route[i * 3 + k];
		const b = route[(i + 1) * 3 + k];
		out[k] = a + (b - a) * f;
	}
};
