import assert from "node:assert/strict";
import { test } from "node:test";

import { BRAIN2D_HEADER_SIZE, BRAIN2D_MAGIC, parseBrain2D } from "./brain2dFormat.ts";

const build = (points: number[][], edges: number[][], aspect: number, magic = BRAIN2D_MAGIC) => {
	const body = new Uint16Array(points.length * 2 + edges.length * 4);
	let k = 0;
	for (const [x, y] of points) { body[k++] = Math.round(x * 65535); body[k++] = Math.round(y * 65535); }
	for (const a of edges) for (const v of a) body[k++] = Math.round(v * 65535);
	const buf = new ArrayBuffer(BRAIN2D_HEADER_SIZE + body.byteLength);
	const view = new DataView(buf);
	for (let i = 0; i < 4; i += 1) view.setUint8(i, magic.charCodeAt(i));
	view.setUint32(4, points.length, true);
	view.setUint32(8, edges.length, true);
	view.setFloat32(12, aspect, true);
	new Uint16Array(buf, BRAIN2D_HEADER_SIZE).set(body);
	return buf;
};

test("reads points, edges and the ratio", () => {
	const b = parseBrain2D(build([[0, 0], [1, 1], [0.5, 0.25]], [[0, 0, 1, 1]], 1.25));
	assert.equal(b.points.length, 6);
	assert.equal(b.edges.length, 4);
	assert.ok(Math.abs(b.aspect - 1.25) < 1e-6);
	assert.deepEqual(Array.from(b.points.slice(0, 4)), [0, 0, 1, 1]);
	assert.ok(Math.abs(b.points[4] - 0.5) < 1e-4 && Math.abs(b.points[5] - 0.25) < 1e-4);
});

test("everything stays in [0,1]", () => {
	const b = parseBrain2D(build([[0.1, 0.9], [0.99, 0.01]], [[0.2, 0.3, 0.4, 0.5]], 1));
	for (const v of [...b.points, ...b.edges]) assert.ok(v >= 0 && v <= 1);
});

test("rejects a file that isn't in this format", () => {
	// For example, desktop's 3D .bin served in its place by mistake.
	assert.throws(() => parseBrain2D(build([[0, 0]], [], 1, "CRB1")), /unknown format/);
});

test("the generated asset exists, parses and carries a region per section", async () => {
	const fs = await import("node:fs");
	const { BRAIN2D_PATH, ANCHORS_2D } = await import("./brain2dAsset.ts");
	const buf = fs.readFileSync(`public${BRAIN2D_PATH}`);
	const b = parseBrain2D(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
	assert.ok(b.points.length / 2 >= 500, "too few points for this to read as a brain");
	assert.ok(buf.length < 40 * 1024, `weighs ${(buf.length / 1024).toFixed(1)} KB: the point was to not download the 3D .bin`);
	assert.equal(ANCHORS_2D.length, 6);
	for (const [x, y] of ANCHORS_2D) assert.ok(x >= 0 && x <= 1 && y >= 0 && y <= 1);
});
