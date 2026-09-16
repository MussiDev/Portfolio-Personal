import assert from "node:assert/strict";
import { test } from "node:test";

import { relatedTo } from "./relations.ts";
import type { Section } from "./Brain3D.ts";

const seccion = (label: string, related?: number[]): Section => ({
	label,
	fact: "",
	summary: "",
	href: `#${label}`,
	related,
});

test("devuelve las relaciones declaradas hacia adelante", () => {
	const s = [seccion("A", [1, 2]), seccion("B"), seccion("C")];
	assert.deepEqual(relatedTo(s, 0), [1, 2]);
});

test("devuelve también las declaradas en la otra dirección", () => {
	// B no declara nada, pero A dice estar relacionada con B: la relación
	// es mutua aunque esté escrita una sola vez.
	const s = [seccion("A", [1]), seccion("B"), seccion("C")];
	assert.deepEqual(relatedTo(s, 1), [0]);
});

test("no duplica cuando la relación está declarada en ambos lados", () => {
	const s = [seccion("A", [1]), seccion("B", [0])];
	assert.deepEqual(relatedTo(s, 0), [1]);
	assert.deepEqual(relatedTo(s, 1), [0]);
});

test("una sección nunca se relaciona consigo misma", () => {
	const s = [seccion("A", [0, 1]), seccion("B")];
	assert.deepEqual(relatedTo(s, 0), [1]);
});

test("sin relaciones devuelve una lista vacía, no undefined", () => {
	const s = [seccion("A"), seccion("B")];
	assert.deepEqual(relatedTo(s, 0), []);
});

test("índice nulo o fuera de rango no rompe", () => {
	const s = [seccion("A", [1]), seccion("B")];
	assert.deepEqual(relatedTo(s, null), []);
	assert.deepEqual(relatedTo(s, 99), []);
});

test("ignora índices que apuntan fuera del array", () => {
	// Un `related` desactualizado tras borrar una sección no puede hacer que
	// el panel intente nombrar sections[7].label y explote.
	const s = [seccion("A", [7]), seccion("B")];
	assert.deepEqual(relatedTo(s, 0), []);
});

test("el orden no depende de dónde se declaró la relación", () => {
	const declaradoEnA = [seccion("A", [2, 1]), seccion("B"), seccion("C")];
	const declaradoEnHijos = [seccion("A"), seccion("B", [0]), seccion("C", [0])];
	assert.deepEqual(relatedTo(declaradoEnA, 0), [1, 2]);
	assert.deepEqual(relatedTo(declaradoEnHijos, 0), [1, 2]);
});
