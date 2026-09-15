import type { Language } from "../../../../entities/i18n";

/**
 * Fecha larga localizada para un post ("14 de septiembre de 2026" /
 * "September 14, 2026"). Intl.DateTimeFormat nativo en vez de date-fns:
 * misma salida, sin arrastrar una dependencia para dos llamadas a format().
 */
export const formatPostDate = (isoDate: string, lang: Language): string => {
	const date = new Date(isoDate);
	return lang === "en"
		? new Intl.DateTimeFormat("en", {
				month: "long",
				day: "numeric",
				year: "numeric",
			}).format(date)
		: new Intl.DateTimeFormat("es", {
				day: "numeric",
				month: "long",
				year: "numeric",
			}).format(date);
};
