// Smoke test against an already-running production build (pnpm run build +
// pnpm start). It doesn't replace the unit tests: it exists to catch
// regressions a green tsc/test doesn't see, because they're correct in
// types but broken at runtime — the canonical pointing to a domain that
// returns 404, or the sitemap offering /en/blog/* when that route doesn't
// exist.
//
// Usage: node scripts/smoke-test.mjs  (starts its own `next start`)

import { spawn, spawnSync } from "node:child_process";

const PORT = process.env.SMOKE_PORT ?? "4173";
const ORIGIN = `http://127.0.0.1:${PORT}`;
// `||` and not `??`: in GitHub Actions a secret that doesn't exist arrives
// as "". With `??` SITE_URL stayed empty, and every `x.startsWith("")`
// returns true: the domain checks passed without verifying anything.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://joaquinmussi.com.ar";

const failures = [];
const fail = (msg) => failures.push(msg);
const ok = (label) => console.log(`  ✓ ${label}`);

const waitForServer = async (timeoutMs = 30_000) => {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		try {
			const res = await fetch(ORIGIN, { signal: AbortSignal.timeout(2000) });
			if (res.ok || res.status === 404) return true;
		} catch {
			// not up yet
		}
		await new Promise((r) => setTimeout(r, 500));
	}
	return false;
};

const extractAll = (html, re) => [...html.matchAll(re)].map((m) => m[1]);

async function run() {
	console.log(`Smoke test against ${ORIGIN} (SITE_URL=${SITE_URL})\n`);

	const home = await fetch(ORIGIN + "/");
	const homeHtml = await home.text();

	const canonical = extractAll(homeHtml, /<link rel="canonical" href="([^"]+)"/g)[0];
	if (!canonical) {
		fail("No <link rel=\"canonical\"> found on the home.");
	} else if (!canonical.startsWith(SITE_URL)) {
		fail(`The canonical points to "${canonical}", not to SITE_URL ("${SITE_URL}").`);
	} else {
		ok(`canonical → ${canonical}`);
	}

	const hreflangs = extractAll(
		homeHtml,
		/<link rel="alternate" hrefLang="[^"]+" href="([^"]+)"/g,
	);
	if (hreflangs.length === 0) {
		fail("No <link rel=\"alternate\" hrefLang> found on the home.");
	} else {
		const broken = hreflangs.filter((h) => !h.startsWith(SITE_URL));
		if (broken.length > 0) {
			fail(`hreflang with the wrong domain: ${broken.join(", ")}`);
		} else {
			ok(`${hreflangs.length} hreflang, all under SITE_URL`);
		}
	}

	// With reCAPTCHA v3 there's no widget or .captcha container: what
	// renders when there's a sitekey is the notice Google requires when the
	// badge is hidden. This used to search the whole HTML for the word
	// "captcha", which shows up regardless (in "reCAPTCHA", in chunk names)
	// and always gave an OK.
	const sitekeyConfigured = homeHtml.includes("policies.google.com/privacy");
	if (sitekeyConfigured) {
		ok("reCAPTCHA notice present (NEXT_PUBLIC_FIRSTCAPTCHA configured)");
	} else {
		console.warn(
			"  ⚠ The reCAPTCHA notice doesn't appear on the home. " +
				"If NEXT_PUBLIC_FIRSTCAPTCHA isn't set in this environment, that's " +
				"expected — but VERIFY that Railway has both NEXT_PUBLIC_FIRSTCAPTCHA " +
				"and RECAPTCHA_SECRET_KEY set: without either one, the form " +
				"blocks every submission (fail-closed).",
		);
	}

	const sitemapRes = await fetch(ORIGIN + "/sitemap.xml");
	if (!sitemapRes.ok) {
		fail(`/sitemap.xml returned ${sitemapRes.status}.`);
	} else {
		const sitemapXml = await sitemapRes.text();
		const locs = extractAll(sitemapXml, /<loc>([^<]+)<\/loc>/g);
		if (locs.length === 0) {
			fail("/sitemap.xml has no <loc> entries.");
		} else {
			const wrongDomain = locs.filter((l) => !l.startsWith(SITE_URL));
			if (wrongDomain.length > 0) {
				fail(`Sitemap entries outside SITE_URL: ${wrongDomain.slice(0, 5).join(", ")}`);
			} else {
				ok(`${locs.length} URLs in the sitemap, all under SITE_URL`);
			}

			const untranslatedBlog = locs.filter((l) => /\/en\/blog\//.test(l));
			if (untranslatedBlog.length > 0) {
				fail(
					`The sitemap offers /en/blog/* with no real translation: ${untranslatedBlog.join(", ")}`,
				);
			} else {
				ok("no /en/blog/* entries (the blog isn't translated)");
			}
		}
	}

	const robotsRes = await fetch(ORIGIN + "/robots.txt");
	const robotsTxt = await robotsRes.text();
	if (!robotsTxt.includes(SITE_URL)) {
		fail(`/robots.txt doesn't reference SITE_URL ("${SITE_URL}").`);
	} else {
		ok("robots.txt references SITE_URL");
	}
}

// On Linux/macOS the server runs in its own process group (detached): that
// way cleanup can kill the whole group. `npx next start` launches
// next-server as a child, and killing only npx left that child alive with
// stdout/stderr open — Node couldn't exit and the CI step hung until
// GitHub's timeout (happened on the first Linux run: hung for 19
// minutes). On Windows taskkill /t already solved this.
const server = spawn("npx", ["next", "start", "-p", PORT], {
	stdio: ["ignore", "pipe", "pipe"],
	shell: process.platform === "win32",
	detached: process.platform !== "win32",
});

let serverOutput = "";
server.stdout?.on("data", (d) => (serverOutput += d));
server.stderr?.on("data", (d) => (serverOutput += d));

const cleanup = () => {
	if (process.platform === "win32") {
		// Sync: the final process.exit can't run ahead of taskkill.
		spawnSync("taskkill", ["/pid", String(server.pid), "/f", "/t"]);
	} else {
		try {
			// Negative PID = the whole group: npx and the next-server it launched.
			process.kill(-server.pid, "SIGTERM");
		} catch {
			server.kill("SIGTERM");
		}
	}
};

try {
	const up = await waitForServer();
	if (!up) {
		console.error("The server didn't come up in time.\n--- output ---\n" + serverOutput);
		process.exitCode = 1;
	} else {
		await run();
	}
} catch (e) {
	console.error("Smoke test crashed:", e);
	process.exitCode = 1;
} finally {
	cleanup();
}

if (failures.length > 0) {
	console.error("\nSmoke test FAILED:\n");
	for (const f of failures) console.error(`  ✗ ${f}`);
	process.exitCode = 1;
} else if (process.exitCode !== 1) {
	console.log("\nSmoke test OK.");
}

// Safety net: the result is already decided. If some child process
// survived cleanup and keeps a pipe open, this can't let it hang CI again.
process.exit(process.exitCode ?? 0);
