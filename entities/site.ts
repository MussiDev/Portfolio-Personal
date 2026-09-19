/**
 * El dominio canónico del sitio.
 *
 * `||` y no `??`: una variable de entorno definida pero vacía — lo que pasa
 * en GitHub Actions cuando un workflow referencia un secret que no existe —
 * llega como "", no como undefined. Con `??` eso pasaba de largo, SITE_URL
 * quedaba vacío y `new URL("")` rompía el build (en /studio, donde se arma
 * metadataBase al cargar el módulo).
 */
export const SITE_URL =
	process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://joaquinmussi.com.ar";
