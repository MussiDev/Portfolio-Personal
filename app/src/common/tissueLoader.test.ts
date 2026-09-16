import assert from "node:assert/strict";
import { test } from "node:test";

import { BIN_HEADER_SIZE } from "./binFormat.ts";
import { bytesTotales, leerTejido } from "./tissueLoader.ts";

/** Un .bin mínimo pero válido: header + los bytes de vértices que declara. */
const archivoFalso = (puntos: number, aristas: number): Uint8Array => {
	const total = BIN_HEADER_SIZE + (puntos + aristas) * 3 * 2;
	const buf = new Uint8Array(total);
	const view = new DataView(buf.buffer);
	view.setUint32(4, puntos, true);
	view.setUint32(8, aristas, true);
	// Relleno reconocible para verificar que no se pierde ni reordena nada.
	for (let i = BIN_HEADER_SIZE; i < total; i += 1) buf[i] = i % 251;
	return buf;
};

/** Respuesta con streaming que entrega el archivo en trozos de `corte` bytes. */
const respuestaEnTrozos = (datos: Uint8Array, corte: number): Response => {
	let i = 0;
	return {
		ok: true,
		status: 200,
		body: {
			getReader: () => ({
				read: async () => {
					if (i >= datos.length) return { done: true, value: undefined };
					const trozo = datos.subarray(i, i + corte);
					i += corte;
					return { done: false, value: trozo };
				},
				cancel: async () => {},
			}),
		},
	} as unknown as Response;
};

test("bytesTotales deriva el tamaño del header", () => {
	const v = new DataView(new ArrayBuffer(BIN_HEADER_SIZE));
	v.setUint32(4, 10, true);
	v.setUint32(8, 4, true);
	assert.equal(bytesTotales(v), BIN_HEADER_SIZE + (10 + 4) * 3 * 2);
});

test("devuelve el archivo completo y sin alterar", async () => {
	const datos = archivoFalso(20, 8);
	const buffer = await leerTejido("/x.bin", {
		sigueVivo: () => true,
		onProgress: () => {},
		fetchImpl: async () => respuestaEnTrozos(datos, 64),
	});
	assert.ok(buffer);
	assert.deepEqual(new Uint8Array(buffer), datos);
});

test("reconstruye el header aunque llegue partido entre varios chunks", async () => {
	// Chunks de 5 bytes: el header de 12 llega en tres entregas. Es el caso
	// que el código original nunca verificó y el que un servidor real puede
	// producir en cualquier momento.
	const datos = archivoFalso(15, 6);
	const progreso: number[] = [];
	const buffer = await leerTejido("/x.bin", {
		sigueVivo: () => true,
		onProgress: (f) => progreso.push(f),
		fetchImpl: async () => respuestaEnTrozos(datos, 5),
	});

	assert.ok(buffer);
	assert.deepEqual(new Uint8Array(buffer), datos);
	assert.ok(progreso.length > 1, "debería reportar progreso más de una vez");
	assert.equal(progreso.at(-1), 1);
});

test("el progreso es monótono y nunca se pasa de 1", async () => {
	const progreso: number[] = [];
	await leerTejido("/x.bin", {
		sigueVivo: () => true,
		onProgress: (f) => progreso.push(f),
		fetchImpl: async () => respuestaEnTrozos(archivoFalso(40, 20), 17),
	});

	for (const f of progreso) assert.ok(f >= 0 && f <= 1, `fracción fuera de rango: ${f}`);
	for (let i = 1; i < progreso.length; i += 1) {
		assert.ok(progreso[i] >= progreso[i - 1], "el progreso retrocedió");
	}
});

test("aborta y devuelve null si el componente se desmontó", async () => {
	let cancelado = false;
	const datos = archivoFalso(100, 50);
	let i = 0;
	const buffer = await leerTejido("/x.bin", {
		sigueVivo: () => i <= 1,
		onProgress: () => {},
		fetchImpl: async () =>
			({
				ok: true,
				body: {
					getReader: () => ({
						read: async () => {
							i += 1;
							return { done: false, value: datos.subarray(0, 8) };
						},
						cancel: async () => {
							cancelado = true;
						},
					}),
				},
			}) as unknown as Response,
	});

	assert.equal(buffer, null, "no debe devolver datos si ya no hay quién los use");
	assert.ok(cancelado, "debe cancelar el reader para no seguir bajando 466 KB");
});

test("lanza si la respuesta no es OK", async () => {
	await assert.rejects(
		() =>
			leerTejido("/x.bin", {
				sigueVivo: () => true,
				onProgress: () => {},
				fetchImpl: async () => ({ ok: false, status: 404 }) as Response,
			}),
		/404/,
	);
});

test("sin streaming cae a arrayBuffer y no rompe", async () => {
	const datos = archivoFalso(10, 4);
	const buffer = await leerTejido("/x.bin", {
		sigueVivo: () => true,
		onProgress: () => {},
		fetchImpl: async () =>
			({
				ok: true,
				body: null,
				arrayBuffer: async () => datos.buffer,
			}) as unknown as Response,
	});
	assert.deepEqual(new Uint8Array(buffer!), datos);
});
