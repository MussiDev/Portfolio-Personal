import { expect, test } from "@playwright/test";

/**
 * El reporte de Core Web Vitals estuvo instalado y sin mandar nada: el
 * destino dependía de una variable de entorno que nunca se definió. Estos
 * tests fijan las dos mitades — que el navegador realmente envíe métricas, y
 * que el endpoint que las recibe no acepte cualquier cosa (es público y
 * escribe en logs).
 */

const valida = { name: "LCP", value: 1234.5, rating: "good", id: "v4-1", path: "/" };

test("el navegador manda las métricas reales al cargar la página", async ({ page }) => {
	const enviada = page.waitForRequest(
		(r) => r.url().endsWith("/api/vitals") && r.method() === "POST",
		{ timeout: 15_000 },
	);
	await page.goto("/");
	const pedido = await enviada;
	const cuerpo = JSON.parse(pedido.postData() ?? "{}");
	expect(["LCP", "INP", "CLS", "FCP", "TTFB", "FID"]).toContain(cuerpo.name);
	expect(typeof cuerpo.value).toBe("number");
	expect(cuerpo.path).toBe("/");
});

test.describe("el endpoint", () => {
	test.skip(({ isMobile }) => isMobile, "es la misma API en los dos proyectos");

	test("acepta una métrica válida", async ({ request }) => {
		const r = await request.post("/api/vitals", { data: JSON.stringify(valida) });
		expect(r.status()).toBe(204);
	});

	test("rechaza lo que no es una Core Web Vital", async ({ request }) => {
		for (const cuerpo of [
			"no es json",
			JSON.stringify({ ...valida, name: "Next.js-hydration" }),
			JSON.stringify({ ...valida, value: -1 }),
			JSON.stringify({ ...valida, rating: "excelente" }),
			JSON.stringify({ ...valida, path: "https://otro-sitio.com" }),
		]) {
			const r = await request.post("/api/vitals", { data: cuerpo });
			expect(r.status(), `aceptó: ${cuerpo}`).toBe(400);
		}
	});

	test("corta los cuerpos grandes antes de parsearlos", async ({ request }) => {
		const r = await request.post("/api/vitals", {
			data: JSON.stringify({ ...valida, id: "x".repeat(5000) }),
		});
		expect(r.status()).toBe(413);
	});
});
