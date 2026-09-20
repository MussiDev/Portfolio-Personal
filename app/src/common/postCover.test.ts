import { test } from "node:test";
import assert from "node:assert/strict";

import { coverFromTissue, hashSeed } from "./postCover.ts";
import type { Brain2D } from "./brain2dFormat.ts";

/** Un "cerebro" de prueba: 40x40 puntos en [0,1], con aristas cortas. */
const tejido = (): Brain2D => {
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

test("el hash es estable entre corridas", () => {
	assert.equal(hashSeed(SLUG), hashSeed(SLUG));
	assert.notEqual(hashSeed(SLUG), hashSeed("otra-nota"));
});

test("la misma nota recorta siempre la misma región", () => {
	const a = coverFromTissue(tejido(), SLUG, { aspect: 2 });
	const b = coverFromTissue(tejido(), SLUG, { aspect: 2 });
	assert.deepEqual([...a.points], [...b.points]);
	assert.deepEqual([...a.edges], [...b.edges]);
});

test("dos notas distintas no recortan la misma región", () => {
	const a = coverFromTissue(tejido(), SLUG, { aspect: 2 });
	const b = coverFromTissue(tejido(), "seo-para-devs", { aspect: 2 });
	assert.notDeepEqual([...a.points], [...b.points]);
});

test("todo lo que sale cae dentro de la ventana", () => {
	const { points, edges, marks } = coverFromTissue(tejido(), SLUG, {
		aspect: 2,
		markCount: 4,
	});
	for (const v of [...points, ...edges, ...marks]) {
		assert.ok(v >= -1e-6 && v <= 1 + 1e-6, `${v} se fue de la ventana`);
	}
});

test("la ventana nunca se sale del cerebro", () => {
	// Un zoom de 1 pide el alto entero: la ventana tiene que quedar pegada
	// arriba y abajo, no sobrar por un lado.
	const { points } = coverFromTissue(tejido(), SLUG, { aspect: 1.2, zoom: 1 });
	assert.equal(points.length / 2, 40 * 40);
});

test("hay una marca por tag, ni una más", () => {
	for (const n of [0, 1, 3, 4]) {
		const { marks } = coverFromTissue(tejido(), SLUG, { aspect: 2, markCount: n });
		assert.equal(marks.length / 2, n, `pedí ${n} marcas`);
	}
});

test("las marcas caen sobre puntos del recorte, no entre ellos", () => {
	const { points, marks } = coverFromTissue(tejido(), SLUG, { aspect: 2, markCount: 4 });
	const vistos = new Set<string>();
	for (let i = 0; i < points.length; i += 2) vistos.add(`${points[i]},${points[i + 1]}`);
	for (let i = 0; i < marks.length; i += 2) {
		assert.ok(vistos.has(`${marks[i]},${marks[i + 1]}`), `marca ${i / 2} no es tejido`);
	}
});

test("no se dibujan aristas cortadas por el borde", () => {
	const { edges } = coverFromTissue(tejido(), SLUG, { aspect: 2, zoom: 0.3 });
	assert.ok(edges.length > 0, "el recorte quedó sin aristas");
	for (let i = 0; i < edges.length; i += 4) {
		for (const v of [edges[i], edges[i + 1], edges[i + 2], edges[i + 3]]) {
			assert.ok(v >= -1e-6 && v <= 1 + 1e-6);
		}
	}
});

test("una portada apaisada recorta una banda ancha, no el cerebro achatado", () => {
	const ancha = coverFromTissue(tejido(), SLUG, { aspect: 3, zoom: 0.3 });
	const cuadrada = coverFromTissue(tejido(), SLUG, { aspect: 1, zoom: 0.3 });
	assert.ok(
		ancha.points.length > cuadrada.points.length,
		"la ventana apaisada tendría que abarcar más tejido",
	);
});
