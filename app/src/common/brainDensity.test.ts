import { test } from "node:test";
import assert from "node:assert/strict";

import { seedRegionMarkers } from "./brainDensity.ts";

/** A 21x21x1 lattice on the z = 0 plane, spaced 0.1 apart: 441 points. */
const lattice = (): Float32Array => {
	const points: number[] = [];
	for (let x = -10; x <= 10; x++) {
		for (let y = -10; y <= 10; y++) points.push(x * 0.1, y * 0.1, 0);
	}
	return new Float32Array(points);
};

const LEFT = [-0.7, 0, 0] as const;
const RIGHT = [0.7, 0, 0] as const;

const distance = (m: Float32Array, i: number, [ax, ay, az]: readonly number[]) =>
	Math.hypot(m[i * 3] - ax, m[i * 3 + 1] - ay, m[i * 3 + 2] - az);

test("a region gets exactly one mark per item behind it", () => {
	const { positions, perRegion } = seedRegionMarkers(lattice(), [LEFT, RIGHT], [19, 4], 0.5);
	assert.deepEqual(perRegion, [19, 4]);
	assert.equal(positions.length, 23 * 3);
});

test("a region with nothing behind it gets nothing", () => {
	const { perRegion, region } = seedRegionMarkers(lattice(), [LEFT, RIGHT], [0, 3], 0.5);
	assert.deepEqual(perRegion, [0, 3]);
	assert.deepEqual([...region], [1, 1, 1]);
});

test("marks sit on real tissue points, never between them", () => {
	const points = lattice();
	const { positions } = seedRegionMarkers(points, [LEFT, RIGHT], [8, 8], 0.5);
	for (let m = 0; m < positions.length; m += 3) {
		const found = (() => {
			for (let p = 0; p < points.length; p += 3) {
				if (
					points[p] === positions[m] &&
					points[p + 1] === positions[m + 1] &&
					points[p + 2] === positions[m + 2]
				)
					return true;
			}
			return false;
		})();
		assert.ok(found, `mark ${m / 3} is not a tissue point`);
	}
});

test("no two regions share a point, so the total is countable", () => {
	const { positions, perRegion } = seedRegionMarkers(
		lattice(),
		[LEFT, RIGHT, [0, 0.7, 0]],
		[10, 6, 4],
		0.5,
	);
	const seen = new Set<string>();
	for (let m = 0; m < positions.length; m += 3) {
		seen.add(`${positions[m]},${positions[m + 1]},${positions[m + 2]}`);
	}
	assert.equal(seen.size, 20);
	assert.equal(
		perRegion.reduce((a, b) => a + b, 0),
		20,
	);
});

test("marks stay with their own region", () => {
	const { positions, region } = seedRegionMarkers(lattice(), [LEFT, RIGHT], [12, 12], 0.5);
	for (let i = 0; i < region.length; i++) {
		const own = region[i] === 0 ? LEFT : RIGHT;
		const other = region[i] === 0 ? RIGHT : LEFT;
		assert.ok(
			distance(positions, i, own) < distance(positions, i, other),
			`mark ${i} sits closer to the other region`,
		);
	}
});

test("the same cloud and counts always give the same marks", () => {
	const a = seedRegionMarkers(lattice(), [LEFT, RIGHT], [19, 4], 0.5);
	const b = seedRegionMarkers(lattice(), [LEFT, RIGHT], [19, 4], 0.5);
	assert.deepEqual([...a.positions], [...b.positions]);
});

test("a region reaches past its radius rather than drop a mark", () => {
	// A radius of 0.05 holds a single lattice point; the region still gets
	// all six, because the count is the promise.
	const { perRegion } = seedRegionMarkers(lattice(), [LEFT], [6], 0.05);
	assert.deepEqual(perRegion, [6]);
});

test("marks spread over the region instead of stacking on the anchor", () => {
	const tight = seedRegionMarkers(lattice(), [LEFT], [6], 0.05);
	const wide = seedRegionMarkers(lattice(), [LEFT], [6], 0.5);
	const span = (m: Float32Array) => {
		let max = 0;
		for (let i = 0; i < m.length / 3; i++) max = Math.max(max, distance(m, i, LEFT));
		return max;
	};
	assert.ok(span(wide.positions) > span(tight.positions));
});

test("asking for more than the cloud holds reports what it could place", () => {
	const { perRegion } = seedRegionMarkers(lattice(), [LEFT], [500], 0.5);
	assert.deepEqual(perRegion, [441]);
});
