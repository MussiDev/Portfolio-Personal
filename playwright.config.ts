import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3210);
const BASE_URL = `http://localhost:${PORT}`;

/**
 * E2E contra el build de producción, no contra `next dev`.
 *
 * Es deliberado: en dev no hay minificación, la hidratación es distinta y
 * los headers no son los mismos, así que un test que pasa en dev no dice
 * nada sobre lo que se despliega. Además parte de lo que se verifica acá —
 * que three.js no se descargue en mobile, que la portada del post no sea
 * lazy — solo tiene sentido sobre los chunks reales.
 */
export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	// En CI, además de anotar el fallo en el diff de GitHub, deja el reporte
	// HTML en disco para subirlo como artifact — un E2E que falla y no deja
	// rastro obliga a reproducirlo a mano.
	reporter: process.env.CI
		? [["github"], ["html", { open: "never" }]]
		: "list",
	use: {
		baseURL: BASE_URL,
		trace: "on-first-retry",
	},
	projects: [
		{ name: "desktop", use: { ...devices["Desktop Chrome"] } },
		{ name: "mobile", use: { ...devices["Pixel 7"] } },
	],
	webServer: {
		command: `npx next start -p ${PORT}`,
		url: BASE_URL,
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
