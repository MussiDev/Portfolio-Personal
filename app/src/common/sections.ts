import type { Dict } from "../i18n/dict";
import type { Section } from "./Brain3D";
import type Project from "../../../entities/project";
import { stagesWritten } from "./projects";

// Conexiones reales, no decorativas: NorteAR usa el mismo stack que
// aparece en Trayectoria, y las recomendaciones son de gente de esos
// mismos trabajos. Blog no conecta con nada — ningún post menciona el
// proyecto ni la trayectoria, así que no se inventa una relación ahí.
export const buildSections = (
	d: Dict,
	mainProject: Project,
	counts: {
		companiesCount: string;
		projectsCount: string;
		postsCount: string;
		recommendationsCount: string;
	},
	/**
	 * How many countable items back each region, in the same order. The brain
	 * seeds one mark per item (see brainDensity.ts), so these numbers are the
	 * ones a visitor can check against the sections further down the page.
	 */
	evidence: {
		trayectoria: number;
		proyecto: number;
		recomendaciones: number;
		blog: number;
		cv: number;
	},
): Section[] => [
	{
		label: d.sobreMi.trayectoria,
		fact: `${counts.companiesCount} · ${counts.projectsCount}`,
		summary: d.hero.secciones.experiencia,
		href: "#paso-1",
		step: 1,
		related: [1, 2],
		evidence: evidence.trayectoria,
	},
	{
		label: mainProject.nombre,
		fact: `${stagesWritten(mainProject)} / 6 ${d.ui.tiempos}`,
		summary: d.hero.secciones.proyectos,
		href: "#paso-2",
		step: 2,
		related: [0],
		evidence: evidence.proyecto,
		route: `/proyectos/${mainProject.slug}`,
	},
	{
		label: d.campos.recomendaciones,
		fact: counts.recommendationsCount,
		summary: d.hero.secciones.recomendaciones,
		href: "#paso-3",
		step: 3,
		related: [0],
		evidence: evidence.recomendaciones,
	},
	{
		label: d.nav.blog,
		fact: counts.postsCount,
		summary: d.hero.secciones.blog,
		href: "#paso-4",
		step: 4,
		evidence: evidence.blog,
	},
	{
		label: d.nav.contacto,
		fact: d.ui.respuesta24h,
		summary: d.hero.secciones.contacto,
		href: "#paso-5",
		step: 5,
		// Contact is the only region with nothing to count: there is no list
		// of items behind it, and inventing one would be the decoration this
		// whole movement is removing. It reads as the quiet region, which is
		// what it is.
		evidence: 0,
	},
	{
		label: d.nav.cv,
		fact: "PDF",
		summary: d.hero.secciones.cv,
		href: "/pdf.pdf",
		external: true,
		evidence: evidence.cv,
	},
];
