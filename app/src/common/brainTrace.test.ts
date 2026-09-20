import { test } from "node:test";
import assert from "node:assert/strict";

import { cloudRadius, traceHead, walkTrace } from "./brainTrace.ts";

/** A 20x20 lattice on the z = 0 plane, spaced 0.1 apart. */
const lattice = (): Float32Array => {
	const points: number[] = [];
	for (let x = -10; x <= 10; x++) {
		for (let y = -10; y <= 10; y++) points.push(x * 0.1, y * 0.1, 0);
	}
	return new Float32Array(points);
};

const at = (route: Float32Array, i: number) =>
	[route[i * 3], route[i * 3 + 1], route[i * 3 + 2]] as const;

const between = (route: Float32Array, i: number) =>
	Math.hypot(
		route[i * 3] - route[(i - 1) * 3],
		route[i * 3 + 1] - route[(i - 1) * 3 + 1],
		route[i * 3 + 2] - route[(i - 1) * 3 + 2],
	);

test("the route starts at the origin and has one point per beat, plus the origin", () => {
	const route = walkTrace(lattice(), [0.5, 0.5, 0], 6, 0.2);
	assert.equal(route.length, 7 * 3);
	assert.deepEqual(at(route, 0), [0.5, 0.5, 0]);
});

test("every step stays inside the step band: no jumps across the brain", () => {
	const route = walkTrace(lattice(), [0.5, 0.5, 0], 6, 0.2);
	for (let i = 1; i <= 6; i++) {
		const d = between(route, i);
		assert.ok(d >= 0.2 * 0.4 && d <= 0.2 * 1.8, `step ${i} measured ${d}`);
	}
});

test("the same cloud and origin always give the same route", () => {
	const a = walkTrace(lattice(), [0.5, 0.5, 0], 6, 0.2);
	const b = walkTrace(lattice(), [0.5, 0.5, 0], 6, 0.2);
	assert.deepEqual(Array.from(a), Array.from(b));
});

test("it never visits the same point twice", () => {
	const route = walkTrace(lattice(), [0.3, 0.2, 0], 6, 0.2);
	const seen = new Set<string>();
	for (let i = 0; i <= 6; i++) {
		const key = at(route, i).join(",");
		assert.ok(!seen.has(key), `point ${key} repeated`);
		seen.add(key);
	}
});

test("a cloud smaller than the walk repeats its last point instead of collapsing to the origin", () => {
	const tiny = new Float32Array([0.1, 0, 0]);
	const route = walkTrace(tiny, [0, 0, 0], 3, 0.1);
	// Float32 rounding: compare within tolerance, not exactly.
	for (const i of [1, 3]) {
		const [x, y, z] = at(route, i);
		assert.ok(Math.abs(x - 0.1) < 1e-6, `point ${i} x was ${x}`);
		assert.equal(y, 0);
		assert.equal(z, 0);
	}
});

test("cloudRadius measures the farthest point from the centre", () => {
	assert.equal(cloudRadius(new Float32Array([0, 0, 0, 3, 4, 0])), 5);
});

test("traceHead interpolates inside a segment and clamps at the ends", () => {
	const route = new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0]);
	const out = new Float32Array(3);

	traceHead(route, 0.5, out);
	assert.deepEqual(Array.from(out), [0.5, 0, 0]);

	traceHead(route, 1.5, out);
	assert.deepEqual(Array.from(out), [1, 0.5, 0]);

	traceHead(route, 9, out);
	assert.deepEqual(Array.from(out), [1, 1, 0]);

	traceHead(route, -1, out);
	assert.deepEqual(Array.from(out), [0, 0, 0]);
});

test("with a viewing axis to avoid, the route stays in the plane the camera sees", () => {
	// A 3D lattice: without the hint, the walk is free to leave the z = 0
	// plane; with it, every step should stay near it.
	const points: number[] = [];
	for (let x = -8; x <= 8; x++)
		for (let y = -8; y <= 8; y++)
			for (let z = -8; z <= 8; z++) points.push(x * 0.1, y * 0.1, z * 0.1);
	const cloud = new Float32Array(points);

	const route = walkTrace(cloud, [0.4, 0.4, 0], 6, 0.2, [0, 0, 1]);
	for (let i = 0; i <= 6; i++) {
		assert.ok(Math.abs(route[i * 3 + 2]) < 0.05, `step ${i} drifted to z=${route[i * 3 + 2]}`);
	}
});
