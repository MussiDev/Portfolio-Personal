import { expect, test } from "@playwright/test";

import { waitForTissue } from "./util";

/**
 * NorteAR has its own URL. The six beats used to live only as an anchor
 * inside the home: they couldn't be shared or indexed separately. These
 * tests pin down what makes that URL worth something — that it exists in
 * both languages, that it's declared canonical, that the old URLs reach it,
 * and that the home still leads there.
 */

test("the case page shows the six beats with the right heading hierarchy", async ({ page }) => {
	await page.goto("/projects/nortear");
	await expect(page.locator("h1")).toHaveText("NorteAR");
	await expect(page.locator("h2#six-beats")).toBeVisible();
	// The beats' headings, not the <li>s: the "Mechanism" flow (shift →
	// supplies → stock → margin) is another ordered list inside it.
	await expect(page.locator('section[aria-labelledby="six-beats"] h3')).toHaveCount(6);

	const levels = await page.evaluate(() =>
		[...document.querySelectorAll("h1, h2, h3, h4")].map((h) => Number(h.tagName[1])),
	);
	for (let i = 1; i < levels.length; i += 1) {
		expect(levels[i] - levels[i - 1], `jump from h${levels[i - 1]} to h${levels[i]}`).toBeLessThanOrEqual(1);
	}
});

test("declares itself canonical and links its translation", async ({ page }) => {
	await page.goto("/projects/nortear");
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/projects\/nortear$/);
	await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", /\/en\/projects\/nortear$/);

	const types = await page.locator('script[type="application/ld+json"]').allTextContents();
	const all = types.join(" ");
	for (const type of ["WebPage", "SoftwareApplication", "BreadcrumbList"]) {
		expect(all, `missing the ${type} JSON-LD`).toContain(`"@type":"${type}"`);
	}
});

test("exists in English with translated content, not Spanish under another URL", async ({ page }) => {
	await page.goto("/en/projects/nortear");
	await expect(page.locator("html")).toHaveAttribute("lang", "en");
	await expect(page.locator("h2#six-beats")).toHaveText("The case, in six beats");
});

test("the share card is served directly, without a redirect", async ({ page, request }) => {
	await page.goto("/projects/nortear");
	const og = await page.locator('meta[property="og:image"]').getAttribute("content");
	expect(og).toBeTruthy();
	const path = new URL(og!).pathname + new URL(og!).search;
	const res = await request.get(path, { maxRedirects: 0 });
	expect(res.status(), "scrapers don't always follow a 308").toBe(200);
	expect(res.headers()["content-type"]).toContain("image/png");
});

test("the project's old URL reaches the case; ones that no longer exist reach the home", async ({ request }) => {
	const old = await request.get("/maquinas/nortear", { maxRedirects: 0 });
	expect(old.status()).toBe(308);
	expect(old.headers().location).toMatch(/\/projects\/nortear$/);

	// The previous site had eight projects and today only one exists: the
	// rest can't end up on a 404.
	const orphan = await request.get("/maquinas/cryptgo", { maxRedirects: 0 });
	expect(orphan.headers().location).toMatch(/\/#step-2$/);

	const madeUp = await request.get("/projects/no-existe");
	expect(madeUp.status()).toBe(404);
});

test("the full case is reachable from the home, and returns to the same step", async ({ page }) => {
	await page.goto("/#step-2");
	await waitForTissue(page);
	await page.locator('#step-2 a[href$="/projects/nortear"]').click();
	await expect(page).toHaveURL(/\/projects\/nortear$/);
	await expect(page.locator("h1")).toHaveText("NorteAR");

	await page.locator('a[href$="#step-2"]').first().click();
	await expect(page).toHaveURL(/#step-2$/);
	await expect
		.poll(() => page.evaluate(() => Math.round(document.getElementById("step-2")!.getBoundingClientRect().top)))
		.toBeLessThan(5);
});

test("the diagram is named, focusable, and keyboard-scrollable when it doesn't fit", async ({ page }) => {
	await page.goto("/projects/nortear");
	// On mobile the beats start collapsed: open the diagram's one.
	await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
	const diagram = page.locator('[role="img"][aria-label]').filter({ has: page.locator("svg") });
	await expect(diagram).toHaveCount(1);
	await expect(diagram).toHaveAttribute("aria-label", /diagrama|diagram/i);

	const overflows = await diagram.evaluate((el) => el.scrollWidth > el.clientWidth + 1);
	const hint = page.getByText(/deslizá para ver|scroll to see/i);
	if (!overflows) {
		// If it fits, there's nothing to announce and no tab stop that does nothing.
		await expect(hint).toHaveCount(0);
		await expect(diagram).not.toHaveAttribute("tabindex", "0");
		return;
	}

	await expect(hint).toBeVisible();
	await diagram.focus();
	await expect(diagram).toBeFocused();
	const before = await diagram.evaluate((el) => el.scrollLeft);
	await page.keyboard.press("ArrowRight");
	await page.keyboard.press("ArrowRight");
	await expect.poll(() => diagram.evaluate((el) => el.scrollLeft)).toBeGreaterThan(before);
});

/**
 * The brain lives in the layout, not the home: going to the case doesn't
 * unmount it.
 *
 * That's the difference between "another page with a similar background"
 * and a world that doesn't cut, and it breaks silently — all it takes is
 * someone moving the nervous system back inside a page, or the server and
 * the client picking different scenes (happened: proxy.ts rewrites / to /es).
 */
test.describe("continuity between the home and the case", () => {
	test.skip(({ isMobile }) => isMobile, "the 3D tissue is desktop-only");

	test("the same canvas survives navigation and the tissue downloads only once", async ({
		page,
	}) => {
		const tissue: string[] = [];
		page.on("request", (r) => {
			if (/brain\.[a-f0-9]+\.bin/.test(r.url())) tissue.push(r.url());
		});

		await page.goto("/");
		await waitForTissue(page);
		expect(tissue, "the tissue is requested once on the home").toHaveLength(1);

		// Mark the live element: if React unmounts and remounts it, the
		// dataset gets lost with it.
		await page.evaluate(() => {
			document.querySelector("canvas")!.dataset.mark = "same-canvas";
		});

		await page.locator('a[href$="/projects/nortear"]').first().click();
		await expect(page).toHaveURL(/\/projects\/nortear$/);
		await expect(page.locator("h1")).toHaveText("NorteAR");

		await expect
			.poll(() => page.evaluate(() => document.querySelector("canvas")?.dataset.mark))
			.toBe("same-canvas");
		expect(tissue, "the tissue doesn't get downloaded again on navigation").toHaveLength(1);
	});

	test("the six beats announce themselves to the brain to move the trace", async ({ page }) => {
		await page.goto("/projects/nortear");
		// One per beat: this is what useActiveBeat reads to advance the signal.
		await expect(page.locator("[data-stage]")).toHaveCount(6);
	});

	test("the blog doesn't mount the brain or download the tissue", async ({ page }) => {
		const tissue: string[] = [];
		page.on("request", (r) => {
			if (/brain(-2d)?\.[a-f0-9]+\.bin/.test(r.url())) tissue.push(r.url());
		});
		await page.goto("/blog");
		await page.waitForTimeout(1500);
		expect(await page.locator("canvas").count()).toBe(0);
		expect(tissue, `the blog requested tissue:\n${tissue.join("\n")}`).toEqual([]);
	});
});
