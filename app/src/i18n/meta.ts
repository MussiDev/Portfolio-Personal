import type { Metadata } from "next";

import { DEFAULT_LANGUAGE, localizedPath, type Language } from "../../../entities/i18n";

export const alternates = (
	lang: Language,
	path = "/",
): NonNullable<Metadata["alternates"]> => ({
	canonical: localizedPath(lang, path),
	languages: {
		es: localizedPath("es", path),
		en: localizedPath("en", path),
		"x-default": localizedPath(DEFAULT_LANGUAGE, path),
	},
});
