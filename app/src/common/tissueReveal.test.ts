import { test } from "node:test";
import assert from "node:assert/strict";

import { easeOutCubic, revealCounts } from "./tissueReveal.ts";

test("revealCounts: en t=0 no se muestra nada", () => {
	const r = revealCounts(0, 1000, 500);
	assert.equal(r.points, 0);
	assert.equal(r.edges, 0);
});

test("revealCounts: en t=1 se muestra todo", () => {
	const r = revealCounts(1, 1000, 500);
	assert.equal(r.points, 1000);
	assert.equal(r.edges, 500);
});

test("revealCounts: los puntos terminan de aparecer antes que las aristas", () => {
	// A t=0.7 los puntos ya completaron su ventana (0→0.7); las aristas
	// (ventana 0.25→1) todavía están a mitad de camino.
	const r = revealCounts(0.7, 1000, 500);
	assert.equal(r.points, 1000, "a t=0.7 los puntos ya están completos");
	assert.ok(r.edges > 0 && r.edges < 500, "las aristas todavía están a mitad de camino");
});

test("revealCounts: las aristas no arrancan antes de t=0.25", () => {
	const r = revealCounts(0.2, 1000, 500);
	assert.equal(r.edges, 0);
});

test("revealCounts: el conteo de aristas siempre es par (no corta un segmento a la mitad)", () => {
	for (let t = 0; t <= 1; t += 0.037) {
		const r = revealCounts(t, 777, 999);
		assert.equal(r.edges % 2, 0, `edges=${r.edges} en t=${t} debería ser par`);
	}
});

test("revealCounts: es monótono no decreciente en ambos conteos", () => {
	let prevPoints = -1;
	let prevEdges = -1;
	for (let t = 0; t <= 1; t += 0.05) {
		const r = revealCounts(t, 500, 500);
		assert.ok(r.points >= prevPoints, "points nunca retrocede");
		assert.ok(r.edges >= prevEdges, "edges nunca retrocede");
		prevPoints = r.points;
		prevEdges = r.edges;
	}
});

test("revealCounts: clampea t fuera de [0,1] sin salirse de rango", () => {
	assert.deepEqual(revealCounts(-1, 100, 100), { points: 0, edges: 0 });
	assert.deepEqual(revealCounts(2, 100, 100), { points: 100, edges: 100 });
});

test("easeOutCubic: arranca en 0 y termina en 1", () => {
	assert.equal(easeOutCubic(0), 0);
	assert.equal(easeOutCubic(1), 1);
});

test("easeOutCubic: es más rápido al principio que una curva lineal", () => {
	assert.ok(easeOutCubic(0.3) > 0.3);
});
