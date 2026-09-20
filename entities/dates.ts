import type { Language } from "./i18n.ts";

/**
 * Dates in api/*.json are data ("2023-11"), not display text. They used to
 * be written as English strings ("NOV 2023 - PRESENT"), so the Spanish page
 * showed English dates. Formatting happens here, per language.
 */

/** "YYYY-MM" */
export type YearMonth = string;

export interface Period {
	from: YearMonth;
	/** null = ongoing. */
	to: YearMonth | null;
}

const PRESENT: Record<Language, string> = { es: "actualidad", en: "present" };

export const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

// UTC on both ends: a local-time Date for "2022-06-01" can land on May 31
// depending on the server's timezone.
export const formatMonth = (ym: YearMonth, lang: Language): string => {
	const [year, month] = ym.split("-").map(Number);
	return new Intl.DateTimeFormat(lang, {
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(Date.UTC(year, month - 1, 1)));
};

export const formatPeriod = ({ from, to }: Period, lang: Language): string =>
	`${formatMonth(from, lang)} – ${to ? formatMonth(to, lang) : PRESENT[lang]}`;
