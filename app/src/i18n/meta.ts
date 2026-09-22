import type { Metadata } from "next";

import { DEFAULT_LANGUAGE, localizedPath, type Language } from "../../../entities/i18n";

export const alternates = (
	lang: Language,
	path = "/",
	/** false for content that only exists in DEFAULT_LANGUAGE (the blog):
	 * declares a single language instead of an hreflang to a translation
	 * that doesn't exist. */
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
