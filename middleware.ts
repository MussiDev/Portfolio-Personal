import { NextRequest, NextResponse } from "next/server";
import { IDIOMA_POR_DEFECTO, IDIOMAS } from "./entities/i18n";

const COOKIE_NAME = "studio_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/**
 * Rutas que no pertenecen al taller y no llevan idioma. Incluye las
 * convenciones de metadata de Next (opengraph-image, icon, twitter-image)
 * porque no tienen extensión en la URL — sin esto, `pathname.includes(".")`
 * no las salva y el idioma por defecto las reescribe a un path que no
 * existe: la imagen que se ve al compartir el link, rota en silencio.
 */
const FUERA_DEL_TALLER = [
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

export function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;

	if (pathname.startsWith("/studio")) return studio(req);

	if (FUERA_DEL_TALLER.some((p) => pathname.startsWith(p)) || pathname.includes(".")) {
		return NextResponse.next();
	}

	// El español es el idioma sin prefijo: `/es/algo` existe solo en el árbol
	// de archivos, nunca como URL. Si alguien la pide, se la manda al canónico.
	if (pathname === `/${IDIOMA_POR_DEFECTO}` || pathname.startsWith(`/${IDIOMA_POR_DEFECTO}/`)) {
		const url = req.nextUrl.clone();
		url.pathname = pathname.slice(IDIOMA_POR_DEFECTO.length + 1) || "/";
		return NextResponse.redirect(url, 308);
	}

	// Los demás idiomas sí viven con prefijo y pasan derecho.
	if (IDIOMAS.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) {
		return NextResponse.next();
	}

	// Todo lo demás es español: se reescribe sin que cambie la URL, así que
	// ninguna dirección ya indexada se rompe.
	const url = req.nextUrl.clone();
	url.pathname = `/${IDIOMA_POR_DEFECTO}${pathname === "/" ? "" : pathname}`;
	return NextResponse.rewrite(url);
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
