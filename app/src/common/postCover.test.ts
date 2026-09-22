import { test } from "node:test";
import assert from "node:assert/strict";

import { coverFromTissue, hashSeed } from "./postCover.ts";
import type { Brain2D } from "./brain2dFormat.ts";

/** A test "brain": 40x40 points in [0,1], with short edges. */
const tissue = (): Brain2D => {
	const points: number[] = [];
	const edges: number[] = [];
	for (let i = 0; i < 40; i++) {
		for (let j = 0; j < 40; j++) {
			const x = i / 39;
			const y = j / 39;
			points.push(x, y);
			if (i > 0) edges.push((i - 1) / 39, y, x, y);
		}
	}
	return { points: new Float32Array(points), edges: new Float32Array(edges), aspect: 1.2 };
};

const SLUG = "el-momento-en-que-la-web-empezo-a-hablar-en-markdown";

test("the hash is stable across runs", () => {
	assert.equal(hashSeed(SLUG), hashSeed(SLUG));
	assert.notEqual(hashSeed(SLUG), hashSeed("another-post"));
});

test("the same post always crops the same region", () => {
	const a = coverFromTissue(tissue(), SLUG, { aspect: 2 });
	const b = coverFromTissue(tissue(), SLUG, { aspect: 2 });
	assert.deepEqual([...a.points], [...b.points]);
	assert.deepEqual([...a.edges], [...b.edges]);
});

test("two different posts don't crop the same region", () => {
	const a = coverFromTissue(tissue(), SLUG, { aspect: 2 });
	const b = coverFromTissue(tissue(), "seo-para-devs", { aspect: 2 });
	assert.notDeepEqual([...a.points], [...b.points]);
});

test("everything that comes out falls inside the window", () => {
	const { points, edges, marks } = coverFromTissue(tissue(), SLUG, {
		aspect: 2,
		markCount: 4,
	});
	for (const v of [...points, ...edges, ...marks]) {
		assert.ok(v >= -1e-6 && v <= 1 + 1e-6, `${v} left the window`);
	}
});

test("the window never leaves the brain", () => {
	// A zoom of 1 asks for the full height: the window has to sit flush top
	// and bottom, with nothing left over on either side.
	const { points } = coverFromTissue(tissue(), SLUG, { aspect: 1.2, zoom: 1 });
	assert.equal(points.length / 2, 40 * 40);
});

test("there is one mark per tag, not one more", () => {
	for (const n of [0, 1, 3, 4]) {
		const { marks } = coverFromTissue(tissue(), SLUG, { aspect: 2, markCount: n });
		assert.equal(marks.length / 2, n, `asked for ${n} marks`);
	}
});

test("marks land on points from the crop, not between them", () => {
	const { points, marks } = coverFromTissue(tissue(), SLUG, { aspect: 2, markCount: 4 });
	const seen = new Set<string>();
	for (let i = 0; i < points.length; i += 2) seen.add(`${points[i]},${points[i + 1]}`);
	for (let i = 0; i < marks.length; i += 2) {
		assert.ok(seen.has(`${marks[i]},${marks[i + 1]}`), `mark ${i / 2} isn't tissue`);
	}
});

test("no edges cut by the border are drawn", () => {
	const { edges } = coverFromTissue(tissue(), SLUG, { aspect: 2, zoom: 0.3 });
	assert.ok(edges.length > 0, "the crop ended up with no edges");
	for (let i = 0; i < edges.length; i += 4) {
		for (const v of [edges[i], edges[i + 1], edges[i + 2], edges[i + 3]]) {
			assert.ok(v >= -1e-6 && v <= 1 + 1e-6);
		}
	}
});

test("a landscape cover crops a wide band, not the squashed brain", () => {
	const wide = coverFromTissue(tissue(), SLUG, { aspect: 3, zoom: 0.3 });
	const square = coverFromTissue(tissue(), SLUG, { aspect: 1, zoom: 0.3 });
	assert.ok(
		wide.points.length > square.points.length,
		"the landscape window should cover more tissue",
	);
});
