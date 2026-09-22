import { expect, test } from "@playwright/test";

/**
 * Core Web Vitals reporting was installed and sending nothing: the
 * destination depended on an environment variable that was never set.
 * These tests pin down both halves — that the browser actually sends
 * metrics, and that the endpoint receiving them doesn't accept just
 * anything (it's public and writes to logs).
 */

const valid = { name: "LCP", value: 1234.5, rating: "good", id: "v4-1", path: "/" };

test("the browser sends real metrics on page load", async ({ page }) => {
	const sent = page.waitForRequest(
		(r) => r.url().endsWith("/api/vitals") && r.method() === "POST",
		{ timeout: 15_000 },
	);
	await page.goto("/");
	const req = await sent;
	const body = JSON.parse(req.postData() ?? "{}");
	expect(["LCP", "INP", "CLS", "FCP", "TTFB", "FID"]).toContain(body.name);
	expect(typeof body.value).toBe("number");
	expect(body.path).toBe("/");
});

test.describe("the endpoint", () => {
	test.skip(({ isMobile }) => isMobile, "it's the same API on both projects");

	test("accepts a valid metric", async ({ request }) => {
		const r = await request.post("/api/vitals", { data: JSON.stringify(valid) });
		expect(r.status()).toBe(204);
	});

	test("rejects anything that isn't a Core Web Vital", async ({ request }) => {
		for (const body of [
			"not json",
			JSON.stringify({ ...valid, name: "Next.js-hydration" }),
			JSON.stringify({ ...valid, value: -1 }),
			JSON.stringify({ ...valid, rating: "excellent" }),
			JSON.stringify({ ...valid, path: "https://another-site.com" }),
		]) {
			const r = await request.post("/api/vitals", { data: body });
			expect(r.status(), `accepted: ${body}`).toBe(400);
		}
	});

	test("cuts off large bodies before parsing them", async ({ request }) => {
		const r = await request.post("/api/vitals", {
			data: JSON.stringify({ ...valid, id: "x".repeat(5000) }),
		});
		expect(r.status()).toBe(413);
	});
});
