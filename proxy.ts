import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LANGUAGE, LANGUAGES } from "./entities/i18n";

const COOKIE_NAME = "studio_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const OUTSIDE_WORKSHOP = [
	"/anterior",
	"/studio",
	"/api",
	"/_next",
	"/opengraph-image",
	"/twitter-image",
	"/icon",
	"/apple-icon",
];

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

	if (OUTSIDE_WORKSHOP.some((p) => pathname.startsWith(p)) || pathname.includes(".")) {
		return NextResponse.next();
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
