import { expect, test } from "@playwright/test";

/**
 * Presupuesto de red y de interacción.
 *
 * La decisión de d3d9cb0 — no descargar three.js ni el .bin del cerebro por
 * debajo de 768px — vivía solo en un comentario y en la disciplina de quien
 * tocara el código. Un `import` mal puesto, un componente que deja de ser
 * dinámico, o un `useIsDesktop` que arranque en `true` la revierten sin
 * hacer ruido: el sitio se sigue viendo bien en la compu de quien programa.
 * Acá queda como aserción.
 */

const pesado = /three|cerebro\.[a-f0-9]+\.bin/i;

test.describe("mobile", () => {
	test.skip(({ isMobile }) => !isMobile, "solo aplica al proyecto mobile");

	test("no descarga three.js ni el tejido 3D", async ({ page }) => {
		const pedidos: string[] = [];
		page.on("request", (r) => {
			if (pesado.test(r.url())) pedidos.push(r.url());
		});

		await page.goto("/", { waitUntil: "networkidle" });
		await page.waitForTimeout(2500);

		expect(pedidos, `mobile pidió assets de desktop:\n${pedidos.join("\n")}`).toEqual([]);
	});

	test("baja el cerebro 2D, una sola vez, por preload y liviano", async ({ page }) => {
		const pedidos: string[] = [];
		page.on("request", (r) => {
			if (/cerebro-2d\.[a-f0-9]+\.bin/.test(r.url())) pedidos.push(r.url());
		});
		await page.goto("/", { waitUntil: "networkidle" });
		await page.waitForTimeout(2500);

		const recurso = await page.evaluate(() =>
			performance
				.getEntriesByType("resource")
				.filter((r) => /cerebro-2d\.[a-f0-9]+\.bin/.test(r.name))
				.map((r) => ({
					iniciador: (r as PerformanceResourceTiming).initiatorType,
					bytes: (r as PerformanceResourceTiming).encodedBodySize,
				})),
		);
		expect(recurso, "el cerebro 2D tiene que pedirse exactamente una vez").toHaveLength(1);
		// 'link': lo arrancó el preload del script de arranque, no el canvas
		// al final de la hidratación.
		expect(recurso[0].iniciador).toBe("link");
		expect(recurso[0].bytes, "el punto era no bajar el .bin 3D de 466 KB").toBeLessThan(40 * 1024);
	});

	test("todo link de navegación llega al mínimo táctil", async ({ page }) => {
		await page.goto("/");
		// Incluye a propósito el switch de idioma: es un <nav> aparte y sus
		// links medían 19px, siendo la única forma de cambiar de idioma.
		const links = page.locator("nav a:visible");
		const n = await links.count();
		expect(n).toBeGreaterThan(0);

		const chicos: string[] = [];
		for (let i = 0; i < n; i += 1) {
			const caja = await links.nth(i).boundingBox();
			if (!caja) continue;
			// Redondeado: en un viewport con DPR fraccionario (Pixel 7 usa
			// 2.625) una caja de 44px se mide como 43.99 y el test fallaría
			// por un defecto que no existe.
			if (Math.round(caja.height) < 44) {
				chicos.push(
					`${(await links.nth(i).innerText()).trim().slice(0, 24)} → ${Math.round(caja.height)}px`,
				);
			}
		}
		expect(chicos, `links de navegación por debajo de 44px:\n${chicos.join("\n")}`).toEqual([]);
	});
});

test.describe("desktop", () => {
	test.skip(({ isMobile }) => isMobile, "solo aplica al proyecto desktop");

	test("sí carga el tejido 3D y lo revela", async ({ page }) => {
		const pedidos: string[] = [];
		page.on("request", (r) => {
			if (pesado.test(r.url())) pedidos.push(r.url());
		});
		await page.goto("/", { waitUntil: "networkidle" });
		await page.waitForTimeout(4000);
		expect(pedidos.length).toBeGreaterThan(0);
	});

	test("el tejido lo arranca el preload, no el fetch de Brain3D", async ({ page }) => {
		await page.goto("/", { waitUntil: "networkidle" });
		await page.waitForTimeout(4000);

		const bin = await page.evaluate(() =>
			performance
				.getEntriesByType("resource")
				.filter((r) => /cerebro\.[a-f0-9]+\.bin/.test(r.name))
				.map((r) => ({
					iniciador: (r as PerformanceResourceTiming).initiatorType,
					inicio: Math.round(r.startTime),
				})),
		);

		// Un solo pedido: si el `crossOrigin` del preload dejara de matchear el
		// modo del fetch() de Brain3D, el navegador bajaría los 466 KB DOS
		// veces sin avisar por ningún lado.
		expect(bin, "el tejido debe pedirse exactamente una vez").toHaveLength(1);

		// initiatorType 'link' = lo arrancó el preload del script de arranque.
		// Si vuelve a ser 'fetch', el preload dejó de funcionar y la descarga
		// volvió al final de la cascada (medido: ~490ms en vez de ~25ms, y
		// 4,8s más de espera en 4G con CPU lenta).
		expect(
			bin[0].iniciador,
			"el tejido volvió a pedirse recién desde Brain3D, sin preload",
		).toBe("link");
	});
});

test("la portada del post sale del tejido, sin pedir una imagen", async ({ page }) => {
	// Antes la portada era una ilustración de stock de Sanity, y este test
	// cuidaba que no arrancara lazy ni sirviera el candidato equivocado del
	// srcset. Ahora se genera del propio tejido y viaja como SVG en el HTML
	// del server, así que lo que hay que cuidar es otra cosa: que no vuelva
	// a aparecer una imagen que descargar arriba de la nota.
	const imagenes: string[] = [];
	page.on("request", (req) => {
		if (req.resourceType() === "image") imagenes.push(req.url());
	});

	await page.goto("/blog");
	const primerPost = page
		.locator('a[href*="/blog/"]')
		.filter({ hasNotText: /^$/ })
		.first();
	await primerPost.click();
	await page.waitForLoadState("networkidle");

	const portada = page.locator("article svg[role='presentation']").first();
	await expect(portada).toHaveCount(1);
	// El recorte tiene tejido de verdad, no un SVG vacío.
	expect(await portada.locator("circle").count()).toBeGreaterThan(20);

	expect(
		imagenes.filter((u) => u.includes("cdn.sanity.io") || u.includes("/_next/image")),
		"la portada volvió a ser una imagen descargada",
	).toEqual([]);

	// Y es decoración declarada: nada que anunciarle a un lector de pantalla.
	expect(
		await page.locator("article [aria-hidden='true'] svg[role='presentation']").count(),
		"la portada dejó de estar marcada como decorativa",
	).toBe(1);
});

test("ningún título del blog llega con emoji a la pantalla", async ({ page }) => {
	// Una de las notas se llama "🚀 SEO para devs…" en Sanity. El cohete se
	// limpia al renderizar (title.ts), y se limpia en TODOS lados: el
	// listado, el h1, la navegación entre notas y el <title>.
	const pictogramas = /[\p{Extended_Pictographic}]/u;

	await page.goto("/blog");
	for (const t of await page.locator("article h2").allInnerTexts()) {
		expect(t, `"${t}" llegó con emoji al listado`).not.toMatch(pictogramas);
	}

	await page.locator('a[href*="/blog/"]').filter({ hasNotText: /^$/ }).first().click();
	await page.waitForLoadState("domcontentloaded");
	expect(await page.locator("h1").innerText()).not.toMatch(pictogramas);
	expect(await page.title()).not.toMatch(pictogramas);
});
