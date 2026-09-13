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

const nextConfig = {
	reactStrictMode: true,
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
};

module.exports = nextConfig;
