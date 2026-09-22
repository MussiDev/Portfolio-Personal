import { expect, test } from "@playwright/test";

/**
 * Network and interaction budget.
 *
 * The decision from d3d9cb0 — not downloading three.js or the brain's .bin
 * below 768px — used to live only in a comment and in the discipline of
 * whoever touched the code. A misplaced `import`, a component that stops
 * being dynamic, or a `useIsDesktop` that starts at `true` reverts it
 * silently: the site still looks fine on the developer's own machine. This
 * stays here as an assertion.
 */

const heavy = /three|brain\.[a-f0-9]+\.bin/i;

test.describe("mobile", () => {
	test.skip(({ isMobile }) => !isMobile, "only applies to the mobile project");

	test("does not download three.js or the 3D tissue", async ({ page }) => {
		const requests: string[] = [];
		page.on("request", (r) => {
			if (heavy.test(r.url())) requests.push(r.url());
		});

		await page.goto("/", { waitUntil: "networkidle" });
		await page.waitForTimeout(2500);

		expect(requests, `mobile requested desktop assets:\n${requests.join("\n")}`).toEqual([]);
	});

	test("downloads the 2D brain, exactly once, via preload and lightweight", async ({ page }) => {
		const requests: string[] = [];
		page.on("request", (r) => {
			if (/brain-2d\.[a-f0-9]+\.bin/.test(r.url())) requests.push(r.url());
		});
		await page.goto("/", { waitUntil: "networkidle" });
		await page.waitForTimeout(2500);

		const resource = await page.evaluate(() =>
			performance
				.getEntriesByType("resource")
				.filter((r) => /brain-2d\.[a-f0-9]+\.bin/.test(r.name))
				.map((r) => ({
					initiator: (r as PerformanceResourceTiming).initiatorType,
					bytes: (r as PerformanceResourceTiming).encodedBodySize,
				})),
		);
		expect(resource, "the 2D brain must be requested exactly once").toHaveLength(1);
		// 'link': the startup script's preload kicked it off, not the canvas
		// at the end of hydration.
		expect(resource[0].initiator).toBe("link");
		expect(resource[0].bytes, "the point was to not download the 466 KB 3D .bin").toBeLessThan(40 * 1024);
	});

	test("every navigation link meets the minimum tap target", async ({ page }) => {
		await page.goto("/");
		// Deliberately includes the language switch: it's a separate <nav> and
		// its links measured 19px, being the only way to change language.
		const links = page.locator("nav a:visible");
		const n = await links.count();
		expect(n).toBeGreaterThan(0);

		const tooSmall: string[] = [];
		for (let i = 0; i < n; i += 1) {
			const box = await links.nth(i).boundingBox();
			if (!box) continue;
			// Rounded: on a viewport with a fractional DPR (the Pixel 7 uses
			// 2.625) a 44px box measures as 43.99 and the test would fail over
			// a defect that doesn't exist.
			if (Math.round(box.height) < 44) {
				tooSmall.push(
					`${(await links.nth(i).innerText()).trim().slice(0, 24)} → ${Math.round(box.height)}px`,
				);
			}
		}
		expect(tooSmall, `navigation links under 44px:\n${tooSmall.join("\n")}`).toEqual([]);
	});
});

test.describe("desktop", () => {
	test.skip(({ isMobile }) => isMobile, "only applies to the desktop project");

	test("does load the 3D tissue and reveals it", async ({ page }) => {
		const requests: string[] = [];
		page.on("request", (r) => {
			if (heavy.test(r.url())) requests.push(r.url());
		});
		await page.goto("/", { waitUntil: "networkidle" });
		await page.waitForTimeout(4000);
		expect(requests.length).toBeGreaterThan(0);
	});

	test("the tissue is kicked off by the preload, not Brain3D's fetch", async ({ page }) => {
		await page.goto("/", { waitUntil: "networkidle" });
		await page.waitForTimeout(4000);

		const bin = await page.evaluate(() =>
			performance
				.getEntriesByType("resource")
				.filter((r) => /brain\.[a-f0-9]+\.bin/.test(r.name))
				.map((r) => ({
					initiator: (r as PerformanceResourceTiming).initiatorType,
					start: Math.round(r.startTime),
				})),
		);

		// A single request: if the preload's `crossOrigin` stopped matching
		// Brain3D's fetch() mode, the browser would download the 466 KB TWICE
		// without any warning anywhere.
		expect(bin, "the tissue must be requested exactly once").toHaveLength(1);

		// initiatorType 'link' = the startup script's preload kicked it off.
		// If it goes back to 'fetch', the preload stopped working and the
		// download went back to the end of the cascade (measured: ~490ms
		// instead of ~25ms, and 4.8s more waiting on 4G with a slow CPU).
		expect(
			bin[0].initiator,
			"the tissue was only requested from Brain3D again, without preload",
		).toBe("link");
	});
});

test("the post cover comes from the tissue, without requesting an image", async ({ page }) => {
	// The cover used to be a Sanity stock illustration, and this test made
	// sure it didn't lazy-load or serve the wrong srcset candidate. Now it's
	// generated from the tissue itself and travels as SVG in the server's
	// HTML, so what needs guarding is something else: that an image to
	// download doesn't reappear above the post.
	const images: string[] = [];
	page.on("request", (req) => {
		if (req.resourceType() === "image") images.push(req.url());
	});

	await page.goto("/blog");
	const firstPost = page
		.locator('a[href*="/blog/"]')
		.filter({ hasNotText: /^$/ })
		.first();
	await firstPost.click();
	await page.waitForLoadState("networkidle");

	const cover = page.locator("article svg[role='presentation']").first();
	await expect(cover).toHaveCount(1);
	// The crop has real tissue, not an empty SVG.
	expect(await cover.locator("circle").count()).toBeGreaterThan(20);

	expect(
		images.filter((u) => u.includes("cdn.sanity.io") || u.includes("/_next/image")),
		"the cover went back to being a downloaded image",
	).toEqual([]);

	// And it's declared decoration: nothing for a screen reader to announce.
	expect(
		await page.locator("article [aria-hidden='true'] svg[role='presentation']").count(),
		"the cover stopped being marked as decorative",
	).toBe(1);
});

test("no blog title reaches the screen with an emoji", async ({ page }) => {
	// One of the posts is called "🚀 SEO for devs…" in Sanity. The rocket
	// gets stripped when rendering (title.ts), and it's stripped EVERYWHERE:
	// the listing, the h1, navigation between posts, and the <title>.
	const pictographs = /[\p{Extended_Pictographic}]/u;

	await page.goto("/blog");
	for (const t of await page.locator("article h2").allInnerTexts()) {
		expect(t, `"${t}" reached the listing with an emoji`).not.toMatch(pictographs);
	}

	await page.locator('a[href*="/blog/"]').filter({ hasNotText: /^$/ }).first().click();
	await page.waitForLoadState("domcontentloaded");
	expect(await page.locator("h1").innerText()).not.toMatch(pictographs);
	expect(await page.title()).not.toMatch(pictographs);
});

test("reaching the home via a link also preloads the tissue", async ({ page }) => {
	// React never executes a <script> that renders on the client, so on
	// client-side navigation TissuePreload.tsx's preload doesn't run. From
	// /blog — the one page that deliberately doesn't preload — that left the
	// tissue's download hanging off the slow chain (411 ms from the click,
	// versus 143 ms with TissuePreloadClient.tsx).
	//
	// The <link> is checked, not the clock: a time threshold loose enough to
	// tolerate a slow CI is looser than the regression itself and lets it
	// through — tested. Without TissuePreloadClient that link doesn't exist:
	// the script is inert and no one else creates it.
	const tissue: string[] = [];
	page.on("request", (r) => {
		if (/brain(-2d)?\.[a-f0-9]+\.bin/.test(r.url())) tissue.push(r.url());
	});

	await page.goto("/blog");
	await page.waitForTimeout(1500);
	expect(tissue, "the blog shouldn't request the tissue even peripherally").toEqual([]);

	await page.locator('a[href="/"], a[href="/es"]').first().click();
	await page.waitForURL(/\/(es)?$/);

	await expect
		.poll(
			() =>
				page.evaluate(
					() => !!document.querySelector('link[rel="preload"][href*="/image/brain"]'),
				),
			{ timeout: 5000, message: "no one preloaded the tissue on arriving via a link" },
		)
		.toBe(true);
});
