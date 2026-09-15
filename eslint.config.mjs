import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

// eslint-config-next todavía se distribuye en formato "legacy" (extends/
// plugins), no como config plano nativo — FlatCompat lo adapta al flat
// config que exige ESLint 9+. Patrón oficial de Next para app/router.
const eslintConfig = [
	...compat.extends("next/core-web-vitals", "next/typescript"),
	{
		ignores: [
			".next/**",
			"app/node_modules/**",
			"public/**",
			"sanity/**/*.json",
		],
	},
];

export default eslintConfig;
