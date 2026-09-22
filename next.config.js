/** @type {import('next').NextConfig} */

const STEPS = {
	"/oficio": "/#step-1",
	"/maquinas": "/#step-2",
	"/maquinas/:slug": "/#step-2",
	// /blog no longer redirects: it's a real page (app/(nervous-system)/[lang]/blog/page.tsx).
	"/contacto": "/#step-5",
	"/anterior": "/",
};

// The previous site's machines that now have their own page. These must come
// BEFORE the /maquinas/:slug wildcard (Next evaluates redirects in order).
// The whole wildcard isn't redirected to /projects/:slug because the
// previous site had eight slugs and only one exists today: the other seven
// would land on a 404 instead of the home page.
const PROJECTS_WITH_PAGE = ["nortear"];
const projectRedirects = PROJECTS_WITH_PAGE.flatMap((slug) => [
	{ source: `/maquinas/${slug}`, destination: `/projects/${slug}`, permanent: true },
	{ source: `/en/maquinas/${slug}`, destination: `/en/projects/${slug}`, permanent: true },
]);

// The route itself moved from /proyectos to /projects; redirect the old
// segment (in both locales) so indexed URLs and existing links don't 404.
const legacyProjectPathRedirects = [
	{ source: "/proyectos/:slug*", destination: "/projects/:slug*", permanent: true },
	{ source: "/en/proyectos/:slug*", destination: "/en/projects/:slug*", permanent: true },
];

const siteRedirects = [
	...projectRedirects,
	...legacyProjectPathRedirects,
	...Object.entries(STEPS).flatMap(([from, to]) => [
		{ source: from, destination: to, permanent: true },
		{ source: `/en${from}`, destination: `/en${to.slice(1)}`, permanent: true },
	]),
];

// If the Web Vitals endpoint (app/src/common/WebVitals.tsx) is on a
// different origin, it has to be declared in connect-src or the sendBeacon
// call gets blocked with no visible error: the instrumentation would look
// like it's working and report nothing. A relative path (/api/vitals) is
// already covered by 'self'.
const vitalsOrigin = (() => {
	const endpoint = process.env.NEXT_PUBLIC_VITALS_ENDPOINT;
	if (!endpoint || !endpoint.startsWith("http")) return null;
	try {
		return new URL(endpoint).origin;
	} catch {
		return null;
	}
})();

// React in development mode uses eval() to rebuild callstacks coming from
// another environment (the server, a worker). The CSP is the same in dev
// and production, so without this `next dev` spits out on every load:
// "eval() is not supported in this environment… React requires eval() in
// development mode". It's not a harmless warning: it turns off those debug
// tools exactly where they're needed.
//
// This applies ONLY in development. 'unsafe-eval' in production is one of
// the most expensive concessions a CSP can make — it turns any string
// injection into code execution — and React never uses it in production,
// so it buys nothing there.
const DEV = process.env.NODE_ENV === "development";

const CSP = [
	"default-src 'self'",
	`script-src 'self' 'unsafe-inline'${DEV ? " 'unsafe-eval'" : ""} https://www.google.com https://www.gstatic.com`,
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"font-src 'self' https://fonts.gstatic.com",
	"img-src 'self' data: https://cdn.sanity.io",
	`connect-src 'self' https://api.sanity.io https://cdn.sanity.io https://www.google.com https://fonts.googleapis.com${vitalsOrigin ? ` ${vitalsOrigin}` : ""}`,
	"frame-src https://www.google.com",
	"frame-ancestors 'none'",
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"upgrade-insecure-requests",
].join("; ");

// Headers unrelated to what the page is allowed to load (unlike the CSP,
// which does depend on that): safe to apply to /studio too, which used to
// have ZERO security headers — including Referrer-Policy, exactly the route
// where the secret travels in the query string.
const baseSecurityHeaders = [
	{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
	{ key: "X-Frame-Options", value: "DENY" },
];

const securityHeaders = [{ key: "Content-Security-Policy", value: CSP }, ...baseSecurityHeaders];

const nextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,
	turbopack: {},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "cdn.sanity.io",
				port: "",
				pathname: "/images/**",
			},
		],
	},
	async redirects() {
		return siteRedirects;
	},
	async headers() {
		return [
			{ source: "/((?!studio).*)", headers: securityHeaders },
			// /studio doesn't get the full CSP (Sanity Studio needs to load its
			// own scripts/styles/connections, which weren't verified one by
			// one), but it does get the rest: without this, /studio had no
			// Referrer-Policy, exactly on the route that authenticates via
			// query string (?secret=).
			{ source: "/studio", headers: baseSecurityHeaders },
			{ source: "/studio/:path*", headers: baseSecurityHeaders },
			{
				// Content-hashed name (scripts/prepare-brain.mjs): a model change
				// always produces a new name, so serving this file as immutable
				// for a year is safe.
				source: "/image/brain.:hash([a-f0-9]{10}).bin",
				headers: [
					{ key: "Cache-Control", value: "public, max-age=31536000, immutable" },
				],
			},
			{
				// Mobile's 2D projection (scripts/prepare-brain-2d.mjs): same
				// content-hashed naming scheme, same cache policy.
				source: "/image/brain-2d.:hash([a-f0-9]{10}).bin",
				headers: [
					{ key: "Cache-Control", value: "public, max-age=31536000, immutable" },
				],
			},
		];
	},
};

module.exports = nextConfig;
