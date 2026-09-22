import assert from "node:assert/strict";
import { test } from "node:test";

import { BIN_HEADER_SIZE } from "./binFormat.ts";
import { totalBytes, loadTissue } from "./tissueLoader.ts";

/** A minimal but valid .bin: header + the vertex bytes it declares. */
const fakeFile = (points: number, edges: number): Uint8Array => {
	const total = BIN_HEADER_SIZE + (points + edges) * 3 * 2;
	const buf = new Uint8Array(total);
	const view = new DataView(buf.buffer);
	view.setUint32(4, points, true);
	view.setUint32(8, edges, true);
	// Recognizable filler to verify nothing gets lost or reordered.
	for (let i = BIN_HEADER_SIZE; i < total; i += 1) buf[i] = i % 251;
	return buf;
};

/** A streaming response that delivers the file in `chunkSize`-byte pieces. */
const chunkedResponse = (data: Uint8Array, chunkSize: number): Response => {
	let i = 0;
	return {
		ok: true,
		status: 200,
		body: {
			getReader: () => ({
				read: async () => {
					if (i >= data.length) return { done: true, value: undefined };
					const chunk = data.subarray(i, i + chunkSize);
					i += chunkSize;
					return { done: false, value: chunk };
				},
				cancel: async () => {},
			}),
		},
	} as unknown as Response;
};

test("totalBytes derives the size from the header", () => {
	const v = new DataView(new ArrayBuffer(BIN_HEADER_SIZE));
	v.setUint32(4, 10, true);
	v.setUint32(8, 4, true);
	assert.equal(totalBytes(v), BIN_HEADER_SIZE + (10 + 4) * 3 * 2);
});

test("returns the complete file unaltered", async () => {
	const data = fakeFile(20, 8);
	const buffer = await loadTissue("/x.bin", {
		stillAlive: () => true,
		onProgress: () => {},
		fetchImpl: async () => chunkedResponse(data, 64),
	});
	assert.ok(buffer);
	assert.deepEqual(new Uint8Array(buffer), data);
});

test("rebuilds the header even if it arrives split across several chunks", async () => {
	// 5-byte chunks: the 12-byte header arrives in three deliveries. This is
	// the case the original code never verified and that a real server can
	// produce at any moment.
	const data = fakeFile(15, 6);
	const progress: number[] = [];
	const buffer = await loadTissue("/x.bin", {
		stillAlive: () => true,
		onProgress: (f) => progress.push(f),
		fetchImpl: async () => chunkedResponse(data, 5),
	});

	assert.ok(buffer);
	assert.deepEqual(new Uint8Array(buffer), data);
	assert.ok(progress.length > 1, "should report progress more than once");
	assert.equal(progress.at(-1), 1);
});

test("progress is monotonic and never exceeds 1", async () => {
	const progress: number[] = [];
	await loadTissue("/x.bin", {
		stillAlive: () => true,
		onProgress: (f) => progress.push(f),
		fetchImpl: async () => chunkedResponse(fakeFile(40, 20), 17),
	});

	for (const f of progress) assert.ok(f >= 0 && f <= 1, `fraction out of range: ${f}`);
	for (let i = 1; i < progress.length; i += 1) {
		assert.ok(progress[i] >= progress[i - 1], "progress went backwards");
	}
});

test("aborts and returns null if the component unmounted", async () => {
	let canceled = false;
	const data = fakeFile(100, 50);
	let i = 0;
	const buffer = await loadTissue("/x.bin", {
		stillAlive: () => i <= 1,
		onProgress: () => {},
		fetchImpl: async () =>
			({
				ok: true,
				body: {
					getReader: () => ({
						read: async () => {
							i += 1;
							return { done: false, value: data.subarray(0, 8) };
						},
						cancel: async () => {
							canceled = true;
						},
					}),
				},
			}) as unknown as Response,
	});

	assert.equal(buffer, null, "should not return data once no one will use it");
	assert.ok(canceled, "should cancel the reader to stop downloading 466 KB");
});

test("throws if the response isn't OK", async () => {
	await assert.rejects(
		() =>
			loadTissue("/x.bin", {
				stillAlive: () => true,
				onProgress: () => {},
				fetchImpl: async () => ({ ok: false, status: 404 }) as Response,
			}),
		/404/,
	);
});

test("without streaming it falls back to arrayBuffer without breaking", async () => {
	const data = fakeFile(10, 4);
	const buffer = await loadTissue("/x.bin", {
		stillAlive: () => true,
		onProgress: () => {},
		fetchImpl: async () =>
			({
				ok: true,
				body: null,
				arrayBuffer: async () => data.buffer,
			}) as unknown as Response,
	});
	assert.deepEqual(new Uint8Array(buffer!), data);
});
