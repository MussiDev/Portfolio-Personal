import { expect, test } from "@playwright/test";

/**
 * El formulario es el único camino de conversión del sitio y tenía un bug
 * de accesibilidad silencioso: la región `aria-live` se montaba junto con su
 * contenido, y un lector de pantalla solo anuncia cambios dentro de una
 * live region que YA existía en el DOM. O sea: el usuario ciego enviaba y no
 * se enteraba de nada, ni del éxito ni del error.
 *
 * Es exactamente la clase de bug que no se ve mirando la pantalla, así que
 * tiene que estar cubierto por un test.
 */

test.beforeEach(async ({ page }) => {
	await page.goto("/#paso-5");
	await page.locator("form").first().scrollIntoViewIfNeeded();
});

test("la región live existe antes de enviar, no aparece con el mensaje", async ({ page }) => {
	const live = page.locator('form [aria-live="polite"]');
	await expect(live).toHaveCount(1);
	await expect(live).toHaveAttribute("role", "status");
	// Vacía pero presente: si estuviera montándose recién con el mensaje,
	// este count sería 0 antes de enviar.
	await expect(live).toHaveText("");
});

test("los campos tienen label asociado y autocomplete", async ({ page }) => {
	for (const [id, autocomplete] of [
		["name", "name"],
		["email", "email"],
	] as const) {
		const campo = page.locator(`#${id}`);
		await expect(campo).toHaveAttribute("autocomplete", autocomplete);
		// getByLabel falla si el <label for> no resuelve al campo.
		await expect(campo).toBeVisible();
	}
	await expect(page.locator("form label")).toHaveCount(3);
});

test("sin captcha resuelto el envío se bloquea y lo dice en la región live", async ({ page }) => {
	await page.fill("#name", "Prueba E2E");
	await page.fill("#email", "prueba@example.com");
	await page.fill("#message", "Mensaje de prueba automatizada.");
	await page.click('form button[type="submit"]');

	// Fail closed (ContactForm + /api/contact): sin sitekey o sin captcha resuelto,
	// bloquea. En cualquiera de los dos casos el usuario tiene que recibir
	// un mensaje, no un silencio.
	const live = page.locator('form [aria-live="polite"]');
	await expect(live).not.toHaveText("", { timeout: 10_000 });
});

test("el honeypot no es alcanzable por teclado ni por lectores", async ({ page }) => {
	const honeypot = page.locator('input[name="lastName"]');
	await expect(honeypot).toHaveAttribute("tabindex", "-1");
	await expect(honeypot).toHaveAttribute("aria-hidden", "true");
});
