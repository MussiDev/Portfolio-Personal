/**
 * Region density: how many marks each region of the brain gets.
 *
 * The tissue used to flicker with 120 sparks seeded at random. It looked
 * alive and said nothing — the readout claimed "6 active regions", which was
 * `sections.length` dressed up as a measurement.
 *
 * Now every mark stands for one countable item: a company, a work project, a
 * written beat of the case, a recommendation, a post, a certification. Count
 * the cluster around a region and you get the same number the page shows
 * further down. A region with nothing behind it gets nothing.
 *
 * Pure on purpose — no three.js here — so the seeding can be tested.
 */

export type RegionMarkers = {
	/** Three floats per mark, grouped by region in `anchors` order. */
	readonly positions: Float32Array;
	/** The region each mark belongs to, parallel to `positions`. */
	readonly region: Uint8Array;
	/** Marks per region, in `anchors` order — the input, echoed back after
	 * clamping, so callers can assert against it. */
	readonly perRegion: readonly number[];
};

type Anchor = readonly [number, number, number];

const sq = (points: Float32Array, i: number, [ax, ay, az]: Anchor) => {
	const dx = points[i] - ax;
	const dy = points[i + 1] - ay;
	const dz = points[i + 2] - az;
	return dx * dx + dy * dy + dz * dz;
};

/**
 * Picks `evidence[r]` distinct tissue points around each anchor.
 *
 * Deterministic: same cloud, same anchors, same counts give the same marks,
 * so the brain does not reshuffle between visits. Regions are served in
 * order and never share a point, which is what makes the total countable.
 *
 * Within a region the marks are spread across the nearest candidates rather
 * than taken as the closest N — nineteen certifications packed onto the
 * single closest millimetre of tissue would read as one dot, not nineteen.
 *
 * @param spread radius around the anchor to draw from, in model units. When
 * a region needs more marks than it has tissue inside that radius, the
 * nearest points beyond it are used: the count is the promise, the radius is
 * only a preference.
 */
export const seedRegionMarkers = (
	points: Float32Array,
	anchors: readonly Anchor[],
	evidence: readonly number[],
	spread: number,
): RegionMarkers => {
	const totalPoints = Math.floor(points.length / 3);
	const taken = new Uint8Array(totalPoints);
	const perRegion: number[] = [];
	const chosen: number[] = [];

	anchors.forEach((anchor, r) => {
		const want = Math.max(0, Math.floor(evidence[r] ?? 0));
		if (want === 0) {
			perRegion.push(0);
			return;
		}

		// Every free point, nearest first. The cloud is ~9k points and this
		// runs once per region on load, so a plain sort is cheaper to read
		// than a heap and fast enough not to be felt.
		const free: number[] = [];
		for (let p = 0; p < totalPoints; p += 1) if (!taken[p]) free.push(p);
		free.sort((a, b) => sq(points, a * 3, anchor) - sq(points, b * 3, anchor));

		const limit = spread * spread;
		let inside = 0;
		while (inside < free.length && sq(points, free[inside] * 3, anchor) <= limit) inside += 1;

		// Spread the marks over the region's own tissue; if the radius holds
		// fewer points than the region has items, reach past it rather than
		// drop a mark.
		const pool = Math.max(want, inside);
		const stride = Math.max(1, Math.floor(pool / want));

		let got = 0;
		for (let k = 0; got < want && k < free.length; k += stride) {
			const p = free[k];
			taken[p] = 1;
			chosen.push(p);
			got += 1;
		}
		perRegion.push(got);
	});

	const positions = new Float32Array(chosen.length * 3);
	const region = new Uint8Array(chosen.length);
	let m = 0;
	perRegion.forEach((count, r) => {
		for (let k = 0; k < count; k += 1, m += 1) {
			const p = chosen[m] * 3;
			positions[m * 3] = points[p];
			positions[m * 3 + 1] = points[p + 1];
			positions[m * 3 + 2] = points[p + 2];
			region[m] = r;
		}
	});

	return { positions, region, perRegion };
};
