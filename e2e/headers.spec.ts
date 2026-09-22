import { expect, test } from "@playwright/test";

/**
 * The production build's security headers.
 *
 * The CSP started depending on the environment so React can use eval() in
 * `next dev` (without that the dev console spits out an error on every
 * load and its debug tools turn off). That leaves a new trap: if someone
 * removes the condition, 'unsafe-eval' travels to production and no one
 * notices — the page looks identical. These tests run against the
 * production build, so they can actually assert it.
 */

test("production doesn't enable 'unsafe-eval' in the CSP", async ({ request }) => {
	const res = await request.get("/", { maxRedirects: 5 });
	const csp = res.headers()["content-security-policy"];
	expect(csp, "the home was served with no CSP").toBeTruthy();

	const scriptSrc = csp.split(";").map((d) => d.trim()).find((d) => d.startsWith("script-src"));
	expect(scriptSrc, "the CSP doesn't declare script-src").toBeTruthy();
	// 'unsafe-eval' turns any string injection into code execution. React
	// never uses it in production, so it buys nothing here.
	expect(scriptSrc, `script-src in production: ${scriptSrc}`).not.toContain("unsafe-eval");
});

test("the rest of the security headers stay in place", async ({ request }) => {
	const h = (await request.get("/", { maxRedirects: 5 })).headers();
	expect(h["x-content-type-options"]).toBe("nosniff");
	expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
	expect(h["x-frame-options"]).toBe("DENY");
	expect(h["strict-transport-security"]).toContain("max-age=");
});

test("/studio doesn't end up with no headers, even without the full CSP", async ({ request }) => {
	// Sanity's secret travels in the query string: without Referrer-Policy
	// it leaks to the first outbound link.
	const h = (await request.get("/studio", { maxRedirects: 5 })).headers();
	expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
	expect(h["x-content-type-options"]).toBe("nosniff");
});
