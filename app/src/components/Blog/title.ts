/**
 * El título de una nota, sin los emojis que trae de Sanity.
 *
 * Una de las notas se llama "🚀 SEO para devs: tu código puede marcar la
 * diferencia". El cohete es de otro sitio: acá no hay un solo emoji más, ni
 * en la home, ni en el caso, ni en la navegación. Dejarlo en el listado del
 * blog hacía que esa fila hablara en un idioma distinto al de las otras
 * tres.
 *
 * Se limpia al renderizar y no en el CMS a propósito: el contenido es del
 * autor, la tipografía del sitio es del sitio. Si mañana el título cambia,
 * no hay nada que volver a editar a mano.
 *
 * No toca acentos, ñ, ni signos de puntuación — solo pictogramas, sus
 * selectores de variación y los ZWJ que pegan secuencias como 👨‍💻.
 */

const PICTOGRAMAS = /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{FE0F}\u{200D}\u{20E3}]/gu;

export const limpiarTitulo = (titulo: string): string =>
	titulo.replace(PICTOGRAMAS, "").replace(/\s+/g, " ").trim();
