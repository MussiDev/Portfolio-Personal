import { expect, test } from "@playwright/test";

import { esperarTejido } from "./util";

/**
 * Los deep links fueron una regresión real: el sitio borraba su propio hash
 * al cargar, así que /#paso-3 aterrizaba en el hero, los 301 de
 * next.config.js (/contacto → /#paso-5) no llevaban a ningún lado y ninguna
 * sección era compartible. Estos tests existen para que no vuelva a pasar
 * sin que nadie se entere.
 */

const seccionArriba = async (page: import("@playwright/test").Page, paso: number) =>
	page.evaluate((n) => {
		const el = document.getElementById(`paso-${n}`);
		return el ? Math.round(el.getBoundingClientRect().top) : null;
	}, paso);

test("entrar con #paso-N aterriza en esa sección y conserva el hash", async ({ page }) => {
	await page.goto("/#paso-3");
	await expect(page).toHaveURL(/#paso-3$/);
	await expect.poll(() => seccionArriba(page, 3)).toBeLessThan(5);
});

test("navegar por el menú escribe el hash en la URL", async ({ page }) => {
	await page.goto("/");
	// Las etiquetas viven dentro del velo del hero, que está en opacity 0
	// hasta que el tejido termina de construirse: sin esperarlo, el click
	// queda colgado esperando visibilidad y el test es una carrera.
	await esperarTejido(page);
	// En mobile el destino vive en el <nav> del hero; en desktop, en las
	// etiquetas del cerebro. Los dos existen en el DOM a la vez y solo uno
	// es visible por breakpoint, así que hay que pedir el visible — ambos
	// caminos terminan en goToStep, que es lo que se verifica.
	await page.locator('a[href="#paso-3"]:visible').first().click();
	await expect(page).toHaveURL(/#paso-3$/);
	await expect.poll(() => seccionArriba(page, 3)).toBeLessThan(5);
});

test("volver al hero limpia el hash en vez de dejar #paso-0", async ({ page }) => {
	await page.goto("/#paso-2");
	await expect(page).toHaveURL(/#paso-2$/);
	// Sin esperar la hidratación, el Escape llega antes de que useStepKeyboard
	// enganche su listener: la tecla no hace nada y el test falla de forma
	// intermitente, culpando a un bug que no existe.
	await esperarTejido(page);
	await page.keyboard.press("Escape");
	await expect(page).not.toHaveURL(/#paso/);
});

test("el redirect permanente de /contacto lleva al paso de contacto", async ({ page }) => {
	await page.goto("/contacto");
	await expect(page).toHaveURL(/#paso-5$/);
	await expect.poll(() => seccionArriba(page, 5)).toBeLessThan(5);
});

test("el skip link lleva al contenido", async ({ page }) => {
	await page.goto("/");
	await page.keyboard.press("Tab");
	const skip = page.locator("a[href='#paso-1']").first();
	await expect(skip).toBeFocused();
	await page.keyboard.press("Enter");
	await expect.poll(() => seccionArriba(page, 1)).toBeLessThan(5);
});
