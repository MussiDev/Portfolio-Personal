import { expect, test } from "@playwright/test";

import { waitForTissue, brainLabels } from "./util";

/**
 * The hero's panel claims "connected to X · Y". For a long time that was
 * just text: linked sections dimmed the same as unrelated ones, so the
 * site's most original connection was an orange line between two anonymous
 * points on the tissue. These tests pin down that what the panel says and
 * what the screen shows are the same statement.
 */

test.describe("the brain's connections", () => {
	test.skip(({ isMobile }) => isMobile, "the brain's labels are desktop-only");

	test.beforeEach(async ({ page }) => {
		await page.goto("/", { waitUntil: "networkidle" });
		await waitForTissue(page);
	});

	test("hovering a section lights up its linked ones, and only those", async ({ page }) => {
		const labels = brainLabels(page);
		await labels.first().hover();
		// Wait for the state, not a fixed time: in CI the brain renders
		// without a GPU and 600ms wasn't always enough for the hover to land.
		await expect(labels.first().locator("span").first()).toHaveCSS(
			"color",
			"rgb(255, 106, 58)",
		);

		const colors = await labels.evaluateAll((nodes) =>
			nodes.map((n) => getComputedStyle(n.querySelector("span")!).color),
		);

		// 0 is the active one: full orange. 1 and 2 are its linked ones:
		// translucent orange. The rest stay at the neutral text color.
		expect(colors[0]).toBe("rgb(255, 106, 58)");
		expect(colors[1]).toMatch(/^rgba\(255, 106, 58/);
		expect(colors[2]).toMatch(/^rgba\(255, 106, 58/);
		for (const c of colors.slice(3)) {
			expect(c, "an unrelated section shouldn't light up").not.toMatch(/255, 106, 58/);
		}
	});

	test("one line is drawn for each connection the panel names", async ({ page }) => {
		await brainLabels(page).first().hover();

		const panel = page.locator("p", { hasText: /conectado con/i }).first();
		await expect(panel).toBeVisible();
		const count = (await panel.innerText()).split("·").length;

		await expect
			.poll(
				() =>
					page
						.locator("svg line")
						.evaluateAll((ls) =>
							ls.filter((l) => Number(l.getAttribute("opacity") ?? 0) > 0.5).length,
						),
				{ message: `the panel names ${count} connections` },
			)
			.toBe(count);
	});

	test("with no active section there is no connection lit up", async ({ page }) => {
		await page.mouse.move(700, 60);
		await page.waitForTimeout(600);

		const visible = await page
			.locator("svg line")
			.evaluateAll((ls) =>
				ls.filter((l) => Number(l.getAttribute("opacity") ?? 0) > 0.5).length,
			);
		expect(visible).toBe(0);
	});
});
