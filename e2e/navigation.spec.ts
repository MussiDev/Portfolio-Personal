import { expect, test } from "@playwright/test";

import { waitForTissue } from "./util";

/**
 * Deep links were a real regression: the site was clearing its own hash on
 * load, so /#step-3 landed on the hero, next.config.js's 301s (/contacto →
 * /#step-5) went nowhere, and no section was shareable. These tests exist
 * so it can't happen again without anyone noticing.
 */

const sectionTop = async (page: import("@playwright/test").Page, step: number) =>
	page.evaluate((n) => {
		const el = document.getElementById(`step-${n}`);
		return el ? Math.round(el.getBoundingClientRect().top) : null;
	}, step);

test("entering with #step-N lands on that section and keeps the hash", async ({ page }) => {
	await page.goto("/#step-3");
	await expect(page).toHaveURL(/#step-3$/);
	await expect.poll(() => sectionTop(page, 3)).toBeLessThan(5);
});

test("navigating through the menu writes the hash to the URL", async ({ page }) => {
	await page.goto("/");
	// The labels live inside the hero's veil, which sits at opacity 0 until
	// the tissue finishes building: without waiting for it, the click hangs
	// waiting for visibility and the test becomes a race.
	await waitForTissue(page);
	// On mobile the destination lives in the hero's <nav>; on desktop, in
	// the brain's labels. Both exist in the DOM at once and only one is
	// visible per breakpoint, so the visible one has to be requested — both
	// paths end up in goToStep, which is what's being verified.
	await page.locator('a[href="#step-3"]:visible').first().click();
	await expect(page).toHaveURL(/#step-3$/);
	await expect.poll(() => sectionTop(page, 3)).toBeLessThan(5);
});

test("returning to the hero clears the hash instead of leaving #step-0", async ({ page }) => {
	await page.goto("/#step-2");
	await expect(page).toHaveURL(/#step-2$/);
	// Without waiting for hydration, Escape arrives before useStepKeyboard
	// attaches its listener: the key does nothing and the test fails
	// intermittently, blaming a bug that doesn't exist.
	await waitForTissue(page);
	await page.keyboard.press("Escape");
	await expect(page).not.toHaveURL(/#step-0$/);
});

test("the permanent redirect from /contacto leads to the contact step", async ({ page }) => {
	await page.goto("/contacto");
	await expect(page).toHaveURL(/#step-5$/);
	await expect.poll(() => sectionTop(page, 5)).toBeLessThan(5);
});

test("the skip link leads to the content", async ({ page }) => {
	await page.goto("/");
	await page.keyboard.press("Tab");
	const skip = page.locator("a[href='#step-1']").first();
	await expect(skip).toBeFocused();
	await page.keyboard.press("Enter");
	await expect.poll(() => sectionTop(page, 1)).toBeLessThan(5);
});
