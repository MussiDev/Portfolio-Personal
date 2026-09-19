/**
 * Las clases del cuerpo de un post, en un solo lugar.
 *
 * El blog tiene dos modelos de contenido en Sanity — Portable Text (`body`)
 * y Markdown (`markdownBody`) — y por lo tanto dos renderers distintos. Eso
 * es deuda de migración y se resuelve aparte; lo que NO puede pasar
 * mientras tanto es que cada renderer tenga su propia copia de los estilos,
 * como estaba: dos mapas de componentes con las mismas clases, a cincuenta
 * líneas de distancia. Cambiar el interlineado de un párrafo requería
 * acordarse de los dos, y esa es exactamente la clase de olvido que termina
 * en un blog que se ve distinto según cómo se cargó el post.
 *
 * Son strings sueltos y no una abstracción: Tailwind escanea este archivo
 * (content incluye ./app/**) y las clases sobreviven al purge.
 */
export const prose = {
	p: "m-0 mb-5 max-w-[68ch] break-words font-rotulo text-lg leading-relaxed",
	h1: "mb-4 mt-10 text-2xl md:text-3xl",
	h2: "mb-3 mt-10 text-xl md:text-2xl",
	h3: "mb-2 mt-8 text-lg md:text-xl",
	blockquote:
		"my-6 max-w-[62ch] border-l-2 border-impulso/60 pl-4 font-glosa text-xl italic leading-snug text-mielina",
	ul: "mb-5 max-w-[68ch] list-inside list-disc space-y-1 pl-5 font-rotulo text-lg leading-relaxed",
	ol: "mb-5 max-w-[68ch] list-inside list-decimal space-y-1 pl-5 font-rotulo text-lg leading-relaxed",
	li: "break-words",
	strong: "font-medium text-senal",
	code: "bg-membrana-honda px-1.5 py-0.5 font-pieza text-[.9em] text-sinapsis",
	link: "text-sinapsis underline decoration-sinapsis/40 underline-offset-4 hover:text-impulso",
} as const;
