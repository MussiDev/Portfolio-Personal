import { expect, test } from "@playwright/test";

/**
 * Las tarjetas que se ven cuando alguien comparte un link. Hasta hace poco
 * cada una pasaba por un 308 del proxy (Next arma la URL con el prefijo
 * /es/ interno) y algunos scrapers no lo siguen: el link se compartía sin
 * imagen y nadie se enteraba, porque en el navegador todo se ve bien.
 */

const rutas = ["/", "/en", "/blog", "/proyectos/nortear", "/en/proyectos/nortear"];

for (const ruta of rutas) {
	test(`la tarjeta de ${ruta} se sirve directo como imagen`, async ({ page, request }) => {
		await page.goto(ruta);
		const og = await page.locator('meta[property="og:image"]').getAttribute("content");
		expect(og, "la página no declara og:image").toBeTruthy();

		const url = new URL(og!);
		const res = await request.get(url.pathname + url.search, { maxRedirects: 0 });
		expect(res.status(), "los scrapers no siempre siguen un redirect").toBe(200);
		expect(res.headers()["content-type"]).toContain("image/png");
	});
}
