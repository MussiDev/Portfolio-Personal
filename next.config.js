const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
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
	webpack: (config) => {
		config.resolve.alias["sanity-plugin-markdown"] = path.join(
			path.dirname(
				require.resolve("sanity-plugin-markdown/package.json")
			),
			"dist/index.cjs"
		);
		return config;
	},
};

module.exports = nextConfig;
