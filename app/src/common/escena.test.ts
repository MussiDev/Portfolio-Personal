import { test } from "node:test";
import assert from "node:assert/strict";

import { escenaDeRuta } from "./escena.ts";
import type { Section } from "./Brain3D.ts";

const sections = [
	{ label: "Trayectoria", fact: "", summary: "", href: "#paso-1", step: 1 },
	{
		label: "NorteAR",
		fact: "",
		summary: "",
		href: "#paso-2",
		step: 2,
		route: "/proyectos/nortear",
	},
	{ label: "CV", fact: "", summary: "", href: "/pdf.pdf", external: true },
] as Section[];

test("the home asks for the index scene, in either language", () => {
	assert.deepEqual(escenaDeRuta("/", sections), { modo: "home" });
	assert.deepEqual(escenaDeRuta("/en", sections), { modo: "home" });
	assert.deepEqual(escenaDeRuta("/en/", sections), { modo: "home" });
});

test("the rewritten path the server sees is the same scene as the browser's", () => {
	// proxy.ts rewrites "/" to "/es": if these disagreed, the server would
	// render one scene and the client another, remounting the page.
	assert.deepEqual(escenaDeRuta("/es", sections), escenaDeRuta("/", sections));
	assert.deepEqual(
		escenaDeRuta("/es/proyectos/nortear", sections),
		escenaDeRuta("/proyectos/nortear", sections),
	);
});

test("a case route focuses the region that owns it", () => {
	assert.deepEqual(escenaDeRuta("/proyectos/nortear", sections), {
		modo: "caso",
		region: 1,
	});
	assert.deepEqual(escenaDeRuta("/en/proyectos/nortear", sections), {
		modo: "caso",
		region: 1,
	});
});

test("routes with no region get no brain: the blog never pays for it", () => {
	assert.deepEqual(escenaDeRuta("/blog", sections), { modo: "ninguna" });
	assert.deepEqual(escenaDeRuta("/en/blog/una-nota", sections), { modo: "ninguna" });
	assert.deepEqual(escenaDeRuta("/proyectos/otro", sections), { modo: "ninguna" });
});

test("a language segment is only stripped when it is the prefix", () => {
	// "/entrevistas" starts with "en" but is not the English home.
	assert.deepEqual(escenaDeRuta("/entrevistas", sections), { modo: "ninguna" });
});
