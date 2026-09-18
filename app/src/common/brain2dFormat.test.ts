import assert from "node:assert/strict";
import { test } from "node:test";

import { BRAIN2D_HEADER_SIZE, BRAIN2D_MAGIC, parseBrain2D } from "./brain2dFormat.ts";

const armar = (puntos: number[][], aristas: number[][], aspect: number, magic = BRAIN2D_MAGIC) => {
	const cuerpo = new Uint16Array(puntos.length * 2 + aristas.length * 4);
	let k = 0;
	for (const [x, y] of puntos) { cuerpo[k++] = Math.round(x * 65535); cuerpo[k++] = Math.round(y * 65535); }
	for (const a of aristas) for (const v of a) cuerpo[k++] = Math.round(v * 65535);
	const buf = new ArrayBuffer(BRAIN2D_HEADER_SIZE + cuerpo.byteLength);
	const view = new DataView(buf);
	for (let i = 0; i < 4; i += 1) view.setUint8(i, magic.charCodeAt(i));
	view.setUint32(4, puntos.length, true);
	view.setUint32(8, aristas.length, true);
	view.setFloat32(12, aspect, true);
	new Uint16Array(buf, BRAIN2D_HEADER_SIZE).set(cuerpo);
	return buf;
};

test("lee puntos, aristas y proporción", () => {
	const b = parseBrain2D(armar([[0, 0], [1, 1], [0.5, 0.25]], [[0, 0, 1, 1]], 1.25));
	assert.equal(b.points.length, 6);
	assert.equal(b.edges.length, 4);
	assert.ok(Math.abs(b.aspect - 1.25) < 1e-6);
	assert.deepEqual(Array.from(b.points.slice(0, 4)), [0, 0, 1, 1]);
	assert.ok(Math.abs(b.points[4] - 0.5) < 1e-4 && Math.abs(b.points[5] - 0.25) < 1e-4);
});

test("todo queda en [0,1]", () => {
	const b = parseBrain2D(armar([[0.1, 0.9], [0.99, 0.01]], [[0.2, 0.3, 0.4, 0.5]], 1));
	for (const v of [...b.points, ...b.edges]) assert.ok(v >= 0 && v <= 1);
});

test("rechaza un archivo que no es del formato", () => {
	// Por ejemplo, el .bin 3D de desktop servido en su lugar por error.
	assert.throws(() => parseBrain2D(armar([[0, 0]], [], 1, "CRB1")), /unknown format/);
});

test("el asset generado existe, parsea y trae una región por sección", async () => {
	const fs = await import("node:fs");
	const { BRAIN2D_PATH, ANCHORS_2D } = await import("./brain2dAsset.ts");
	const buf = fs.readFileSync(`public${BRAIN2D_PATH}`);
	const b = parseBrain2D(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
	assert.ok(b.points.length / 2 >= 500, "muy pocos puntos para que se lea como cerebro");
	assert.ok(buf.length < 40 * 1024, `pesa ${(buf.length / 1024).toFixed(1)} KB: el punto era no bajar el .bin 3D`);
	assert.equal(ANCHORS_2D.length, 6);
	for (const [x, y] of ANCHORS_2D) assert.ok(x >= 0 && x <= 1 && y >= 0 && y <= 1);
});
