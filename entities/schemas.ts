import { z } from "zod";

/**
 * Validación en runtime de los JSON de api/*.json. Antes se importaban con
 * `as Tipo[]` directo: un JSON mal editado a mano rompía silenciosamente
 * (undefined en runtime) o el build de forma indirecta y confusa. Ahora
 * fallan acá, con un error de Zod que nombra el campo exacto.
 *
 * No usan `.strict()`: los JSON tienen campos extra sin usar hoy
 * (`credentialId`, `icons`) que no vale la pena rechazar.
 */

const localizedText = z.object({ es: z.string(), en: z.string() });

// api/certifications.json
export const CertificationSchema = z.object({
	id: z.number(),
	platform: z.string(),
	name: z.string(),
	date: z.string(),
});
export const CertificationsSchema = z.array(CertificationSchema);
export type Certification = z.infer<typeof CertificationSchema>;

// api/languages.json
export const LanguageItemSchema = z.object({
	id: z.number(),
	nombre: localizedText,
	nivel: localizedText,
});
export const LanguageItemsSchema = z.array(LanguageItemSchema);
export type LanguageItem = z.infer<typeof LanguageItemSchema>;

// api/experienceItems.json — cada entrada trae *o* `roles`, *o* los campos
// de un único rol al nivel superior (ver normalize() en page.tsx).
const RoleSchema = z.object({
	position: z.string(),
	time: z.string(),
	description: z.record(z.string(), z.string()),
	highlights: z.record(z.string(), z.array(z.string())).optional(),
});
export const CompanySchema = z.object({
	company: z.string(),
	totalTime: z.string().optional(),
	time: z.string().optional(),
	position: z.string().optional(),
	description: z.record(z.string(), z.string()).optional(),
	roles: z.array(RoleSchema).optional(),
});
export const CompaniesSchema = z.array(CompanySchema);
export type Company = z.infer<typeof CompanySchema>;
export type Role = z.infer<typeof RoleSchema>;

// api/recommendations.json
export const RecommendationSchema = z.object({
	id: z.number(),
	name: z.string(),
	role: z.string(),
	relation: localizedText,
	date: z.string(),
	text: localizedText,
});
export const RecommendationsSchema = z.array(RecommendationSchema);
export type Recommendation = z.infer<typeof RecommendationSchema>;

// api/workProjects.json — "los otros proyectos" listados bajo Trayectoria,
// distinto del Project de entities/project.ts (que describe NorteAR).
export const WorkProjectSchema = z.object({
	id: z.number(),
	name: z.string(),
	company: z.string(),
	period: z.string(),
	description: z.string(),
	skills: z.array(z.string()),
});
export const WorkProjectsSchema = z.array(WorkProjectSchema);
export type WorkProject = z.infer<typeof WorkProjectSchema>;

// api/descartes.json
export const DescartesSchema = z.object({
	descartado: z.object({
		titulo: localizedText,
		motivo: localizedText,
	}),
});
export type Descartes = z.infer<typeof DescartesSchema>;

// api/projects.json — mismo shape que entities/project.ts's Project.
// Se valida pero no reemplaza esa interface (muchos componentes narrowean
// con `"campo" in stage`, y quiero mantener ese contrato exactamente igual).
const stageSchema = z.object({
	parrafos: z.record(z.string(), z.array(z.string())),
	pendiente: localizedText.optional(),
});
const mechanismStageSchema = stageSchema.extend({
	flujo: z.record(z.string(), z.array(z.string())).optional(),
	codigo: z.string().nullable().optional(),
	diagrama: z.string().optional(),
});
const measurementSchema = z.object({
	etiqueta: localizedText,
	valor: z.string().nullable(),
});
const resultStageSchema = stageSchema.extend({
	medidas: z.array(measurementSchema),
});
const projectLinkSchema = z.object({
	etiqueta: localizedText,
	href: z.string(),
	externo: z.boolean().optional(),
});
export const ProjectSchema = z.object({
	slug: z.string(),
	nombre: z.string(),
	tipo: z.enum(["producto", "maquina", "en-obra"]),
	estado: z.enum(["en-construccion", "en-prueba", "terminado"]),
	contexto: localizedText,
	periodo: localizedText.nullable(),
	resumen: localizedText,
	stack: z.array(z.string()),
	enlaces: z.array(projectLinkSchema),
	peso: z.number(),
	tiempos: z.object({
		problema: stageSchema,
		decision: stageSchema,
		mecanismo: mechanismStageSchema,
		tradeoff: stageSchema,
		resultado: resultStageSchema,
		despues: stageSchema,
	}),
});
export const ProjectsSchema = z.array(ProjectSchema);
