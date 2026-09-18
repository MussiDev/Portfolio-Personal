import { expect, test, type Page } from "@playwright/test";

import { esperarTejido } from "./util";

/**
 * Contraste del texto que flota sobre el cerebro.
 *
 * axe no puede medir esto: el fondo es un canvas WebGL animado y está
 * excluido de su análisis. Así que se mide a mano — se oculta el texto, se
 * fotografía lo que queda detrás, y se compara el color del texto contra el
 * percentil 95 de luminancia del fondo (lo más claro que tiene detrás, no
 * el promedio).
 *
 * Existe porque pasó: con el paso 2 en dos columnas, el encabezado se
 * estiraba sobre la malla y la línea de estado/stack (10px) quedaba en
 * 1.49:1. Si un paso vuelve a meterse encima del cerebro, esto falla.
 */

const luminancia = (r: number, g: number, b: number) => {
	const f = (c: number) => {
		c /= 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

const contrasteContraElFondo = async (page: Page, selector: string): Promise<number> => {
	const el = page.locator(selector).first();
	const color = await el.evaluate((n) => getComputedStyle(n).color);
	await el.evaluate((n) => {
		(n as HTMLElement).dataset.color = (n as HTMLElement).style.color;
		(n as HTMLElement).style.color = "transparent";
	});
	const png = await el.screenshot();
	await el.evaluate((n) => {
		(n as HTMLElement).style.color = (n as HTMLElement).dataset.color ?? "";
	});

	const fondo = await page.evaluate(async (b64) => {
		const img = new Image();
		img.src = `data:image/png;base64,${b64}`;
		await img.decode();
		const canvas = new OffscreenCanvas(img.width, img.height);
		const ctx = canvas.getContext("2d")!;
		ctx.drawImage(img, 0, 0);
		const d = ctx.getImageData(0, 0, img.width, img.height).data;
		const f = (v: number) => {
			v /= 255;
			return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
		};
		const ls: number[] = [];
		for (let i = 0; i < d.length; i += 4) {
			ls.push(0.2126 * f(d[i]) + 0.7152 * f(d[i + 1]) + 0.0722 * f(d[i + 2]));
		}
		ls.sort((a, b) => a - b);
		return ls[Math.floor(ls.length * 0.95)];
	}, png.toString("base64"));

	const [r, g, b] = color.match(/\d+/g)!.map(Number);
	const texto = luminancia(r, g, b);
	return (Math.max(texto, fondo) + 0.05) / (Math.min(texto, fondo) + 0.05);
};

test.describe("texto sobre el cerebro", () => {
	test.skip(({ isMobile }) => isMobile, "en mobile el tejido baja a 40% bajo los pasos");

	for (const paso of [1, 2, 3, 4, 5]) {
		test(`el encabezado del paso ${paso} pasa AA contra lo que tiene detrás`, async ({ page }) => {
			await page.goto(`/#paso-${paso}`);
			await esperarTejido(page);
			// El mouse fuera del cerebro, y tiempo para que la cámara se asiente.
			await page.mouse.move(1, 1);
			await page.waitForTimeout(2000);

			for (const [nombre, selector] of [
				["glosa", `#paso-${paso} header .font-glosa`],
				["línea de datos", `#paso-${paso} header span.text-sinapsis`],
			] as const) {
				if (!(await page.locator(selector).count())) continue;
				const ratio = await contrasteContraElFondo(page, selector);
				expect(ratio, `${nombre} del paso ${paso}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
			}
		});
	}
});
