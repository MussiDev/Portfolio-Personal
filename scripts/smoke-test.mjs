// Smoke test contra un build de producción ya levantado (npm run build +
// npm start). No reemplaza los tests unitarios: existe para atrapar
// regresiones que un tsc/test verde no ve, porque son correctas en tipos
// pero rotas en runtime — el canonical apuntando a un dominio que devuelve
// 404, o el sitemap ofreciendo /en/blog/* cuando esa ruta ya no existe.
//
// Uso: node scripts/smoke-test.mjs  (arranca su propio `next start`)

import { spawn, spawnSync } from "node:child_process";

const PORT = process.env.SMOKE_PORT ?? "4173";
const ORIGIN = `http://127.0.0.1:${PORT}`;
// `||` y no `??`: en GitHub Actions un secret que no existe llega como "".
// Con `??` SITE_URL quedaba vacío, y todo `x.startsWith("")` da true: los
// chequeos de dominio pasaban sin verificar nada.
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
			// todavía no levantó
		}
		await new Promise((r) => setTimeout(r, 500));
	}
	return false;
};

const extractAll = (html, re) => [...html.matchAll(re)].map((m) => m[1]);

async function run() {
	console.log(`Smoke test contra ${ORIGIN} (SITE_URL=${SITE_URL})\n`);

	const home = await fetch(ORIGIN + "/");
	const homeHtml = await home.text();

	const canonical = extractAll(homeHtml, /<link rel="canonical" href="([^"]+)"/g)[0];
	if (!canonical) {
		fail("No se encontró <link rel=\"canonical\"> en la home.");
	} else if (!canonical.startsWith(SITE_URL)) {
		fail(`El canonical apunta a "${canonical}", no a SITE_URL ("${SITE_URL}").`);
	} else {
		ok(`canonical → ${canonical}`);
	}

	const hreflangs = extractAll(
		homeHtml,
		/<link rel="alternate" hrefLang="[^"]+" href="([^"]+)"/g,
	);
	if (hreflangs.length === 0) {
		fail("No se encontraron <link rel=\"alternate\" hrefLang> en la home.");
	} else {
		const broken = hreflangs.filter((h) => !h.startsWith(SITE_URL));
		if (broken.length > 0) {
			fail(`hreflang con dominio incorrecto: ${broken.join(", ")}`);
		} else {
			ok(`${hreflangs.length} hreflang, todos bajo SITE_URL`);
		}
	}

	// Con reCAPTCHA v3 no hay widget ni contenedor .captcha: lo que se
	// renderiza cuando hay sitekey es el aviso que Google exige al ocultar el
	// badge. Antes esto buscaba la palabra "captcha" en todo el HTML, que
	// aparece igual (en "reCAPTCHA", en nombres de chunks) y daba OK siempre.
	const sitekeyConfigured = homeHtml.includes("policies.google.com/privacy");
	if (sitekeyConfigured) {
		ok("aviso de reCAPTCHA presente (NEXT_PUBLIC_FIRSTCAPTCHA configurada)");
	} else {
		console.warn(
			"  ⚠ No aparece el aviso de reCAPTCHA en la home. " +
				"Si NEXT_PUBLIC_FIRSTCAPTCHA no está seteada en este entorno, es " +
				"esperable — pero VERIFICAR que en Railway estén NEXT_PUBLIC_FIRSTCAPTCHA " +
				"y RECAPTCHA_SECRET_KEY: sin cualquiera de las dos, el formulario " +
				"bloquea todos los envíos (fail-closed).",
		);
	}

	const sitemapRes = await fetch(ORIGIN + "/sitemap.xml");
	if (!sitemapRes.ok) {
		fail(`/sitemap.xml devolvió ${sitemapRes.status}.`);
	} else {
		const sitemapXml = await sitemapRes.text();
		const locs = extractAll(sitemapXml, /<loc>([^<]+)<\/loc>/g);
		if (locs.length === 0) {
			fail("/sitemap.xml no tiene ninguna <loc>.");
		} else {
			const wrongDomain = locs.filter((l) => !l.startsWith(SITE_URL));
			if (wrongDomain.length > 0) {
				fail(`Entradas del sitemap fuera de SITE_URL: ${wrongDomain.slice(0, 5).join(", ")}`);
			} else {
				ok(`${locs.length} URLs en el sitemap, todas bajo SITE_URL`);
			}

			const untranslatedBlog = locs.filter((l) => /\/en\/blog\//.test(l));
			if (untranslatedBlog.length > 0) {
				fail(
					`El sitemap ofrece /en/blog/* que no tiene traducción real: ${untranslatedBlog.join(", ")}`,
				);
			} else {
				ok("sin entradas /en/blog/* (el blog no está traducido)");
			}
		}
	}

	const robotsRes = await fetch(ORIGIN + "/robots.txt");
	const robotsTxt = await robotsRes.text();
	if (!robotsTxt.includes(SITE_URL)) {
		fail(`/robots.txt no referencia SITE_URL ("${SITE_URL}").`);
	} else {
		ok("robots.txt referencia SITE_URL");
	}
}

// En Linux/macOS el server va en su propio grupo de procesos (detached): así
// el cleanup puede matar el grupo entero. `npx next start` lanza a
// next-server como hijo, y matar solo a npx dejaba a ese hijo vivo con
// stdout/stderr abiertos — Node no podía terminar y el paso del CI quedaba
// colgado hasta el timeout de GitHub (pasó en el primer run en Linux: 19
// minutos colgado). En Windows ya lo resolvía taskkill /t.
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
		// Sync: el process.exit del final no puede adelantarse a taskkill.
		spawnSync("taskkill", ["/pid", String(server.pid), "/f", "/t"]);
	} else {
		try {
			// PID negativo = todo el grupo: npx y el next-server que lanzó.
			process.kill(-server.pid, "SIGTERM");
		} catch {
			server.kill("SIGTERM");
		}
	}
};

try {
	const up = await waitForServer();
	if (!up) {
		console.error("El servidor no levantó a tiempo.\n--- output ---\n" + serverOutput);
		process.exitCode = 1;
	} else {
		await run();
	}
} catch (e) {
	console.error("Smoke test crasheó:", e);
	process.exitCode = 1;
} finally {
	cleanup();
}

if (failures.length > 0) {
	console.error("\nFALLÓ el smoke test:\n");
	for (const f of failures) console.error(`  ✗ ${f}`);
	process.exitCode = 1;
} else if (process.exitCode !== 1) {
	console.log("\nSmoke test OK.");
}

// Red de seguridad: el resultado ya está decidido. Si algún proceso hijo
// sobrevivió al cleanup y mantiene abierto un pipe, esto no puede volver a
// colgar el CI.
process.exit(process.exitCode ?? 0);
