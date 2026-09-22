import type { Locator, Page } from "@playwright/test";

/**
 * Waits for the hero's veil to lift.
 *
 * The tissue container starts at `!opacity-0` and only reaches 1 once the
 * brain (or mobile's canvas) signals it finished building. The navigation
 * labels live inside it, so until then Playwright considers them invisible
 * and any click ends up waiting. A fixed `waitForTimeout` here is a race:
 * the build takes a different amount of time in CI.
 */
export const waitForTissue = async (page: Page) => {
	// Waits for opacity > 0, not === 1: on mobile the container drops to 0.4
	// once a step's content sits over it, so landing directly on /#step-2
	// never reaches 1 and waiting for that would hang forever. All that
	// matters here is that the veil (`!opacity-0`) has dropped.
	await page.waitForFunction(
		() => {
			const veil = document.querySelector<HTMLElement>(".sweep");
			return !!veil && Number(getComputedStyle(veil).opacity) > 0;
		},
		null,
		{ timeout: 20_000 },
	);
};

/**
 * The brain's section labels, without pulling in other <nav>s.
 *
 * The page has several: the brain's own, mobile's hero (same destinations,
 * hidden on desktop), the language switch, and the progress one. A selector
 * like `nav a` mixes them together — and the language switch has the active
 * language in full orange, which is exactly the color these tests use to
 * tell the active section apart.
 */
export const brainLabels = (page: Page): Locator =>
	page
		.locator("nav:visible")
		.filter({ has: page.locator('a[href^="#step-"]') })
		.locator("a");
