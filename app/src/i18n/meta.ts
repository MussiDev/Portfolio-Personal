import type { Metadata } from "next";

import { IDIOMA_POR_DEFECTO, ruta, type Idioma } from "../../../entities/i18n";

/**
 * Canónico y hreflang de una página, en los dos idiomas.
 *
 * Sin esto Google trata `/maquinas` y `/en/maquinas` como dos páginas
 * distintas que dicen casi lo mismo, en vez de la misma en dos idiomas.
 * `x-default` apunta al español porque es el idioma sin prefijo y el de la
 * mayor parte del contenido.
 *
 * @param path ruta sin prefijo de idioma, empezando con "/".
 */
export const alternativas = (
	lang: Idioma,
	path = "/",
): NonNullable<Metadata["alternates"]> => ({
	canonical: ruta(lang, path),
	languages: {
		es: ruta("es", path),
		en: ruta("en", path),
		"x-default": ruta(IDIOMA_POR_DEFECTO, path),
	},
});
