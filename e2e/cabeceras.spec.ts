import { expect, test } from "@playwright/test";

/**
 * Las cabeceras de seguridad del build de producción.
 *
 * La CSP pasó a depender del entorno para que React pueda usar eval() en
 * `next dev` (sin eso la consola de desarrollo escupe un error en cada
 * carga y se apagan sus herramientas de debug). Eso deja una trampa nueva:
 * si alguien saca la condición, 'unsafe-eval' viaja a producción y nadie se
 * entera — la página se ve idéntica. Estos tests corren contra el build de
 * producción, así que pueden afirmarlo de verdad.
 */

test("producción no habilita 'unsafe-eval' en la CSP", async ({ request }) => {
	const res = await request.get("/", { maxRedirects: 5 });
	const csp = res.headers()["content-security-policy"];
	expect(csp, "la home se sirvió sin CSP").toBeTruthy();

	const scriptSrc = csp.split(";").map((d) => d.trim()).find((d) => d.startsWith("script-src"));
	expect(scriptSrc, "la CSP no declara script-src").toBeTruthy();
	// 'unsafe-eval' convierte cualquier inyección de string en ejecución de
	// código. React no lo usa nunca en producción, así que acá no compra nada.
	expect(scriptSrc, `script-src en producción: ${scriptSrc}`).not.toContain("unsafe-eval");
});

test("el resto de las cabeceras de seguridad sigue en su lugar", async ({ request }) => {
	const h = (await request.get("/", { maxRedirects: 5 })).headers();
	expect(h["x-content-type-options"]).toBe("nosniff");
	expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
	expect(h["x-frame-options"]).toBe("DENY");
	expect(h["strict-transport-security"]).toContain("max-age=");
});

test("/studio no queda sin cabeceras, aunque no lleve la CSP completa", async ({ request }) => {
	// El secret de Sanity viaja en la query string: sin Referrer-Policy se
	// filtra al primer link saliente.
	const h = (await request.get("/studio", { maxRedirects: 5 })).headers();
	expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
	expect(h["x-content-type-options"]).toBe("nosniff");
});
