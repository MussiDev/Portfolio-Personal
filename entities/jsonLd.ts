/**
 * Serializes a JSON-LD object for injection with dangerouslySetInnerHTML.
 *
 * JSON.stringify doesn't escape "</script>", so a value containing that
 * sequence (a post title, say) closes the script block early and whatever
 * follows executes as HTML/JS. `<` gets escaped to its unicode form: JSON
 * parses it the same way, and the HTML parser stops recognizing the
 * closing tag.
 */
export const toJsonLdScript = (data: unknown): string =>
	JSON.stringify(data).replace(/</g, "\\u003c");
