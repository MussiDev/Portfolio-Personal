/**
 * Formato del cerebro 2D de mobile (ver scripts/prepare-brain-2d.mjs).
 *
 *   0  "CRB2"        magic
 *   4  u32           cantidad de puntos
 *   8  u32           cantidad de aristas
 *  12  f32           proporción ancho/alto del cerebro
 *  16  u16[]         puntos (x, y) y después aristas (ax, ay, bx, by),
 *                    normalizados a [0,1] y cuantizados a 0..65535
 *
 * Puntos y aristas vienen mezclados en build: cualquier prefijo es una
 * muestra pareja, así que dibujar menos en una pantalla chica es tomar
 * los primeros N.
 */

export const BRAIN2D_MAGIC = "CRB2";
export const BRAIN2D_HEADER_SIZE = 16;

export type Brain2D = {
	/** Pares x,y en [0,1]. */
	points: Float32Array;
	/** Cuádruplas ax,ay,bx,by en [0,1]. */
	edges: Float32Array;
	/** Ancho sobre alto: para dibujarlo sin deformar. */
	aspect: number;
};

export const parseBrain2D = (buffer: ArrayBuffer): Brain2D => {
	const view = new DataView(buffer);
	const magic = String.fromCharCode(...new Uint8Array(buffer, 0, 4));
	if (magic !== BRAIN2D_MAGIC) throw new Error("cerebro-2d.bin has an unknown format");
	const puntos = view.getUint32(4, true);
	const aristas = view.getUint32(8, true);
	const aspect = view.getFloat32(12, true);
	const raw = new Uint16Array(buffer, BRAIN2D_HEADER_SIZE, puntos * 2 + aristas * 4);
	const points = new Float32Array(puntos * 2);
	const edges = new Float32Array(aristas * 4);
	for (let i = 0; i < points.length; i += 1) points[i] = raw[i] / 65535;
	for (let i = 0; i < edges.length; i += 1) edges[i] = raw[points.length + i] / 65535;
	return { points, edges, aspect };
};
