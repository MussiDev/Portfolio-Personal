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
		// Esperar el estado, no un tiempo fijo: en CI el cerebro se renderiza
		// sin GPU y 600ms no siempre alcanzaban para que el hover llegara.
		await expect(etiquetas.first().locator("span").first()).toHaveCSS(
			"color",
			"rgb(255, 106, 58)",
		);

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

		const panel = page.locator("p", { hasText: /conectado con/i }).first();
		await expect(panel).toBeVisible();
		const cuantos = (await panel.innerText()).split("·").length;

		await expect
			.poll(
				() =>
					page
						.locator("svg line")
						.evaluateAll((ls) =>
							ls.filter((l) => Number(l.getAttribute("opacity") ?? 0) > 0.5).length,
						),
				{ message: `el panel nombra ${cuantos} vínculos` },
			)
			.toBe(cuantos);
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
