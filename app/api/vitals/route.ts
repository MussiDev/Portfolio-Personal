import { z } from "zod";

/**
 * Destino propio de las Core Web Vitals que reporta WebVitals.tsx.
 *
 * Sin esto el reporte estaba instalado pero no mandaba nada: dependía de una
 * variable de entorno que nunca se definió. Acá cada métrica real — medida
 * en el navegador de alguien que entró al sitio — queda como una línea JSON
 * en los logs del servidor, filtrable por `"tipo":"web-vital"`. Sin vendor,
 * sin cookies, sin scripts de terceros.
 *
 * Es un endpoint público que escribe en logs, así que desconfía de todo: un
 * tope de tamaño y un schema estricto. Lo que no es una métrica conocida con
 * valores razonables se descarta sin loguear nada.
 */

const MAX_BYTES = 1024;

const Metrica = z.object({
	name: z.enum(["LCP", "INP", "CLS", "FCP", "TTFB", "FID"]),
	value: z.number().nonnegative().max(600_000),
	rating: z.enum(["good", "needs-improvement", "poor"]),
	id: z.string().max(100),
	path: z.string().startsWith("/").max(200),
});

export async function POST(request: Request) {
	const cuerpo = await request.text();
	if (cuerpo.length > MAX_BYTES) return new Response(null, { status: 413 });

	let metrica: z.infer<typeof Metrica>;
	try {
		metrica = Metrica.parse(JSON.parse(cuerpo));
	} catch {
		return new Response(null, { status: 400 });
	}

	console.log(
		JSON.stringify({ tipo: "web-vital", ...metrica, recibido: new Date().toISOString() }),
	);
	// 204: sendBeacon no lee la respuesta, y no hay nada que devolver.
	return new Response(null, { status: 204 });
}
