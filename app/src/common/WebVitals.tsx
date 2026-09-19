"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Reporte de Core Web Vitals reales (LCP, INP, CLS, FCP, TTFB) medidos en
 * el navegador de la gente que visita, no en un Lighthouse de laboratorio.
 *
 * Sin esto el sitio no medía absolutamente nada: no había forma de saber si
 * el LCP real es 1.2s o 4s, ni de detectar que un cambio lo empeoró. Un
 * portfolio que se presenta como "arquitectura y performance" tiene que
 * poder responder esa pregunta con un número.
 *
 * A propósito NO trae un vendor: `useReportWebVitals` es de Next, cero
 * dependencias nuevas, cero scripts de terceros, cero cookies. Por defecto
 * las métricas van a /api/vitals, que las deja en los logs del servidor.
 * Antes el destino dependía de una variable de entorno que nunca se
 * definió, así que el reporte estaba instalado y no medía nada.
 *
 *   (sin definir)                          → POST a /api/vitals
 *   NEXT_PUBLIC_VITALS_ENDPOINT=https://…  → POST a ese destino
 *
 * Si el endpoint es de otro origen, next.config.js lo agrega solo a
 * connect-src de la CSP: sin eso el beacon se bloquearía en silencio y esto
 * parecería andar sin andar.
 */

const ENDPOINT = process.env.NEXT_PUBLIC_VITALS_ENDPOINT || "/api/vitals";

// Next también reporta métricas propias (hidratación, render de rutas).
// Solo viajan las Core Web Vitals, que es lo que /api/vitals acepta.
const WEB_VITALS = new Set(["LCP", "INP", "CLS", "FCP", "TTFB", "FID"]);

const WebVitals = (): null => {
	useReportWebVitals((metric) => {
		if (process.env.NODE_ENV !== "production") {
			// En dev el destino es la consola: sirve para ver el efecto de un
			// cambio sin montar infraestructura.
			console.info(
				`[vitals] ${metric.name} ${Math.round(metric.value)} (${metric.rating})`,
			);
			return;
		}

		if (!WEB_VITALS.has(metric.name)) return;

		const body = JSON.stringify({
			name: metric.name,
			value: metric.value,
			rating: metric.rating,
			id: metric.id,
			path: window.location.pathname,
		});

		// sendBeacon sobrevive a que la pestaña se cierre, que es justo cuando
		// se reportan las métricas finales; fetch con keepalive es el fallback.
		if (navigator.sendBeacon) {
			navigator.sendBeacon(ENDPOINT, body);
			return;
		}
		void fetch(ENDPOINT, {
			body,
			method: "POST",
			keepalive: true,
			headers: { "Content-Type": "application/json" },
		}).catch(() => {
			// Perder una métrica nunca puede romper la página.
		});
	});

	return null;
};

export default WebVitals;
