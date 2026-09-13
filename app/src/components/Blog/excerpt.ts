export interface PortableTextSpan {
	_type: "span";
	text: string;
}

export interface PortableTextBlock {
	_type: string;
	style?: string;
	children?: PortableTextSpan[];
}

const EXCERPT_LENGTH = 155;

export function extractExcerpt(post: {
	body?: PortableTextBlock[];
	markdownBody?: string;
}): string {
	let raw = post.markdownBody ?? "";
	if (!raw) {
		if (!Array.isArray(post.body)) return "";
		const firstParagraph = post.body.find(
			(block) => block._type === "block" && block.style === "normal",
		);
		raw = firstParagraph?.children?.map((child) => child.text ?? "").join("") ?? "";
	}

	const clean = raw
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/[#*`>]/g, "")
		.replace(/\s+/g, " ")
		.trim();

	if (clean.length <= EXCERPT_LENGTH) return clean;
	const cut = clean.slice(0, EXCERPT_LENGTH);
	const lastSpace = cut.lastIndexOf(" ");
	return `${cut.slice(0, lastSpace > 0 ? lastSpace : EXCERPT_LENGTH)}…`;
}
