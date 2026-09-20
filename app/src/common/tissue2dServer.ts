import { cache } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { BRAIN2D_PATH } from "./brain2dAsset";
import { parseBrain2D, type Brain2D } from "./brain2dFormat";

/**
 * El tejido 2D leído del disco, para lo que se renderiza en el server.
 *
 * Mobile baja este mismo archivo por red porque lo dibuja en un canvas del
 * cliente. Las portadas del blog salen como SVG ya resuelto en el HTML: si
 * el server hiciera fetch a su propia URL pública, cada nota pagaría un
 * viaje de red para leer un archivo que tiene al lado. `cache` lo deja en
 * una sola lectura por request, y el módulo la reusa entre requests.
 *
 * Si el .bin no está (un build raro, un deploy a medias) devuelve null y la
 * página se dibuja sin portada. Una nota sin imagen se lee igual; una nota
 * que explota, no.
 */

let enMemoria: Brain2D | null | undefined;

export const getTissue2D = cache(async (): Promise<Brain2D | null> => {
	if (enMemoria !== undefined) return enMemoria;
	try {
		const file = path.join(process.cwd(), "public", BRAIN2D_PATH);
		const buf = await readFile(file);
		enMemoria = parseBrain2D(
			buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer,
		);
	} catch {
		enMemoria = null;
	}
	return enMemoria;
});
