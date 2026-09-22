import { BIN_HEADER_SIZE } from "./binFormat.ts";

/**
 * Downloads the brain tissue with incremental progress.
 *
 * It used to live inside Brain3D's 570-line useEffect, where there was no
 * way to test it: exercising it required a WebGL context. And it's one of
 * the file's most delicate parts — it rebuilds the header by reading
 * arbitrary-sized chunks, so a `reader` that splits the first 12 bytes
 * across two deliveries is a real case that had never been verified.
 *
 * There's no three.js and no DOM in here: it can be handed a fake fetch and
 * have its behavior checked, which is exactly what its tests do.
 */

export type TissueOptions = {
	/** Cuts the download short if the component unmounted mid-way. */
	stillAlive: () => boolean;
	onProgress: (fraction: number) => void;
	/** Injectable so it can be tested without the network. */
	fetchImpl?: typeof fetch;
};

/**
 * How many bytes the complete file will weigh, according to its header.
 *
 * The header declares the point and edge counts; each vertex is 3
 * components of 2 bytes (quantized Uint16, see binFormat). Without this
 * there's no denominator for the percentage the hero shows.
 */
export const totalBytes = (header: DataView): number => {
	const points = header.getUint32(4, true);
	const edges = header.getUint32(8, true);
	return BIN_HEADER_SIZE + (points + edges) * 3 * 2;
};

/** Assembles the first BIN_HEADER_SIZE bytes, however they arrived split up. */
const firstBytes = (chunks: Uint8Array[], howMany: number): Uint8Array => {
	const output = new Uint8Array(howMany);
	let written = 0;
	for (const c of chunks) {
		const n = Math.min(c.length, howMany - written);
		output.set(c.subarray(0, n), written);
		written += n;
		if (written >= howMany) break;
	}
	return output;
};

const concat = (chunks: Uint8Array[], total: number): Uint8Array => {
	const full = new Uint8Array(total);
	let cursor = 0;
	for (const c of chunks) {
		full.set(c, cursor);
		cursor += c.length;
	}
	return full;
};

/**
 * Returns the complete buffer, or `null` if the download was aborted
 * because the component unmounted. Throws if the response isn't OK.
 */
export const loadTissue = async (
	url: string,
	{ stillAlive, onProgress, fetchImpl = fetch }: TissueOptions,
): Promise<ArrayBuffer | null> => {
	const response = await fetchImpl(url);
	if (!response.ok) throw new Error(`HTTP ${response.status}`);
	// Without streaming (some old browser, or a simple mock) no progress is
	// possible, but the file still downloads.
	if (!response.body) return response.arrayBuffer();

	const reader = response.body.getReader();
	const chunks: Uint8Array[] = [];
	let read = 0;
	let total = 0;

	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		if (!stillAlive()) {
			await reader.cancel();
			return null;
		}
		chunks.push(value);
		read += value.length;

		if (!total && read >= BIN_HEADER_SIZE) {
			const header = firstBytes(chunks, BIN_HEADER_SIZE);
			total = totalBytes(new DataView(header.buffer));
		}
		if (total) onProgress(Math.min(1, read / total));
	}

	onProgress(1);
	return concat(chunks, read).buffer;
};
