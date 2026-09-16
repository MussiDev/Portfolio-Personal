import { expect, test } from "@playwright/test";

import { esperarTejido, etiquetasDelCerebro } from "./util";

/**
 * El panel del hero afirma "conectado con X · Y". Durante mucho tiempo eso
 * fue solo texto: las secciones vinculadas se apagaban igual que las ajenas,
 * así que la conexión más original del sitio era una línea naranja entre dos
 * puntos anónimos del tejido. Estos tests fijan que lo que el panel dice y
 * lo que la pantalla muestra sean la misma afirmación.
 */

test.describe("conexiones del cerebro", () => {
	test.skip(({ isMobile }) => isMobile, "las etiquetas del cerebro son desktop");

	test.beforeEach(async ({ page }) => {
		await page.goto("/", { waitUntil: "networkidle" });
		await esperarTejido(page);
	});

	test("al posarse en una sección se iluminan sus vinculadas, y solo esas", async ({ page }) => {
		const etiquetas = etiquetasDelCerebro(page);
		await etiquetas.first().hover();
		await page.waitForTimeout(600);

		const colores = await etiquetas.evaluateAll((nodes) =>
			nodes.map((n) => getComputedStyle(n.querySelector("span")!).color),
		);

		// 0 es la activa: naranja pleno. 1 y 2 son sus vinculadas: naranja
		// translúcido. El resto queda en el color neutro de texto.
		expect(colores[0]).toBe("rgb(255, 106, 58)");
		expect(colores[1]).toMatch(/^rgba\(255, 106, 58/);
		expect(colores[2]).toMatch(/^rgba\(255, 106, 58/);
		for (const c of colores.slice(3)) {
			expect(c, "una sección sin relación no puede iluminarse").not.toMatch(/255, 106, 58/);
		}
	});

	test("se dibuja una línea por cada vínculo que el panel nombra", async ({ page }) => {
		await etiquetasDelCerebro(page).first().hover();
		await page.waitForTimeout(600);

		const nombrados = await page
			.locator("p", { hasText: /conectado con/i })
			.first()
			.innerText();
		const cuantos = nombrados.split("·").length;

		const visibles = await page
			.locator("svg line")
			.evaluateAll((ls) =>
				ls.filter((l) => Number(l.getAttribute("opacity") ?? 0) > 0.5).length,
			);

		expect(
			visibles,
			`el panel nombra ${cuantos} vínculos y se dibujan ${visibles} líneas`,
		).toBe(cuantos);
	});

	test("sin sección activa no hay ninguna conexión encendida", async ({ page }) => {
		await page.mouse.move(700, 60);
		await page.waitForTimeout(600);

		const visibles = await page
			.locator("svg line")
			.evaluateAll((ls) =>
				ls.filter((l) => Number(l.getAttribute("opacity") ?? 0) > 0.5).length,
			);
		expect(visibles).toBe(0);
	});
});
