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
): Section[] => [
	{
		label: d.sobreMi.trayectoria,
		fact: `${counts.companiesCount} · ${counts.projectsCount}`,
		summary: d.hero.secciones.experiencia,
		href: "#paso-1",
		step: 1,
		related: [1, 2],
	},
	{
		label: mainProject.nombre,
		fact: `${stagesWritten(mainProject)} / 6 ${d.ui.tiempos}`,
		summary: d.hero.secciones.proyectos,
		href: "#paso-2",
		step: 2,
		related: [0],
		route: `/proyectos/${mainProject.slug}`,
	},
	{
		label: d.campos.recomendaciones,
		fact: counts.recommendationsCount,
		summary: d.hero.secciones.recomendaciones,
		href: "#paso-3",
		step: 3,
		related: [0],
	},
	{
		label: d.nav.blog,
		fact: counts.postsCount,
		summary: d.hero.secciones.blog,
		href: "#paso-4",
		step: 4,
	},
	{
		label: d.nav.contacto,
		fact: d.ui.respuesta24h,
		summary: d.hero.secciones.contacto,
		href: "#paso-5",
		step: 5,
	},
	{
		label: d.nav.cv,
		fact: "PDF",
		summary: d.hero.secciones.cv,
		href: "/pdf.pdf",
		external: true,
	},
];
