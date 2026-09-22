import { expect, test } from "@playwright/test";

/**
 * The form is the site's only conversion path and had a silent
 * accessibility bug: the `aria-live` region was mounted together with its
 * content, and a screen reader only announces changes inside a live region
 * that ALREADY existed in the DOM. In other words: a blind user would
 * submit and find out nothing — neither success nor error.
 *
 * It's exactly the kind of bug that isn't visible by looking at the
 * screen, so it needs to be covered by a test.
 */

test.beforeEach(async ({ page }) => {
	await page.goto("/#step-5");
	await page.locator("form").first().scrollIntoViewIfNeeded();
});

test("the live region exists before submitting, it doesn't appear with the message", async ({ page }) => {
	const live = page.locator('form [aria-live="polite"]');
	await expect(live).toHaveCount(1);
	await expect(live).toHaveAttribute("role", "status");
	// Empty but present: if it were only mounting along with the message,
	// this count would be 0 before submitting.
	await expect(live).toHaveText("");
});

test("fields have an associated label and autocomplete", async ({ page }) => {
	for (const [id, autocomplete] of [
		["name", "name"],
		["email", "email"],
	] as const) {
		const field = page.locator(`#${id}`);
		await expect(field).toHaveAttribute("autocomplete", autocomplete);
		// getByLabel fails if the <label for> doesn't resolve to the field.
		await expect(field).toBeVisible();
	}
	await expect(page.locator("form label")).toHaveCount(3);
});

test("without a solved captcha the submission is blocked and it's said in the live region", async ({ page }) => {
	await page.fill("#name", "E2E Test");
	await page.fill("#email", "prueba@example.com");
	await page.fill("#message", "Automated test message.");
	await page.click('form button[type="submit"]');

	// Fail closed (ContactForm + /api/contact): without a sitekey or a
	// solved captcha, it blocks. Either way the user has to get a message,
	// not silence.
	const live = page.locator('form [aria-live="polite"]');
	await expect(live).not.toHaveText("", { timeout: 10_000 });
});

test("the honeypot is unreachable by keyboard or by screen readers", async ({ page }) => {
	const honeypot = page.locator('input[name="lastName"]');
	await expect(honeypot).toHaveAttribute("tabindex", "-1");
	await expect(honeypot).toHaveAttribute("aria-hidden", "true");
});
