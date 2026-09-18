/** @type {import('next').NextConfig} */

const STEPS = {
	"/oficio": "/#paso-1",
	"/maquinas": "/#paso-2",
	"/maquinas/:slug": "/#paso-2",
	// /blog ya no redirige: es una página real (app/(sistema-nervioso)/[lang]/blog/page.tsx).
	"/contacto": "/#paso-5",
	"/anterior": "/",
};

// Las máquinas del sitio anterior que hoy tienen página propia. Van ANTES
// del comodín /maquinas/:slug (Next evalúa los redirects en orden). No se
// redirige el comodín entero a /proyectos/:slug porque el sitio anterior
// tenía ocho slugs y hoy existe uno: los otros siete terminarían en un 404
// en vez de en la home.
const PROYECTOS_CON_PAGINA = ["nortear"];
const projectRedirects = PROYECTOS_CON_PAGINA.flatMap((slug) => [
	{ source: `/maquinas/${slug}`, destination: `/proyectos/${slug}`, permanent: true },
	{ source: `/en/maquinas/${slug}`, destination: `/en/proyectos/${slug}`, permanent: true },
]);

const siteRedirects = [
	...projectRedirects,
	...Object.entries(STEPS).flatMap(([from, to]) => [
		{ source: from, destination: to, permanent: true },
		{ source: `/en${from}`, destination: `/en${to.slice(1)}`, permanent: true },
	]),
];

// Si el endpoint de Web Vitals (app/src/common/WebVitals.tsx) es de otro
// origen, hay que declararlo en connect-src o el sendBeacon se bloquea sin
// error visible: la instrumentación parecería andar y no reportaría nada.
// Una ruta relativa (/api/vitals) ya está cubierta por 'self'.
const vitalsOrigin = (() => {
	const endpoint = process.env.NEXT_PUBLIC_VITALS_ENDPOINT;
	if (!endpoint || !endpoint.startsWith("http")) return null;
	try {
		return new URL(endpoint).origin;
	} catch {
		return null;
	}
})();

const CSP = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com",
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"font-src 'self' https://fonts.gstatic.com",
	"img-src 'self' data: https://cdn.sanity.io",
	`connect-src 'self' https://api.sanity.io https://cdn.sanity.io https://api.emailjs.com https://www.google.com https://fonts.googleapis.com${vitalsOrigin ? ` ${vitalsOrigin}` : ""}`,
	"frame-src https://www.google.com",
	"frame-ancestors 'none'",
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"upgrade-insecure-requests",
].join("; ");

// Headers sin relación con qué puede cargar la página (a diferencia de la
// CSP, que sí depende de eso): seguras de aplicar también a /studio, que
// antes quedaba con CERO headers de seguridad — incluido Referrer-Policy,
// justo la ruta donde el secret viaja en la query string.
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
			// /studio no lleva la CSP completa (Sanity Studio necesita cargar
			// scripts/estilos/conexiones propias que no verifiqué una por una),
			// pero sí el resto: sin esto, /studio quedaba sin Referrer-Policy
			// justo en la ruta que autentica por query string (?secret=).
			{ source: "/studio", headers: baseSecurityHeaders },
			{ source: "/studio/:path*", headers: baseSecurityHeaders },
			{
				// Nombre hasheado por contenido (scripts/prepare-brain.mjs): un
				// cambio de modelo siempre produce un nombre nuevo, así que
				// servir este archivo como inmutable por un año es seguro.
				source: "/image/cerebro.:hash([a-f0-9]{10}).bin",
				headers: [
					{ key: "Cache-Control", value: "public, max-age=31536000, immutable" },
				],
			},
		];
	},
};

module.exports = nextConfig;
