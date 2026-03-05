/** @type {import('next').NextConfig} */
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
};

module.exports = nextConfig;
