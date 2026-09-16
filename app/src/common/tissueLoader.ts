import { BIN_HEADER_SIZE } from "./binFormat.ts";

/**
 * Descarga del tejido del cerebro con progreso incremental.
 *
 * Vivía adentro del useEffect de 570 líneas de Brain3D, donde no había forma
 * de testearlo: para ejercitarlo hacía falta un contexto WebGL. Y es de las
 * partes más delicadas del archivo — reconstruye el header leyendo chunks de
 * tamaño arbitrario, así que un `reader` que parta los primeros 12 bytes en
 * dos entregas es un caso real que nunca se había verificado.
 *
 * Acá adentro no hay nada de three.js ni del DOM: se le puede pasar un fetch
 * falso y comprobar el comportamiento, que es exactamente lo que hacen sus
 * tests.
 */

export type OpcionesTejido = {
	/** Corta la descarga si el componente se desmontó a mitad de camino. */
	sigueVivo: () => boolean;
	onProgress: (fraccion: number) => void;
	/** Inyectable para poder testear sin red. */
	fetchImpl?: typeof fetch;
};

/**
 * Cuántos bytes va a pesar el archivo completo, según su header.
 *
 * El header declara cantidad de puntos y de aristas; cada vértice son 3
 * componentes de 2 bytes (Uint16 cuantizado, ver binFormat). Sin esto no hay
 * denominador para el porcentaje que muestra el hero.
 */
export const bytesTotales = (header: DataView): number => {
	const puntos = header.getUint32(4, true);
	const aristas = header.getUint32(8, true);
	return BIN_HEADER_SIZE + (puntos + aristas) * 3 * 2;
};

/** Junta los primeros BIN_HEADER_SIZE bytes, vengan repartidos como vengan. */
const primerosBytes = (chunks: Uint8Array[], cuantos: number): Uint8Array => {
	const salida = new Uint8Array(cuantos);
	let escritos = 0;
	for (const c of chunks) {
		const n = Math.min(c.length, cuantos - escritos);
		salida.set(c.subarray(0, n), escritos);
		escritos += n;
		if (escritos >= cuantos) break;
	}
	return salida;
};

const concatenar = (chunks: Uint8Array[], total: number): Uint8Array => {
	const completo = new Uint8Array(total);
	let cursor = 0;
	for (const c of chunks) {
		completo.set(c, cursor);
		cursor += c.length;
	}
	return completo;
};

/**
 * Devuelve el buffer completo, o `null` si la descarga se abortó porque el
 * componente se desmontó. Lanza si la respuesta no es OK.
 */
export const leerTejido = async (
	url: string,
	{ sigueVivo, onProgress, fetchImpl = fetch }: OpcionesTejido,
): Promise<ArrayBuffer | null> => {
	const respuesta = await fetchImpl(url);
	if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
	// Sin streaming (algún navegador viejo, o un mock simple) no hay progreso
	// posible, pero el archivo se descarga igual.
	if (!respuesta.body) return respuesta.arrayBuffer();

	const reader = respuesta.body.getReader();
	const chunks: Uint8Array[] = [];
	let leidos = 0;
	let total = 0;

	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		if (!sigueVivo()) {
			await reader.cancel();
			return null;
		}
		chunks.push(value);
		leidos += value.length;

		if (!total && leidos >= BIN_HEADER_SIZE) {
			const cabecera = primerosBytes(chunks, BIN_HEADER_SIZE);
			total = bytesTotales(new DataView(cabecera.buffer));
		}
		if (total) onProgress(Math.min(1, leidos / total));
	}

	onProgress(1);
	return concatenar(chunks, leidos).buffer;
};
