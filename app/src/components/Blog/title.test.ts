import { test } from "node:test";
import assert from "node:assert/strict";

import { limpiarTitulo } from "./title.ts";

test("saca el emoji del principio y el espacio que deja", () => {
	assert.equal(
		limpiarTitulo("🚀 SEO para devs: tu código puede marcar la diferencia"),
		"SEO para devs: tu código puede marcar la diferencia",
	);
});

test("no toca un título que ya está limpio", () => {
	const t = "El momento en que la web empezó a hablar en Markdown.";
	assert.equal(limpiarTitulo(t), t);
});

test("respeta acentos, ñ y signos de puntuación", () => {
	assert.equal(
		limpiarTitulo("De prompt engineering a context engineering: ¿el cambio real?"),
		"De prompt engineering a context engineering: ¿el cambio real?",
	);
});

test("saca un emoji del medio sin pegar las dos palabras", () => {
	assert.equal(limpiarTitulo("Antes 🚀 después"), "Antes después");
});

test("saca secuencias compuestas enteras, no la mitad", () => {
	assert.equal(limpiarTitulo("👨‍💻 Código"), "Código");
	assert.equal(limpiarTitulo("👍🏽 Bien"), "Bien");
	assert.equal(limpiarTitulo("1️⃣ Primero"), "1 Primero");
});

test("un título que es solo emoji queda vacío, no queda un espacio", () => {
	assert.equal(limpiarTitulo("🚀"), "");
	assert.equal(limpiarTitulo("  🚀  "), "");
});
