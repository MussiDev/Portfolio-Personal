import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * axe against the site's real routes, with WCAG 2.1 A/AA + best practices
 * as the baseline.
 *
 * axe automates about a third of WCAG's criteria: passing this does NOT
 * mean the site is accessible, it means it doesn't have the errors a
 * machine can catch on its own. The brain's keyboard navigation and the
 * form's announcement are verified separately, in their own specs,
 * because axe doesn't see them.
 */

/**
 * axe composites color through inherited opacity, so auditing while the
 * [data-reveal] blocks are mid entrance-fade reports 66 false positive
 * contrast violations: it measures the text at ~57% of its color. What
 * matters is the settled state, which is what the user reads. This waits
 * until none of them are still transitioning.
 */
const waitForReveal = async (page: Page) => {
	await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
	await page.evaluate(() => window.scrollTo(0, 0));
	await page.waitForFunction(
		() =>
			[...document.querySelectorAll<HTMLElement>("[data-reveal]")].every(
				(el) => Number(getComputedStyle(el).opacity) === 1,
			),
		null,
		{ timeout: 15_000 },
	);
};

/**
 * axe treats everything inside a closed <details> as hidden, even if CSS
 * shows it. A project's six beats show open on desktop only via CSS, so
 * axe used to audit the first one and skip the other five: 39 nodes
 * evaluated instead of 95, and two real violations (the unnamed,
 * unfocusable diagram) that never showed up. Everything gets opened before
 * auditing: what's collapsed will get used by someone too.
 */
const analyze = async (page: Page) => {
	await page.evaluate(() =>
		document.querySelectorAll("details").forEach((d) => {
			d.open = true;
		}),
	);
	return analyzeAsIs(page);
};

const analyzeAsIs = (page: Page) =>
	new AxeBuilder({ page })
		.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
		// The tissue's canvas/WebGL is decoration marked aria-hidden; axe has
		// nothing to audit inside it and does report color noise over
		// animated pixels.
		.exclude("canvas")
		.analyze();

const routes = [
	["home es", "/"],
	["home en", "/en"],
	["blog listing", "/blog"],
	["NorteAR case", "/projects/nortear"],
] as const;

for (const [name, route] of routes) {
	test(`${name} has no axe violations`, async ({ page }) => {
		await page.goto(route, { waitUntil: "networkidle" });
		// The tissue takes ~900ms to build and only then does the veil lift:
		// auditing before that is auditing a black screen.
		await page.waitForTimeout(2500);
		await waitForReveal(page);

		const { violations } = await analyze(page);
		expect(
			violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`),
		).toEqual([]);
	});
}

test("a blog post has no axe violations", async ({ page }) => {
	await page.goto("/blog", { waitUntil: "networkidle" });
	await page.locator('a[href*="/blog/"]').filter({ hasNotText: /^$/ }).first().click();
	await page.waitForLoadState("networkidle");
	await page.waitForTimeout(1500);
	await waitForReveal(page);

	const { violations } = await analyze(page);
	expect(
		violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`),
	).toEqual([]);
});

test("there is a single h1 per page and the hierarchy doesn't skip levels", async ({ page }) => {
	await page.goto("/", { waitUntil: "networkidle" });
	await page.waitForTimeout(2000);

	await expect(page.locator("h1")).toHaveCount(1);

	const levels = await page.evaluate(() =>
		[...document.querySelectorAll("h1, h2, h3, h4")].map((h) =>
			Number(h.tagName[1]),
		),
	);
	let previous = levels[0];
	for (const level of levels.slice(1)) {
		expect(
			level - previous,
			`jump from h${previous} to h${level} in the sequence ${levels.join(",")}`,
		).toBeLessThanOrEqual(1);
		previous = level;
	}
});
