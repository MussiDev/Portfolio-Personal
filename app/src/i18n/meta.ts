import type { Metadata } from "next";

import { DEFAULT_LANGUAGE, localizedPath, type Language } from "../../../entities/i18n";

export const alternates = (
	lang: Language,
	path = "/",
	/** false para contenido que solo existe en DEFAULT_LANGUAGE (el blog):
	 * declara un único idioma en vez de un hreflang a una traducción
	 * inexistente. */
	translated = true,
): NonNullable<Metadata["alternates"]> => ({
	canonical: localizedPath(translated ? lang : DEFAULT_LANGUAGE, path),
	languages: translated
		? {
				es: localizedPath("es", path),
				en: localizedPath("en", path),
				"x-default": localizedPath(DEFAULT_LANGUAGE, path),
			}
		: {
				es: localizedPath(DEFAULT_LANGUAGE, path),
				"x-default": localizedPath(DEFAULT_LANGUAGE, path),
			},
});
