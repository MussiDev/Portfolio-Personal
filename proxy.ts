import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LANGUAGE, LANGUAGES } from "./entities/i18n";

const COOKIE_NAME = "studio_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const OUTSIDE_LOCALE_ROUTING = ["/studio", "/api", "/_next"];

// The blog lives only in Sanity, in Spanish: there's no real translation
// behind /en/blog/*. This serves such routes instead of serving Spanish
// content under <html lang="en"> (breaks WCAG 3.1.1 and lies to Google
// with an hreflang that doesn't exist).
const UNTRANSLATED_SEGMENTS = ["/blog"];

const studio = (req: NextRequest) => {
	const { searchParams } = req.nextUrl;
	const secret = process.env.STUDIO_SECRET;

	if (!secret) return new NextResponse("Studio not configured.", { status: 403 });

	if (req.cookies.get(COOKIE_NAME)?.value === secret) return NextResponse.next();

	if (searchParams.get("secret") === secret) {
		const url = req.nextUrl.clone();
		url.searchParams.delete("secret");
		const res = NextResponse.redirect(url);
		res.cookies.set(COOKIE_NAME, secret, {
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			maxAge: COOKIE_MAX_AGE,
			path: "/studio",
		});
		return res;
	}

	return new NextResponse("Unauthorized.", { status: 401 });
};

export function proxy(req: NextRequest) {
	const { pathname } = req.nextUrl;

	if (pathname.startsWith("/studio")) return studio(req);

	if (OUTSIDE_LOCALE_ROUTING.some((p) => pathname.startsWith(p)) || pathname.includes(".")) {
		return NextResponse.next();
	}

	// Open Graph cards are served as-is, with or without a language prefix.
	// Next builds the og:image URL with the internal path (/es/...), and
	// the rule below used to redirect it with a 308: every scraper
	// (LinkedIn, WhatsApp, Slack) paid for a redirect before seeing the
	// image, and not all of them follow it. An image isn't duplicate
	// content; there's nothing to canonicalize here.
	if (/\/(opengraph|twitter)-image/.test(pathname)) {
		return NextResponse.next();
	}

	for (const lang of LANGUAGES) {
		if (lang === DEFAULT_LANGUAGE) continue;
		const prefix = `/${lang}`;
		const isUntranslated = UNTRANSLATED_SEGMENTS.some(
			(seg) => pathname === `${prefix}${seg}` || pathname.startsWith(`${prefix}${seg}/`),
		);
		if (isUntranslated) {
			const url = req.nextUrl.clone();
			url.pathname = pathname.slice(prefix.length) || "/";
			return NextResponse.redirect(url, 308);
		}
	}

	if (pathname === `/${DEFAULT_LANGUAGE}` || pathname.startsWith(`/${DEFAULT_LANGUAGE}/`)) {
		const url = req.nextUrl.clone();
		url.pathname = pathname.slice(DEFAULT_LANGUAGE.length + 1) || "/";
		return NextResponse.redirect(url, 308);
	}

	if (LANGUAGES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) {
		return NextResponse.next();
	}

	const url = req.nextUrl.clone();
	url.pathname = `/${DEFAULT_LANGUAGE}${pathname === "/" ? "" : pathname}`;
	return NextResponse.rewrite(url);
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
