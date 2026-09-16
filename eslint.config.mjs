import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

// eslint-config-next 16 se distribuye como flat config nativo: exporta
// directamente un array de configs. Antes esto pasaba por FlatCompat, que
// es el puente para configs "legacy" (extends/plugins) — y adaptar algo que
// ya es plano hacía que ESLint reventara al arrancar con "Converting
// circular structure to JSON", antes de leer un solo archivo. O sea: el
// proyecto no tenía linter, no tenía linter con hallazgos en cero.
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
