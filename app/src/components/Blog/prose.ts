/**
 * A post body's classes, in one single place.
 *
 * The blog has two content models in Sanity — Portable Text (`body`) and
 * Markdown (`markdownBody`) — and therefore two different renderers.
 * That's migration debt and gets resolved separately; what CANNOT happen
 * in the meantime is each renderer keeping its own copy of the styles, as
 * it used to: two component maps with the same classes, fifty lines apart.
 * Changing a paragraph's line height required remembering both, and
 * that's exactly the kind of oversight that ends up with a blog that looks
 * different depending on how the post loaded.
 *
 * These are loose strings, not an abstraction: Tailwind scans this file
 * (content includes ./app/**) and the classes survive the purge.
 */
export const prose = {
	p: "m-0 mb-5 max-w-[68ch] break-words font-label text-lg leading-relaxed",
	h1: "mb-4 mt-10 text-2xl md:text-3xl",
	h2: "mb-3 mt-10 text-xl md:text-2xl",
	h3: "mb-2 mt-8 text-lg md:text-xl",
	blockquote:
		"my-6 max-w-[62ch] border-l-2 border-impulse/60 pl-4 font-gloss text-xl italic leading-snug text-myelin",
	ul: "mb-5 max-w-[68ch] list-inside list-disc space-y-1 pl-5 font-label text-lg leading-relaxed",
	ol: "mb-5 max-w-[68ch] list-inside list-decimal space-y-1 pl-5 font-label text-lg leading-relaxed",
	li: "break-words",
	strong: "font-medium text-signal",
	code: "bg-membrane-deep px-1.5 py-0.5 font-mono text-[.9em] text-synapse",
	link: "text-synapse underline decoration-synapse/40 underline-offset-4 hover:text-impulse",
} as const;
