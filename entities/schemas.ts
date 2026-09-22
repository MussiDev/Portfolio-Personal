import { z } from "zod";

import { YEAR_MONTH } from "./dates.ts";

/**
 * Runtime validation of the api/*.json files. They used to be imported with
 * a direct `as Type[]`: a hand-edited JSON with a typo failed silently
 * (undefined at runtime) or broke the build in an indirect, confusing way.
 * Now they fail here, with a Zod error that names the exact field.
 *
 * They don't use `.strict()`: the JSON files carry extra fields that go
 * unused today (`credentialId`, `icons`) that aren't worth rejecting.
 */

const localizedText = z.object({ es: z.string(), en: z.string() });

// Dates are data, formatted per language in entities/dates.ts. A display
// string like "Jun 2022" fails here instead of leaking into the other
// language's page.
const yearMonth = z.string().regex(YEAR_MONTH, 'expected "YYYY-MM"');
const period = z.object({ from: yearMonth, to: yearMonth.nullable() });

// api/certifications.json
export const CertificationSchema = z.object({
	id: z.number(),
	platform: z.string(),
	name: z.string(),
	date: yearMonth,
});
export const CertificationsSchema = z.array(CertificationSchema);
export type Certification = z.infer<typeof CertificationSchema>;

// api/languages.json
export const LanguageItemSchema = z.object({
	id: z.number(),
	name: localizedText,
	level: localizedText,
});
export const LanguageItemsSchema = z.array(LanguageItemSchema);
export type LanguageItem = z.infer<typeof LanguageItemSchema>;

// api/experienceItems.json — each entry carries *either* `roles`, *or* the
// fields of a single role at the top level (see normalize() in page.tsx).
const RoleSchema = z.object({
	position: z.string(),
	time: period,
	description: z.record(z.string(), z.string()),
	highlights: z.record(z.string(), z.array(z.string())).optional(),
});
export const CompanySchema = z.object({
	company: z.string(),
	totalTime: period.optional(),
	time: period.optional(),
	/** "Remote", "Part-time": shown next to the company's period. */
	mode: localizedText.optional(),
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
	date: yearMonth,
	text: localizedText,
});
export const RecommendationsSchema = z.array(RecommendationSchema);
export type Recommendation = z.infer<typeof RecommendationSchema>;

// api/workProjects.json — "the other projects" listed under Career, distinct
// from the Project in entities/project.ts (which describes NorteAR).
// name and description are translated (es/en), like the rest of the
// content: they used to be plain Spanish text and showed up that way on
// /en too.
export const WorkProjectSchema = z.object({
	id: z.number(),
	name: localizedText,
	company: z.string(),
	period: period.nullable(),
	description: localizedText,
	skills: z.array(z.string()),
});
export const WorkProjectsSchema = z.array(WorkProjectSchema);
export type WorkProject = z.infer<typeof WorkProjectSchema>;

// api/descartes.json
export const DescartesSchema = z.object({
	discarded: z.object({
		title: localizedText,
		reason: localizedText,
	}),
});
export type Descartes = z.infer<typeof DescartesSchema>;

// api/projects.json — same shape as entities/project.ts's Project. It gets
// validated but doesn't replace that interface (many components narrow with
// `"field" in stage`, and that contract should stay exactly the same).
const stageSchema = z.object({
	paragraphs: z.record(z.string(), z.array(z.string())),
	pending: localizedText.optional(),
});
const mechanismStageSchema = stageSchema.extend({
	flow: z.record(z.string(), z.array(z.string())).optional(),
	code: z.string().nullable().optional(),
	diagram: z.string().optional(),
});
const measurementSchema = z.object({
	label: localizedText,
	value: z.string().nullable(),
});
const resultStageSchema = stageSchema.extend({
	measurements: z.array(measurementSchema),
});
const projectLinkSchema = z.object({
	label: localizedText,
	href: z.string(),
	external: z.boolean().optional(),
});
export const ProjectSchema = z.object({
	slug: z.string(),
	name: z.string(),
	type: z.enum(["product", "machine", "work-in-progress"]),
	status: z.enum(["in-progress", "in-testing", "done"]),
	context: localizedText,
	period: localizedText.nullable(),
	summary: localizedText,
	stack: z.array(z.string()),
	links: z.array(projectLinkSchema),
	weight: z.number(),
	stages: z.object({
		problem: stageSchema,
		decision: stageSchema,
		mechanism: mechanismStageSchema,
		tradeoff: stageSchema,
		result: resultStageSchema,
		after: stageSchema,
	}),
});
export const ProjectsSchema = z.array(ProjectSchema);
