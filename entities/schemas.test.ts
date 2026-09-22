import { test } from "node:test";
import assert from "node:assert/strict";

import {
	CertificationsSchema,
	CompaniesSchema,
	ProjectSchema,
	RecommendationsSchema,
	WorkProjectsSchema,
} from "./schemas.ts";

test("CertificationsSchema accepts a well-formed list", () => {
	const result = CertificationsSchema.safeParse([
		{ id: 1, platform: "Platzi", name: "Curso", date: "2022-10" },
	]);
	assert.equal(result.success, true);
});

test("CertificationsSchema rejects an id that isn't a number", () => {
	const result = CertificationsSchema.safeParse([
		{ id: "1", platform: "Platzi", name: "Curso", date: "2022-10" },
	]);
	assert.equal(result.success, false);
});

test("CertificationsSchema ignores extra fields (credentialId, icons)", () => {
	const result = CertificationsSchema.safeParse([
		{ id: 1, platform: "Platzi", name: "Curso", date: "2022-10", credentialId: "x" },
	]);
	assert.equal(result.success, true);
});

test("CompaniesSchema accepts both the roles shape and the flat shape", () => {
	const result = CompaniesSchema.safeParse([
		{
			company: "Acme",
			totalTime: { from: "2022-01", to: null },
			roles: [{ position: "Dev", time: { from: "2022-01", to: null }, description: { es: "x", en: "y" } }],
		},
		{
			company: "Beta",
			position: "Dev",
			time: { from: "2021-01", to: "2021-12" },
			description: { es: "x", en: "y" },
		},
	]);
	assert.equal(result.success, true);
});

test("RecommendationsSchema requires bilingual relation and text", () => {
	const missing = RecommendationsSchema.safeParse([
		{ id: 1, name: "A", role: "B", relation: { es: "x" }, date: "2022-01", text: { es: "x", en: "y" } },
	]);
	assert.equal(missing.success, false);
});

test("ProjectSchema validates the full stages tree", () => {
	const valid = ProjectSchema.safeParse({
		slug: "x",
		name: "X",
		type: "product",
		status: "in-progress",
		context: { es: "a", en: "b" },
		period: null,
		summary: { es: "a", en: "b" },
		stack: ["Next.js"],
		links: [],
		weight: 1,
		stages: {
			problem: { paragraphs: { es: [], en: [] } },
			decision: { paragraphs: { es: [], en: [] } },
			mechanism: { paragraphs: { es: [], en: [] } },
			tradeoff: { paragraphs: { es: [], en: [] } },
			result: { paragraphs: { es: [], en: [] }, measurements: [] },
			after: { paragraphs: { es: [], en: [] } },
		},
	});
	assert.equal(valid.success, true);

	const invalidStatus = ProjectSchema.safeParse({
		slug: "x",
		name: "X",
		type: "product",
		status: "not-a-valid-status",
		context: { es: "a", en: "b" },
		period: null,
		summary: { es: "a", en: "b" },
		stack: [],
		links: [],
		weight: 1,
		stages: {
			problem: { paragraphs: { es: [], en: [] } },
			decision: { paragraphs: { es: [], en: [] } },
			mechanism: { paragraphs: { es: [], en: [] } },
			tradeoff: { paragraphs: { es: [], en: [] } },
			result: { paragraphs: { es: [], en: [] }, measurements: [] },
			after: { paragraphs: { es: [], en: [] } },
		},
	});
	assert.equal(invalidStatus.success, false);
});

test("every file under api/ satisfies its schema", async () => {
	// The data and the schemas are edited separately: a shape change in a
	// JSON file (plain text becoming {es, en}, say) used to only be caught
	// by the home's build, late and with a confusing Next.js stack trace.
	// Here it fails with the file's name.
	const fs = await import("node:fs");
	const schemas = await import("./schemas.ts");
	const files = {
		"api/certifications.json": schemas.CertificationsSchema,
		"api/languages.json": schemas.LanguageItemsSchema,
		"api/experienceItems.json": schemas.CompaniesSchema,
		"api/recommendations.json": schemas.RecommendationsSchema,
		"api/workProjects.json": schemas.WorkProjectsSchema,
		"api/descartes.json": schemas.DescartesSchema,
		"api/projects.json": schemas.ProjectsSchema,
	};
	for (const [path, schema] of Object.entries(files)) {
		const data = JSON.parse(fs.readFileSync(path, "utf8"));
		const r = schema.safeParse(data);
		assert.ok(r.success, `${path} doesn't satisfy its schema: ${r.success ? "" : r.error.message}`);
	}
});

test("work projects are translated, not in a single language", () => {
	const r = WorkProjectsSchema.safeParse([
		{ id: 1, name: "Solo español", company: "X", period: "2024", description: "texto", skills: [] },
	]);
	assert.equal(r.success, false);
});

test("dates are data: a display string is rejected", () => {
	const result = CertificationsSchema.safeParse([
		{ id: 1, platform: "Platzi", name: "Curso", date: "Oct 2022" },
	]);
	assert.equal(result.success, false);
});
