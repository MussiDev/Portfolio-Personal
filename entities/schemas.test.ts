import { test } from "node:test";
import assert from "node:assert/strict";

import {
	CertificationsSchema,
	CompaniesSchema,
	ProjectSchema,
	RecommendationsSchema,
	WorkProjectsSchema,
} from "./schemas.ts";

test("CertificationsSchema acepta una lista bien formada", () => {
	const result = CertificationsSchema.safeParse([
		{ id: 1, platform: "Platzi", name: "Curso", date: "2022-10" },
	]);
	assert.equal(result.success, true);
});

test("CertificationsSchema rechaza un id que no es número", () => {
	const result = CertificationsSchema.safeParse([
		{ id: "1", platform: "Platzi", name: "Curso", date: "2022-10" },
	]);
	assert.equal(result.success, false);
});

test("CertificationsSchema ignora campos extra (credentialId, icons)", () => {
	const result = CertificationsSchema.safeParse([
		{ id: 1, platform: "Platzi", name: "Curso", date: "2022-10", credentialId: "x" },
	]);
	assert.equal(result.success, true);
});

test("CompaniesSchema acepta tanto el shape con roles como el shape plano", () => {
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

test("RecommendationsSchema exige relation y text bilingües", () => {
	const missing = RecommendationsSchema.safeParse([
		{ id: 1, name: "A", role: "B", relation: { es: "x" }, date: "2022-01", text: { es: "x", en: "y" } },
	]);
	assert.equal(missing.success, false);
});

test("ProjectSchema valida el árbol completo de tiempos", () => {
	const valid = ProjectSchema.safeParse({
		slug: "x",
		nombre: "X",
		tipo: "producto",
		estado: "en-construccion",
		contexto: { es: "a", en: "b" },
		periodo: null,
		resumen: { es: "a", en: "b" },
		stack: ["Next.js"],
		enlaces: [],
		peso: 1,
		tiempos: {
			problema: { parrafos: { es: [], en: [] } },
			decision: { parrafos: { es: [], en: [] } },
			mecanismo: { parrafos: { es: [], en: [] } },
			tradeoff: { parrafos: { es: [], en: [] } },
			resultado: { parrafos: { es: [], en: [] }, medidas: [] },
			despues: { parrafos: { es: [], en: [] } },
		},
	});
	assert.equal(valid.success, true);

	const invalidEstado = ProjectSchema.safeParse({
		slug: "x",
		nombre: "X",
		tipo: "producto",
		estado: "no-es-un-estado-valido",
		contexto: { es: "a", en: "b" },
		periodo: null,
		resumen: { es: "a", en: "b" },
		stack: [],
		enlaces: [],
		peso: 1,
		tiempos: {
			problema: { parrafos: { es: [], en: [] } },
			decision: { parrafos: { es: [], en: [] } },
			mecanismo: { parrafos: { es: [], en: [] } },
			tradeoff: { parrafos: { es: [], en: [] } },
			resultado: { parrafos: { es: [], en: [] }, medidas: [] },
			despues: { parrafos: { es: [], en: [] } },
		},
	});
	assert.equal(invalidEstado.success, false);
});

test("cada archivo de api/ cumple su schema", async () => {
	// Los datos y los schemas se editan por separado: un cambio de forma en
	// un JSON (texto plano que pasa a ser {es, en}, por ejemplo) solo lo
	// detectaba el build de la home, tarde y con un stack trace de Next. Acá
	// falla con el nombre del archivo.
	const fs = await import("node:fs");
	const schemas = await import("./schemas.ts");
	const archivos = {
		"api/certifications.json": schemas.CertificationsSchema,
		"api/languages.json": schemas.LanguageItemsSchema,
		"api/experienceItems.json": schemas.CompaniesSchema,
		"api/recommendations.json": schemas.RecommendationsSchema,
		"api/workProjects.json": schemas.WorkProjectsSchema,
		"api/descartes.json": schemas.DescartesSchema,
		"api/projects.json": schemas.ProjectsSchema,
	};
	for (const [ruta, schema] of Object.entries(archivos)) {
		const datos = JSON.parse(fs.readFileSync(ruta, "utf8"));
		const r = schema.safeParse(datos);
		assert.ok(r.success, `${ruta} no cumple su schema: ${r.success ? "" : r.error.message}`);
	}
});

test("los proyectos de trabajo están traducidos, no en un solo idioma", () => {
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
