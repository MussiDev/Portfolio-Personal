/** @type {import('next').NextConfig} */

const STEPS = {
	"/oficio": "/#paso-1",
	"/maquinas": "/#paso-2",
	"/maquinas/:slug": "/#paso-2",
	"/blog": "/#paso-4",
	"/contacto": "/#paso-5",
	"/anterior": "/",
};

const siteRedirects = Object.entries(STEPS).flatMap(([from, to]) => [
	{ source: from, destination: to, permanent: true },
	{ source: `/en${from}`, destination: `/en${to.slice(1)}`, permanent: true },
]);

const CSP = [
	"default-src 'self'",
	"script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com",
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"font-src 'self' https://fonts.gstatic.com",
	"img-src 'self' data: https://cdn.sanity.io",
	"connect-src 'self' https://api.sanity.io https://cdn.sanity.io https://api.emailjs.com https://www.google.com https://fonts.googleapis.com",
	"frame-src https://www.google.com",
	"base-uri 'self'",
	"form-action 'self'",
].join("; ");

const securityHeaders = [
	{ key: "Content-Security-Policy", value: CSP },
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

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
