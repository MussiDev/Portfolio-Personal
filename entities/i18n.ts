export const LANGUAGES = ["es", "en"] as const;
export type Language = (typeof LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "es";

export type LocalizedText = Record<Language, string>;

export const isLanguage = (v: string): v is Language =>
	(LANGUAGES as readonly string[]).includes(v);

export const t = (text: LocalizedText | undefined, lang: Language): string =>
	text?.[lang] ?? text?.[DEFAULT_LANGUAGE] ?? "";

export const localizedPath = (lang: Language, path = "/"): string => {
	const clean = path.startsWith("/") ? path : `/${path}`;
	if (lang === DEFAULT_LANGUAGE) return clean;
	return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
};
