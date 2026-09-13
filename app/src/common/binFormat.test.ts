import { test } from "node:test";
import assert from "node:assert/strict";

import { BIN_HEADER_SIZE, parseBinHeader, unpackVectors } from "./binFormat.ts";

function buildHeader(pointCount: number, edgeCount: number, min: [number, number, number], range: number) {
	const buffer = new ArrayBuffer(BIN_HEADER_SIZE);
	const view = new DataView(buffer);
	"CRB1".split("").forEach((c, i) => view.setUint8(i, c.charCodeAt(0)));
	view.setUint32(4, pointCount, true);
	view.setUint32(8, edgeCount, true);
	view.setFloat32(12, min[0], true);
	view.setFloat32(16, min[1], true);
	view.setFloat32(20, min[2], true);
	view.setFloat32(24, range, true);
	return buffer;
}

test("parseBinHeader: reads point/edge counts and quantization bounds", () => {
	const header = parseBinHeader(buildHeader(3, 2, [-1, -2, -3], 4));
	assert.equal(header.pointCount, 3);
	assert.equal(header.edgeCount, 2);
	assert.deepEqual(header.min, [-1, -2, -3]);
	assert.equal(header.range, 4);
});

test("parseBinHeader: throws on an unrecognized magic", () => {
	const buffer = buildHeader(1, 0, [0, 0, 0], 1);
	new Uint8Array(buffer, 0, 4).set([0, 0, 0, 0]);
	assert.throws(() => parseBinHeader(buffer), /unknown format/);
});

test("unpackVectors: dequantizes uint16 values back to the original range", () => {
	const min: [number, number, number] = [-1, -1, -1];
	const range = 2;
	// 65535 maps to min + range = 1, 0 maps to min = -1
	const raw = new Uint16Array([0, 0, 0, 65535, 65535, 65535]);
	const out = unpackVectors(raw, 0, 2, min, range);
	assert.equal(out.length, 6);
	assert.ok(Math.abs(out[0] - -1) < 1e-6);
	assert.ok(Math.abs(out[3] - 1) < 1e-6);
});

test("unpackVectors: reads from the given offset", () => {
	const min: [number, number, number] = [0, 0, 0];
	const range = 65535;
	const raw = new Uint16Array([1, 2, 3, 10, 20, 30]);
	const out = unpackVectors(raw, 3, 1, min, range);
	assert.equal(out.length, 3);
	assert.ok(Math.abs(out[0] - 10) < 1e-6);
});
