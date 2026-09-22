import assert from "node:assert/strict";
import { test } from "node:test";

import { relatedTo } from "./relations.ts";
import type { Section } from "./Brain3D.ts";

const section = (label: string, related?: number[]): Section => ({
	label,
	fact: "",
	summary: "",
	href: `#${label}`,
	evidence: 0,
	related,
});

test("returns relationships declared forward", () => {
	const s = [section("A", [1, 2]), section("B"), section("C")];
	assert.deepEqual(relatedTo(s, 0), [1, 2]);
});

test("also returns ones declared in the other direction", () => {
	// B declares nothing, but A says it's related to B: the relationship is
	// mutual even though it's written only once.
	const s = [section("A", [1]), section("B"), section("C")];
	assert.deepEqual(relatedTo(s, 1), [0]);
});

test("doesn't duplicate when the relationship is declared on both sides", () => {
	const s = [section("A", [1]), section("B", [0])];
	assert.deepEqual(relatedTo(s, 0), [1]);
	assert.deepEqual(relatedTo(s, 1), [0]);
});

test("a section is never related to itself", () => {
	const s = [section("A", [0, 1]), section("B")];
	assert.deepEqual(relatedTo(s, 0), [1]);
});

test("with no relationships returns an empty list, not undefined", () => {
	const s = [section("A"), section("B")];
	assert.deepEqual(relatedTo(s, 0), []);
});

test("a null or out-of-range index doesn't break", () => {
	const s = [section("A", [1]), section("B")];
	assert.deepEqual(relatedTo(s, null), []);
	assert.deepEqual(relatedTo(s, 99), []);
});

test("ignores indexes that point outside the array", () => {
	// A stale `related` after deleting a section can't make the panel try
	// to name sections[7].label and blow up.
	const s = [section("A", [7]), section("B")];
	assert.deepEqual(relatedTo(s, 0), []);
});

test("the order doesn't depend on where the relationship was declared", () => {
	const declaredOnA = [section("A", [2, 1]), section("B"), section("C")];
	const declaredOnChildren = [section("A"), section("B", [0]), section("C", [0])];
	assert.deepEqual(relatedTo(declaredOnA, 0), [1, 2]);
	assert.deepEqual(relatedTo(declaredOnChildren, 0), [1, 2]);
});
