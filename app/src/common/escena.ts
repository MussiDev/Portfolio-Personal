import { LANGUAGES } from "../../../entities/i18n.ts";
import type { Section } from "./Brain3D";

/**
 * Which scene a route asks the nervous system for.
 *
 * The brain lives in the [lang] layout, so it survives navigation between
 * the home and a case: same WebGL session, no second download of the
 * tissue, no cut between pages. What each route needs from it is derived
 * from the pathname instead of registered by the page through an effect —
 * with an effect, React clears the old page's registration before the new
 * page sets its own, and that one commit with nothing registered unmounts
 * the canvas: exactly the cut this is meant to remove.
 */
export type Escena =
	/** The home: the brain is the index and the six regions are navigable. */
	| { modo: "home" }
	/** A case: one region holds the focus and the index steps aside. */
	| { modo: "caso"; region: number }
	/** Everything else (blog, 404): no brain at all, nothing downloaded. */
	| { modo: "ninguna" };

/**
 * Every language, including the default one: proxy.ts REWRITES "/" to "/es"
 * internally, so on the server usePathname() reports "/es" while the browser
 * reports "/". Skipping the default language here made the server pick a
 * different scene than the client, and React answered that mismatch by
 * remounting the whole page after hydration.
 */
const stripLanguage = (pathname: string): string => {
	for (const lang of LANGUAGES) {
		if (pathname === `/${lang}`) return "/";
		if (pathname.startsWith(`/${lang}/`)) return pathname.slice(lang.length + 1);
	}
	return pathname;
};

const withoutTrailingSlash = (path: string): string =>
	path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;

export const escenaDeRuta = (pathname: string, sections: Section[]): Escena => {
	const path = withoutTrailingSlash(stripLanguage(pathname));
	if (path === "/") return { modo: "home" };

	// A section's `route` is its own page: the region that owns that URL.
	const region = sections.findIndex((section) => section.route === path);
	return region === -1 ? { modo: "ninguna" } : { modo: "caso", region };
};
