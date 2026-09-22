import { cache } from "react";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { BRAIN2D_PATH } from "./brain2dAsset";
import { parseBrain2D, type Brain2D } from "./brain2dFormat";

/**
 * The 2D tissue read from disk, for whatever renders on the server.
 *
 * Mobile downloads this same file over the network because it draws it on
 * a client canvas. The blog's covers come out as SVG already resolved in
 * the HTML: if the server fetched its own public URL, every post would pay
 * for a network round trip to read a file sitting right next to it.
 * `cache` keeps it to a single read per request, and the module reuses it
 * across requests.
 *
 * If the .bin is missing (an odd build, a half-finished deploy) it returns
 * null and the page draws with no cover. A post with no image still reads
 * fine; one that crashes doesn't.
 */

let inMemory: Brain2D | null | undefined;

export const getTissue2D = cache(async (): Promise<Brain2D | null> => {
	if (inMemory !== undefined) return inMemory;
	try {
		const file = path.join(process.cwd(), "public", BRAIN2D_PATH);
		const buf = await readFile(file);
		inMemory = parseBrain2D(
			buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer,
		);
	} catch {
		inMemory = null;
	}
	return inMemory;
});
