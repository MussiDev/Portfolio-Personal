import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * axe sobre las rutas reales del sitio, con WCAG 2.1 A/AA + best practices
 * como baseline.
 *
 * axe automatiza alrededor de un tercio de los criterios de WCAG: pasar
 * esto NO significa que el sitio sea accesible, significa que no tiene los
 * errores que una máquina puede detectar sola. La navegación por teclado del
 * cerebro y el anuncio del formulario se verifican aparte, en sus propios
 * specs, porque axe no los ve.
 */

/**
 * axe compone el color a través de la opacidad heredada, así que auditar
 * mientras los bloques [data-revelar] están a mitad del fade de entrada
 * reporta 66 falsos positivos de contraste: mide el texto al ~57% de su
 * color. Lo que importa es el estado asentado, que es el que el usuario
 * lee. Esto espera a que ninguno siga en transición.
 */
const esperarRevelado = async (page: Page) => {
	await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
	await page.evaluate(() => window.scrollTo(0, 0));
	await page.waitForFunction(
		() =>
			[...document.querySelectorAll<HTMLElement>("[data-revelar]")].every(
				(el) => Number(getComputedStyle(el).opacity) === 1,
			),
		null,
		{ timeout: 15_000 },
	);
};

/**
 * axe trata como oculto todo lo que está dentro de un <details> cerrado,
 * aunque el CSS lo muestre. Los seis tiempos de un proyecto se ven abiertos
 * en desktop solo por CSS, así que axe auditaba el primero y salteaba los
 * otros cinco: 39 nodos evaluados en vez de 95, y dos violaciones reales
 * (el diagrama sin nombre y sin foco) que nunca aparecían. Se abren todos
 * antes de auditar: lo plegado también lo va a usar alguien.
 */
const analizar = async (page: Page) => {
	await page.evaluate(() =>
		document.querySelectorAll("details").forEach((d) => {
			d.open = true;
		}),
	);
	return analizarTalCual(page);
};

const analizarTalCual = (page: Page) =>
	new AxeBuilder({ page })
		.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
		// El canvas/WebGL del tejido es decoración marcada aria-hidden; axe
		// no tiene nada que auditar adentro y sí reporta ruido de color
		// sobre píxeles animados.
		.exclude("canvas")
		.analyze();

const rutas = [
	["home es", "/"],
	["home en", "/en"],
	["listado del blog", "/blog"],
	["caso de NorteAR", "/proyectos/nortear"],
] as const;

for (const [nombre, ruta] of rutas) {
	test(`${nombre} sin violaciones de axe`, async ({ page }) => {
		await page.goto(ruta, { waitUntil: "networkidle" });
		// El tejido tarda ~900ms en construirse y recién ahí se levanta el
		// velo: auditar antes es auditar una pantalla en negro.
		await page.waitForTimeout(2500);
		await esperarRevelado(page);

		const { violations } = await analizar(page);
		expect(
			violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`),
		).toEqual([]);
	});
}

test("una nota del blog sin violaciones de axe", async ({ page }) => {
	await page.goto("/blog", { waitUntil: "networkidle" });
	await page.locator('a[href*="/blog/"]').filter({ hasNotText: /^$/ }).first().click();
	await page.waitForLoadState("networkidle");
	await page.waitForTimeout(1500);
	await esperarRevelado(page);

	const { violations } = await analizar(page);
	expect(
		violations.map((v) => `${v.id} (${v.nodes.length}): ${v.help}`),
	).toEqual([]);
});

test("hay un solo h1 por página y la jerarquía no salta niveles", async ({ page }) => {
	await page.goto("/", { waitUntil: "networkidle" });
	await page.waitForTimeout(2000);

	await expect(page.locator("h1")).toHaveCount(1);

	const niveles = await page.evaluate(() =>
		[...document.querySelectorAll("h1, h2, h3, h4")].map((h) =>
			Number(h.tagName[1]),
		),
	);
	let anterior = niveles[0];
	for (const nivel of niveles.slice(1)) {
		expect(
			nivel - anterior,
			`salto de h${anterior} a h${nivel} en la secuencia ${niveles.join(",")}`,
		).toBeLessThanOrEqual(1);
		anterior = nivel;
	}
});
