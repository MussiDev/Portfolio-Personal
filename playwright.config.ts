import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3210);
const BASE_URL = `http://localhost:${PORT}`;

/**
 * E2E against the production build, not against `next dev`.
 *
 * This is deliberate: dev has no minification, hydration is different,
 * and the headers aren't the same, so a test that passes in dev says
 * nothing about what gets deployed. Also, part of what's verified here —
 * that three.js doesn't get downloaded on mobile, that the post's cover
 * isn't lazy — only makes sense against the real chunks.
 */
export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	// In CI, besides annotating the failure in the GitHub diff, it leaves
	// the HTML report on disk to upload as an artifact — an E2E that fails
	// and leaves no trace forces reproducing it by hand.
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
