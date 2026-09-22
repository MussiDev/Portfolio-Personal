import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

// eslint-config-next 16 ships as native flat config: it exports an array
// of configs directly. This used to go through FlatCompat, the bridge for
// "legacy" configs (extends/plugins) — and adapting something that's
// already flat made ESLint crash on startup with "Converting circular
// structure to JSON", before reading a single file. In other words: the
// project didn't have a linter, it didn't have a linter with zero findings.
const eslintConfig = [
	{
		ignores: [
			".next/**",
			".next-broken-*/**",
			"app/node_modules/**",
			"public/**",
			"sanity/**/*.json",
		],
	},
	...coreWebVitals,
	...typescript,
];

export default eslintConfig;
