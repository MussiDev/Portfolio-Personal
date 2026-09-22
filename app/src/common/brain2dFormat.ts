/**
 * Mobile's 2D brain format (see scripts/prepare-brain-2d.mjs).
 *
 *   0  "CRB2"        magic
 *   4  u32           point count
 *   8  u32           edge count
 *  12  f32           the brain's width/height ratio
 *  16  u16[]         points (x, y) then edges (ax, ay, bx, by),
 *                    normalised to [0,1] and quantised to 0..65535
 *
 * Points and edges arrive pre-shuffled from build: any prefix is an even
 * sample, so drawing fewer on a small screen means taking the first N.
 */

export const BRAIN2D_MAGIC = "CRB2";
export const BRAIN2D_HEADER_SIZE = 16;

export type Brain2D = {
	/** x,y pairs in [0,1]. */
	points: Float32Array;
	/** ax,ay,bx,by quadruples in [0,1]. */
	edges: Float32Array;
	/** Width over height: to draw it without distortion. */
	aspect: number;
};

export const parseBrain2D = (buffer: ArrayBuffer): Brain2D => {
	const view = new DataView(buffer);
	const magic = String.fromCharCode(...new Uint8Array(buffer, 0, 4));
	if (magic !== BRAIN2D_MAGIC) throw new Error("brain-2d.bin has an unknown format");
	const pointCount = view.getUint32(4, true);
	const edgeCount = view.getUint32(8, true);
	const aspect = view.getFloat32(12, true);
	const raw = new Uint16Array(buffer, BRAIN2D_HEADER_SIZE, pointCount * 2 + edgeCount * 4);
	const points = new Float32Array(pointCount * 2);
	const edges = new Float32Array(edgeCount * 4);
	for (let i = 0; i < points.length; i += 1) points[i] = raw[i] / 65535;
	for (let i = 0; i < edges.length; i += 1) edges[i] = raw[points.length + i] / 65535;
	return { points, edges, aspect };
};
