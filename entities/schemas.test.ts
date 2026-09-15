import { test } from "node:test";
import assert from "node:assert/strict";

import {
	CertificationsSchema,
	CompaniesSchema,
	ProjectSchema,
	RecommendationsSchema,
} from "./schemas.ts";

test("CertificationsSchema acepta una lista bien formada", () => {
	const result = CertificationsSchema.safeParse([
		{ id: 1, platform: "Platzi", name: "Curso", date: "Oct 2022" },
	]);
	assert.equal(result.success, true);
});

test("CertificationsSchema rechaza un id que no es número", () => {
	const result = CertificationsSchema.safeParse([
		{ id: "1", platform: "Platzi", name: "Curso", date: "Oct 2022" },
	]);
	assert.equal(result.success, false);
});

test("CertificationsSchema ignora campos extra (credentialId, icons)", () => {
	const result = CertificationsSchema.safeParse([
		{ id: 1, platform: "Platzi", name: "Curso", date: "Oct 2022", credentialId: "x" },
	]);
	assert.equal(result.success, true);
});

test("CompaniesSchema acepta tanto el shape con roles como el shape plano", () => {
	const result = CompaniesSchema.safeParse([
		{
			company: "Acme",
			totalTime: "2022 - hoy",
			roles: [{ position: "Dev", time: "2022", description: { es: "x", en: "y" } }],
		},
		{
			company: "Beta",
			position: "Dev",
			time: "2021",
			description: { es: "x", en: "y" },
		},
	]);
	assert.equal(result.success, true);
});

test("RecommendationsSchema exige relation y text bilingües", () => {
	const missing = RecommendationsSchema.safeParse([
		{ id: 1, name: "A", role: "B", relation: { es: "x" }, date: "2022", text: { es: "x", en: "y" } },
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
