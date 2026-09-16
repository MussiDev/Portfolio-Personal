import type { Locator, Page } from "@playwright/test";

/**
 * Espera a que el velo del hero se levante.
 *
 * El contenedor del tejido arranca con `!opacity-0` y solo llega a 1 cuando
 * el cerebro (o el canvas de mobile) avisa que terminó de construirse. Las
 * etiquetas de navegación viven adentro, así que hasta ese momento Playwright
 * las considera invisibles y cualquier click queda esperando. Un
 * `waitForTimeout` fijo acá es una carrera: en CI el build tarda distinto.
 */
export const esperarTejido = async (page: Page) => {
	// Se espera opacidad > 0, no === 1: en mobile el contenedor baja a 0.4
	// cuando el contenido de un paso se le pone encima, así que entrar
	// directo a /#paso-2 nunca llega a 1 y esperar eso cuelga para siempre.
	// Lo que importa acá es solo que el velo (`!opacity-0`) haya caído.
	await page.waitForFunction(
		() => {
			const velo = document.querySelector<HTMLElement>(".barrido");
			return !!velo && Number(getComputedStyle(velo).opacity) > 0;
		},
		null,
		{ timeout: 20_000 },
	);
};

/**
 * Las etiquetas de sección del cerebro, sin arrastrar otros <nav>.
 *
 * En la página hay varios: el del cerebro, el del hero mobile (mismos
 * destinos, oculto en desktop), el switch de idioma y el de progreso. Un
 * selector como `nav a` los mezcla — y el switch de idioma tiene el idioma
 * activo en naranja pleno, que es exactamente el color que estos tests usan
 * para distinguir la sección activa.
 */
export const etiquetasDelCerebro = (page: Page): Locator =>
	page
		.locator("nav:visible")
		.filter({ has: page.locator('a[href^="#paso-"]') })
		.locator("a");
