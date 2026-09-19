/**
 * De qué proyecto y dataset de Sanity lee el sitio.
 *
 * Una sola fuente para el cliente (sanity/lib/client.ts) y el Studio
 * (sanity.config.ts): antes el Studio tenía los valores escritos a mano y el
 * cliente los leía solo de variables de entorno, así que podían apuntar a
 * lugares distintos sin que nada avisara.
 *
 * El projectId no es un secreto — viaja en el bundle del navegador de todas
 * formas —, así que tiene un valor por defecto real. `||` y no `??`: en
 * GitHub Actions un secret que no existe llega como "", y con eso el cliente
 * de Sanity rompía el build ("Configuration must contain `projectId`").
 */
export const SANITY_PROJECT_ID =
	process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || "3rq1799s";

export const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
