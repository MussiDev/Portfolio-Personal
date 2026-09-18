import { expect, test } from "@playwright/test";

import { esperarTejido } from "./util";

/**
 * NorteAR tiene URL propia. Antes los seis tiempos vivían solo como un ancla
 * dentro de la home: no se podían compartir ni indexar por separado. Estos
 * tests fijan lo que hace que esa URL valga algo — que exista en los dos
 * idiomas, que se declare canónica, que las URLs viejas lleguen a ella, y que
 * la home siga llevando hasta ahí.
 */

test("la página del caso muestra los seis tiempos con la jerarquía correcta", async ({ page }) => {
	await page.goto("/proyectos/nortear");
	await expect(page.locator("h1")).toHaveText("NorteAR");
	await expect(page.locator("h2#seis-tiempos")).toBeVisible();
	// Los títulos de los tiempos, no los <li>: el flujo de "Mecanismo"
	// (turno → insumos → stock → margen) es otra lista ordenada adentro.
	await expect(page.locator('section[aria-labelledby="seis-tiempos"] h3')).toHaveCount(6);

	const niveles = await page.evaluate(() =>
		[...document.querySelectorAll("h1, h2, h3, h4")].map((h) => Number(h.tagName[1])),
	);
	for (let i = 1; i < niveles.length; i += 1) {
		expect(niveles[i] - niveles[i - 1], `salto de h${niveles[i - 1]} a h${niveles[i]}`).toBeLessThanOrEqual(1);
	}
});

test("se declara canónica y enlaza su traducción", async ({ page }) => {
	await page.goto("/proyectos/nortear");
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/proyectos\/nortear$/);
	await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", /\/en\/proyectos\/nortear$/);

	const tipos = await page.locator('script[type="application/ld+json"]').allTextContents();
	const todo = tipos.join(" ");
	for (const tipo of ["WebPage", "SoftwareApplication", "BreadcrumbList"]) {
		expect(todo, `falta el JSON-LD ${tipo}`).toContain(`"@type":"${tipo}"`);
	}
});

test("existe en inglés con contenido traducido, no el español con otra URL", async ({ page }) => {
	await page.goto("/en/proyectos/nortear");
	await expect(page.locator("html")).toHaveAttribute("lang", "en");
	await expect(page.locator("h2#seis-tiempos")).toHaveText("The case, in six beats");
});

test("la tarjeta para compartir se sirve directo, sin redirect", async ({ page, request }) => {
	await page.goto("/proyectos/nortear");
	const og = await page.locator('meta[property="og:image"]').getAttribute("content");
	expect(og).toBeTruthy();
	const ruta = new URL(og!).pathname + new URL(og!).search;
	const res = await request.get(ruta, { maxRedirects: 0 });
	expect(res.status(), "los scrapers no siempre siguen un 308").toBe(200);
	expect(res.headers()["content-type"]).toContain("image/png");
});

test("la URL vieja del proyecto llega al caso; las que ya no existen, a la home", async ({ request }) => {
	const viejo = await request.get("/maquinas/nortear", { maxRedirects: 0 });
	expect(viejo.status()).toBe(308);
	expect(viejo.headers().location).toMatch(/\/proyectos\/nortear$/);

	// El sitio anterior tenía ocho proyectos y hoy existe uno: los demás no
	// pueden terminar en un 404.
	const huerfano = await request.get("/maquinas/cryptgo", { maxRedirects: 0 });
	expect(huerfano.headers().location).toMatch(/\/#paso-2$/);

	const inventado = await request.get("/proyectos/no-existe");
	expect(inventado.status()).toBe(404);
});

test("desde la home se llega al caso completo, y se vuelve al mismo paso", async ({ page }) => {
	await page.goto("/#paso-2");
	await esperarTejido(page);
	await page.locator('#paso-2 a[href$="/proyectos/nortear"]').click();
	await expect(page).toHaveURL(/\/proyectos\/nortear$/);
	await expect(page.locator("h1")).toHaveText("NorteAR");

	await page.locator('a[href$="#paso-2"]').first().click();
	await expect(page).toHaveURL(/#paso-2$/);
	await expect
		.poll(() => page.evaluate(() => Math.round(document.getElementById("paso-2")!.getBoundingClientRect().top)))
		.toBeLessThan(5);
});

test("el diagrama se nombra, se enfoca y se recorre con el teclado cuando no entra", async ({ page }) => {
	await page.goto("/proyectos/nortear");
	// En mobile los tiempos arrancan plegados: se abre el del diagrama.
	await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
	const diagrama = page.locator('[role="img"][aria-label]').filter({ has: page.locator("svg") });
	await expect(diagrama).toHaveCount(1);
	await expect(diagrama).toHaveAttribute("aria-label", /diagrama|diagram/i);

	const desborda = await diagrama.evaluate((el) => el.scrollWidth > el.clientWidth + 1);
	const pista = page.getByText(/deslizá para ver|scroll to see/i);
	if (!desborda) {
		// Si entra, no hay nada que avisar ni un tab stop que no haga nada.
		await expect(pista).toHaveCount(0);
		await expect(diagrama).not.toHaveAttribute("tabindex", "0");
		return;
	}

	await expect(pista).toBeVisible();
	await diagrama.focus();
	await expect(diagrama).toBeFocused();
	const antes = await diagrama.evaluate((el) => el.scrollLeft);
	await page.keyboard.press("ArrowRight");
	await page.keyboard.press("ArrowRight");
	await expect.poll(() => diagrama.evaluate((el) => el.scrollLeft)).toBeGreaterThan(antes);
});
