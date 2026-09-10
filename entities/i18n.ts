/** Los dos idiomas del sitio. El español es el que no lleva prefijo. */
export const IDIOMAS = ["es", "en"] as const;
export type Idioma = (typeof IDIOMAS)[number];
export const IDIOMA_POR_DEFECTO: Idioma = "es";

/** Un texto que existe en los dos idiomas. */
export type Texto = Record<Idioma, string>;

export const esIdioma = (v: string): v is Idioma =>
	(IDIOMAS as readonly string[]).includes(v);

/**
 * Elige el texto del idioma pedido. Si falta la traducción cae al español
 * en vez de mostrar un hueco — un sitio a medio traducir se lee mejor que
 * uno con espacios en blanco.
 */
export const t = (texto: Texto | undefined, lang: Idioma): string =>
	texto?.[lang] ?? texto?.[IDIOMA_POR_DEFECTO] ?? "";

/**
 * Una ruta interna en el idioma actual.
 *
 * El español no lleva prefijo, así que la misma página se escribe distinto
 * en cada idioma. Todo enlace interno del taller pasa por acá: escribir
 * "/maquinas" a mano es lo que hacía que navegar en inglés te devolviera
 * al español.
 */
export const ruta = (lang: Idioma, path = "/"): string => {
	const limpia = path.startsWith("/") ? path : `/${path}`;
	if (lang === IDIOMA_POR_DEFECTO) return limpia;
	return limpia === "/" ? `/${lang}` : `/${lang}${limpia}`;
};
