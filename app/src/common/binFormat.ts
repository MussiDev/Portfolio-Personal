export const BIN_HEADER_SIZE = 32;
export const BIN_MAGIC = "CRB1";

export interface BinHeader {
	pointCount: number;
	edgeCount: number;
	min: [number, number, number];
	range: number;
}

export function parseBinHeader(buffer: ArrayBuffer): BinHeader {
	const view = new DataView(buffer);
	const magic = String.fromCharCode(...new Uint8Array(buffer, 0, 4));
	if (magic !== BIN_MAGIC) {
		throw new Error("cerebro.bin has an unknown format");
	}
	return {
		pointCount: view.getUint32(4, true),
		edgeCount: view.getUint32(8, true),
		min: [view.getFloat32(12, true), view.getFloat32(16, true), view.getFloat32(20, true)],
		range: view.getFloat32(24, true),
	};
}

export function unpackVectors(
	raw: Uint16Array,
	offset: number,
	count: number,
	min: [number, number, number],
	range: number,
): Float32Array {
	const out = new Float32Array(count * 3);
	for (let i = 0; i < out.length; i += 1) {
		out[i] = min[i % 3] + (raw[offset + i] / 65535) * range;
	}
	return out;
}
