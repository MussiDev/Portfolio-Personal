import { test } from "node:test";
import assert from "node:assert/strict";

import { cleanTitle } from "./title.ts";

test("strips the emoji from the start and the space it leaves", () => {
	assert.equal(
		cleanTitle("🚀 SEO para devs: tu código puede marcar la diferencia"),
		"SEO para devs: tu código puede marcar la diferencia",
	);
});

test("doesn't touch a title that's already clean", () => {
	const t = "El momento en que la web empezó a hablar en Markdown.";
	assert.equal(cleanTitle(t), t);
});

test("respects accents, ñ and punctuation", () => {
	assert.equal(
		cleanTitle("De prompt engineering a context engineering: ¿el cambio real?"),
		"De prompt engineering a context engineering: ¿el cambio real?",
	);
});

test("strips an emoji from the middle without gluing the two words together", () => {
	assert.equal(cleanTitle("Antes 🚀 después"), "Antes después");
});

test("strips whole compound sequences, not half of them", () => {
	assert.equal(cleanTitle("👨‍💻 Código"), "Código");
	assert.equal(cleanTitle("👍🏽 Bien"), "Bien");
	assert.equal(cleanTitle("1️⃣ Primero"), "1 Primero");
});

test("a title that's only emoji ends up empty, not with a leftover space", () => {
	assert.equal(cleanTitle("🚀"), "");
	assert.equal(cleanTitle("  🚀  "), "");
});
