import { expect, test } from "@playwright/test";

/**
 * The cards shown when someone shares a link. Until recently each one went
 * through a 308 from the proxy (Next builds the URL with the internal /es/
 * prefix) and some scrapers don't follow it: the link got shared without an
 * image and no one noticed, because it looks fine in the browser.
 */

const routes = ["/", "/en", "/blog", "/projects/nortear", "/en/projects/nortear"];

for (const route of routes) {
	test(`the ${route} card is served directly as an image`, async ({ page, request }) => {
		await page.goto(route);
		const og = await page.locator('meta[property="og:image"]').getAttribute("content");
		expect(og, "the page doesn't declare og:image").toBeTruthy();

		const url = new URL(og!);
		const res = await request.get(url.pathname + url.search, { maxRedirects: 0 });
		expect(res.status(), "scrapers don't always follow a redirect").toBe(200);
		expect(res.headers()["content-type"]).toContain("image/png");
	});
}
