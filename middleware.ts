import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "studio_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function middleware(req: NextRequest) {
	const { pathname, searchParams } = req.nextUrl;

	if (!pathname.startsWith("/studio")) {
		return NextResponse.next();
	}

	const secret = process.env.STUDIO_SECRET;

	if (!secret) {
		return new NextResponse("Studio not configured.", { status: 403 });
	}

	const cookie = req.cookies.get(COOKIE_NAME);
	if (cookie?.value === secret) {
		return NextResponse.next();
	}

	const querySecret = searchParams.get("secret");
	if (querySecret === secret) {
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
}

export const config = {
	matcher: "/studio/:path*",
};
