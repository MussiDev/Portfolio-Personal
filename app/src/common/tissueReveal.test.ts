import { test } from "node:test";
import assert from "node:assert/strict";

import { easeOutCubic, revealCounts } from "./tissueReveal.ts";

test("revealCounts: at t=0 nothing is shown", () => {
	const r = revealCounts(0, 1000, 500);
	assert.equal(r.points, 0);
	assert.equal(r.edges, 0);
});

test("revealCounts: at t=1 everything is shown", () => {
	const r = revealCounts(1, 1000, 500);
	assert.equal(r.points, 1000);
	assert.equal(r.edges, 500);
});

test("revealCounts: points finish appearing before edges", () => {
	// At t=0.7 the points already completed their window (0→0.7); edges
	// (window 0.25→1) are still halfway there.
	const r = revealCounts(0.7, 1000, 500);
	assert.equal(r.points, 1000, "at t=0.7 the points should be complete");
	assert.ok(r.edges > 0 && r.edges < 500, "the edges should still be halfway there");
});

test("revealCounts: edges don't start before t=0.25", () => {
	const r = revealCounts(0.2, 1000, 500);
	assert.equal(r.edges, 0);
});

test("revealCounts: the edge count is always even (never splits a segment in half)", () => {
	for (let t = 0; t <= 1; t += 0.037) {
		const r = revealCounts(t, 777, 999);
		assert.equal(r.edges % 2, 0, `edges=${r.edges} at t=${t} should be even`);
	}
});

test("revealCounts: is non-decreasing in both counts", () => {
	let prevPoints = -1;
	let prevEdges = -1;
	for (let t = 0; t <= 1; t += 0.05) {
		const r = revealCounts(t, 500, 500);
		assert.ok(r.points >= prevPoints, "points never goes backwards");
		assert.ok(r.edges >= prevEdges, "edges never goes backwards");
		prevPoints = r.points;
		prevEdges = r.edges;
	}
});

test("revealCounts: clamps t outside [0,1] without leaving range", () => {
	assert.deepEqual(revealCounts(-1, 100, 100), { points: 0, edges: 0 });
	assert.deepEqual(revealCounts(2, 100, 100), { points: 100, edges: 100 });
});

test("easeOutCubic: starts at 0 and ends at 1", () => {
	assert.equal(easeOutCubic(0), 0);
	assert.equal(easeOutCubic(1), 1);
});

test("easeOutCubic: is faster at the start than a linear curve", () => {
	assert.ok(easeOutCubic(0.3) > 0.3);
});
