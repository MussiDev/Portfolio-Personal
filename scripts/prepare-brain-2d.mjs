/**
 * Genera la versión 2D del cerebro para mobile a partir del MISMO .bin que
 * usa desktop, así las dos no pueden desincronizarse.
 *
 * Mobile no descarga three.js ni el .bin de 466 KB (decisión de d3d9cb0).
 * Hasta ahora el sustituto era una silueta lobulada genérica — un dibujo
 * orgánico, no un cerebro. Esto proyecta el cerebro real en vista lateral
 * (la misma rotación que Brain3D: -90° en Y), se queda con una muestra de
 * puntos y aristas, y lo cuantiza a Uint16: unos pocos KB.
 *
 * Las seis anclas de las secciones se proyectan igual, así que en mobile
 * cada sección queda en la misma región del cerebro que en desktop.
 *
 * Uso: pnpm run brain:2d  (correr después de `pnpm run brain` si cambia el modelo)
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { BIN_HEADER_SIZE, parseBinHeader, unpackVectors } from "../app/src/common/binFormat.ts";
import { BRAIN_BIN_PATH, SNAPPED_ANCHORS } from "../app/src/common/brainAsset.ts";
import { BRAIN2D_HEADER_SIZE, BRAIN2D_MAGIC } from "../app/src/common/brain2dFormat.ts";

const OUTPUT_DIR = "public/image";
const GENERATED = "app/src/common/brain2dAsset.ts";

// Cuántos guardar. El cliente dibuja un prefijo según el tamaño en pantalla
// (el orden está mezclado, así que cualquier prefijo es una muestra pareja).
const MAX_PUNTOS = 1600;
const MAX_ARISTAS = 2600;

const mulberry32 = (seed) => () => {
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const mezclar = (arr, random) => {
	for (let i = arr.length - 1; i > 0; i -= 1) {
		const j = Math.floor(random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
};

const buf = fs.readFileSync(path.join("public", BRAIN_BIN_PATH));
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const { pointCount, edgeCount, min, range } = parseBinHeader(ab);
const raw = new Uint16Array(ab, BIN_HEADER_SIZE);
const pos3 = unpackVectors(raw, 0, pointCount, min, range);
const edge3 = unpackVectors(raw, pointCount * 3, edgeCount, min, range);

// Vista lateral: rotación de -90° en Y (x' = -z), y el eje Y de pantalla
// crece hacia abajo.
const proyectar = (x, y, z) => [-z, -y];

const puntos = [];
for (let i = 0; i < pointCount; i += 1) {
	puntos.push(proyectar(pos3[i * 3], pos3[i * 3 + 1], pos3[i * 3 + 2]));
}
const aristas = [];
for (let v = 0; v + 1 < edgeCount; v += 2) {
	const a = proyectar(edge3[v * 3], edge3[v * 3 + 1], edge3[v * 3 + 2]);
	const b = proyectar(edge3[v * 3 + 3], edge3[v * 3 + 4], edge3[v * 3 + 5]);
	aristas.push([a, b]);
}

let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
for (const [x, y] of puntos) {
	minX = Math.min(minX, x); maxX = Math.max(maxX, x);
	minY = Math.min(minY, y); maxY = Math.max(maxY, y);
}
const anchoX = maxX - minX;
const altoY = maxY - minY;
const norm = ([x, y]) => [
	Math.min(1, Math.max(0, (x - minX) / anchoX)),
	Math.min(1, Math.max(0, (y - minY) / altoY)),
];

const random = mulberry32(0x2d0b);
const muestraPuntos = mezclar(puntos.slice(), random).slice(0, MAX_PUNTOS).map(norm);
const muestraAristas = mezclar(aristas.slice(), random).slice(0, MAX_ARISTAS).map(([a, b]) => [norm(a), norm(b)]);

const q = (v) => Math.round(v * 65535);
const cuerpo = new Uint16Array(muestraPuntos.length * 2 + muestraAristas.length * 4);
let k = 0;
for (const [x, y] of muestraPuntos) { cuerpo[k++] = q(x); cuerpo[k++] = q(y); }
for (const [[ax, ay], [bx, by]] of muestraAristas) {
	cuerpo[k++] = q(ax); cuerpo[k++] = q(ay); cuerpo[k++] = q(bx); cuerpo[k++] = q(by);
}

const header = Buffer.alloc(BRAIN2D_HEADER_SIZE);
header.write(BRAIN2D_MAGIC, 0, "ascii");
header.writeUInt32LE(muestraPuntos.length, 4);
header.writeUInt32LE(muestraAristas.length, 8);
header.writeFloatLE(anchoX / altoY, 12);
const archivo = Buffer.concat([header, Buffer.from(cuerpo.buffer)]);

const hash = crypto.createHash("sha256").update(archivo).digest("hex").slice(0, 10);
const nombre = `cerebro-2d.${hash}.bin`;
for (const f of fs.readdirSync(OUTPUT_DIR)) {
	if (/^cerebro-2d\.[a-f0-9]+\.bin$/.test(f) && f !== nombre) fs.unlinkSync(path.join(OUTPUT_DIR, f));
}
fs.writeFileSync(path.join(OUTPUT_DIR, nombre), archivo);

const anclas = SNAPPED_ANCHORS.map(([x, y, z]) => norm(proyectar(x, y, z)).map((v) => Number(v.toFixed(4))));
fs.writeFileSync(
	GENERATED,
	`// Generado por scripts/prepare-brain-2d.mjs — no editar a mano.
export const BRAIN2D_PATH = "/image/${nombre}";

// Las anclas de las secciones (brainAsset.ts), proyectadas a la misma vista
// lateral y normalizadas a [0,1] sobre el ancho y el alto del cerebro.
export const ANCHORS_2D: readonly [number, number][] = ${JSON.stringify(anclas)};
`,
);

console.log(`${nombre}: ${muestraPuntos.length} puntos, ${muestraAristas.length} aristas, ${(archivo.length / 1024).toFixed(1)} KB, proporción ${(anchoX / altoY).toFixed(3)}`);
console.log("anclas 2D:", JSON.stringify(anclas));
