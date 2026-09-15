/**
 * Serializa un objeto JSON-LD para inyectarlo con dangerouslySetInnerHTML.
 *
 * JSON.stringify no escapa "</script>", así que un valor con esa secuencia
 * (un título de post, por ejemplo) corta el bloque de script y lo que sigue
 * se ejecuta como HTML/JS. `<` se escapa a su forma unicode: JSON la
 * interpreta igual, y el parser de HTML deja de reconocer el cierre.
 */
export const toJsonLdScript = (data: unknown): string =>
	JSON.stringify(data).replace(/</g, "\\u003c");
