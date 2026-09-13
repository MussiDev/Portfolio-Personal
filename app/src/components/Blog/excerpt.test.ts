import { test } from "node:test";
import assert from "node:assert/strict";

import { extractExcerpt } from "./excerpt.ts";

test("extractExcerpt: replaces a markdown link with its text, dropping the URL", () => {
	const result = extractExcerpt({
		markdownBody:
			"El prompt engineering [no murió](https://example.com/post) todavía.",
	});
	assert.equal(result, "El prompt engineering no murió todavía.");
	assert.ok(!result.includes("http"));
});

test("extractExcerpt: strips markdown punctuation and collapses whitespace", () => {
	const result = extractExcerpt({
		markdownBody: "# Título\n\n*Un* párrafo   con  espacios\ny saltos.",
	});
	assert.equal(result, "Título Un párrafo con espacios y saltos.");
});

test("extractExcerpt: cuts on a word boundary past the length limit", () => {
	const long = "palabra ".repeat(40).trim();
	const result = extractExcerpt({ markdownBody: long });
	assert.ok(result.length <= 156);
	assert.ok(result.endsWith("…"));
	assert.ok(!result.slice(0, -1).endsWith(" "));
});

test("extractExcerpt: falls back to the first normal-style block in portable text", () => {
	const result = extractExcerpt({
		body: [
			{ _type: "block", style: "h1", children: [{ _type: "span", text: "Título" }] },
			{
				_type: "block",
				style: "normal",
				children: [
					{ _type: "span", text: "Primer " },
					{ _type: "span", text: "párrafo." },
				],
			},
		],
	});
	assert.equal(result, "Primer párrafo.");
});

test("extractExcerpt: returns an empty string with no content", () => {
	assert.equal(extractExcerpt({}), "");
});
