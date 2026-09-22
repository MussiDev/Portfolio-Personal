import { test } from "node:test";
import assert from "node:assert/strict";

import { sceneForRoute } from "./scene.ts";
import type { Section } from "./Brain3D.ts";

const sections = [
	{ label: "Career", fact: "", summary: "", href: "#step-1", step: 1 },
	{
		label: "NorteAR",
		fact: "",
		summary: "",
		href: "#step-2",
		step: 2,
		route: "/projects/nortear",
	},
	{ label: "CV", fact: "", summary: "", href: "/pdf.pdf", external: true },
] as Section[];

test("the home asks for the index scene, in either language", () => {
	assert.deepEqual(sceneForRoute("/", sections), { mode: "home" });
	assert.deepEqual(sceneForRoute("/en", sections), { mode: "home" });
	assert.deepEqual(sceneForRoute("/en/", sections), { mode: "home" });
});

test("the rewritten path the server sees is the same scene as the browser's", () => {
	// proxy.ts rewrites "/" to "/es": if these disagreed, the server would
	// render one scene and the client another, remounting the page.
	assert.deepEqual(sceneForRoute("/es", sections), sceneForRoute("/", sections));
	assert.deepEqual(
		sceneForRoute("/es/projects/nortear", sections),
		sceneForRoute("/projects/nortear", sections),
	);
});

test("a case route focuses the region that owns it", () => {
	assert.deepEqual(sceneForRoute("/projects/nortear", sections), {
		mode: "case",
		region: 1,
	});
	assert.deepEqual(sceneForRoute("/en/projects/nortear", sections), {
		mode: "case",
		region: 1,
	});
});

test("routes with no region get no brain: the blog never pays for it", () => {
	assert.deepEqual(sceneForRoute("/blog", sections), { mode: "none" });
	assert.deepEqual(sceneForRoute("/en/blog/a-note", sections), { mode: "none" });
	assert.deepEqual(sceneForRoute("/projects/other", sections), { mode: "none" });
});

test("a language segment is only stripped when it is the prefix", () => {
	// "/entrevistas" starts with "en" but is not the English home.
	assert.deepEqual(sceneForRoute("/entrevistas", sections), { mode: "none" });
});
