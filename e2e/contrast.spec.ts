import { expect, test, type Page } from "@playwright/test";

import { waitForTissue } from "./util";

/**
 * Contrast of the text floating over the brain.
 *
 * axe can't measure this: the background is an animated WebGL canvas and
 * is excluded from its analysis. So it's measured by hand — the text gets
 * hidden, what's left behind gets photographed, and the text's color is
 * compared against the background's 95th luminance percentile (the
 * lightest part behind it, not the average).
 *
 * This exists because it happened: with step 2 in two columns, the heading
 * stretched over the mesh and the status/stack line (10px) ended up at
 * 1.49:1. If a step ever sits over the brain again, this fails.
 */

const luminance = (r: number, g: number, b: number) => {
	const f = (c: number) => {
		c /= 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

const contrastAgainstBackground = async (page: Page, selector: string): Promise<number> => {
	const el = page.locator(selector).first();
	const color = await el.evaluate((n) => getComputedStyle(n).color);
	await el.evaluate((n) => {
		(n as HTMLElement).dataset.color = (n as HTMLElement).style.color;
		(n as HTMLElement).style.color = "transparent";
	});
	const png = await el.screenshot();
	await el.evaluate((n) => {
		(n as HTMLElement).style.color = (n as HTMLElement).dataset.color ?? "";
	});

	const background = await page.evaluate(async (b64) => {
		const img = new Image();
		img.src = `data:image/png;base64,${b64}`;
		await img.decode();
		const canvas = new OffscreenCanvas(img.width, img.height);
		const ctx = canvas.getContext("2d")!;
		ctx.drawImage(img, 0, 0);
		const d = ctx.getImageData(0, 0, img.width, img.height).data;
		const f = (v: number) => {
			v /= 255;
			return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
		};
		const ls: number[] = [];
		for (let i = 0; i < d.length; i += 4) {
			ls.push(0.2126 * f(d[i]) + 0.7152 * f(d[i + 1]) + 0.0722 * f(d[i + 2]));
		}
		ls.sort((a, b) => a - b);
		return ls[Math.floor(ls.length * 0.95)];
	}, png.toString("base64"));

	const [r, g, b] = color.match(/\d+/g)!.map(Number);
	const text = luminance(r, g, b);
	return (Math.max(text, background) + 0.05) / (Math.min(text, background) + 0.05);
};

test.describe("text over the brain", () => {
	test.skip(({ isMobile }) => isMobile, "on mobile the tissue drops to 40% under the steps");
	// No GPU in CI: the brain (with bloom) renders in software and every
	// frame occupies the main thread. The evaluate/screenshot calls queue up
	// behind those frames and at 30s the test used to run out of time
	// before measuring — timeouts, not contrast failures.
	test.slow();

	for (const step of [1, 2, 3, 4, 5]) {
		test(`step ${step}'s heading passes AA against what's behind it`, async ({ page }) => {
			await page.goto(`/#step-${step}`);
			await waitForTissue(page);
			// Mouse away from the brain, and time for the camera to settle.
			await page.mouse.move(1, 1);
			await page.waitForTimeout(2000);

			for (const [name, selector] of [
				["gloss", `#step-${step} header .font-gloss`],
				["data line", `#step-${step} header span.text-synapse`],
			] as const) {
				if (!(await page.locator(selector).count())) continue;
				const ratio = await contrastAgainstBackground(page, selector);
				expect(ratio, `${name} on step ${step}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
			}
		});
	}
});
