import assert from "node:assert/strict";
import { test } from "node:test";

import { buildTissue } from "./mobileTissue.ts";

test("es determinista: la misma semilla produce el mismo tejido", () => {
	const a = buildTissue(200, 6);
	const b = buildTissue(200, 6);

	assert.deepEqual(Array.from(a.points), Array.from(b.points));
	assert.deepEqual(Array.from(a.edges), Array.from(b.edges));
	assert.deepEqual(a.nodes, b.nodes);
});

test("semillas distintas producen tejidos distintos", () => {
	const a = buildTissue(200, 6, 1);
	const b = buildTissue(200, 6, 2);

	assert.notDeepEqual(Array.from(a.points), Array.from(b.points));
});

test("todos los puntos caen dentro del cuadrado normalizado", () => {
	const { points } = buildTissue(300, 6);

	assert.ok(points.length > 0);
	for (const v of points) {
		assert.ok(v >= 0 && v <= 1, `coordenada fuera de [0,1]: ${v}`);
	}
});

test("genera aproximadamente la cantidad de puntos pedida", () => {
	const { points } = buildTissue(300, 6);
	assert.equal(points.length / 2, 300);
});

test("las aristas vienen de a pares de vértices", () => {
	const { edges } = buildTissue(300, 6);

	// x,y por vértice y dos vértices por segmento: múltiplo de 4.
	assert.equal(edges.length % 4, 0);
	assert.ok(edges.length > 0, "un tejido sin aristas se ve como polvo suelto");
});

test("hay un nodo por sección, sin repetir, y todos apoyados en el tejido", () => {
	const pointCount = 300;
	const { nodes } = buildTissue(pointCount, 6);

	assert.equal(nodes.length, 6);
	assert.equal(new Set(nodes).size, 6);
	for (const n of nodes) {
		assert.ok(Number.isInteger(n) && n >= 0 && n < pointCount);
	}
});

test("los nodos quedan repartidos, no amontonados", () => {
	const { points, nodes } = buildTissue(300, 6);
	const at = (i: number) => ({ x: points[i * 2], y: points[i * 2 + 1] });

	// Farthest-point sampling: ningún par de nodos debería quedar pegado.
	for (let a = 0; a < nodes.length; a += 1) {
		for (let b = a + 1; b < nodes.length; b += 1) {
			const p = at(nodes[a]);
			const q = at(nodes[b]);
			const d = Math.hypot(p.x - q.x, p.y - q.y);
			assert.ok(d > 0.12, `nodos ${a} y ${b} demasiado cerca: ${d}`);
		}
	}
});

test("pedir más nodos que puntos no rompe ni repite", () => {
	const { nodes } = buildTissue(4, 20);
	assert.ok(nodes.length <= 4);
	assert.equal(new Set(nodes).size, nodes.length);
});
