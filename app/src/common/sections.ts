import type { Dict } from "../i18n/dict";
import type { Section } from "./Brain3D";
import type Project from "../../../entities/project";
import { stagesWritten } from "./projects";

// Real connections, not decorative ones: NorteAR uses the same stack that
// shows up in Career, and the recommendations come from people at those
// same jobs. Blog doesn't connect to anything — no post mentions the
// project or the career, so no relationship is invented there.
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
		career: number;
		project: number;
		recommendations: number;
		blog: number;
		cv: number;
	},
): Section[] => [
	{
		label: d.about.career,
		fact: `${counts.companiesCount} · ${counts.projectsCount}`,
		summary: d.hero.sections.experience,
		href: "#step-1",
		step: 1,
		related: [1, 2],
		evidence: evidence.career,
	},
	{
		label: mainProject.name,
		fact: `${stagesWritten(mainProject)} / 6 ${d.ui.beats}`,
		summary: d.hero.sections.projects,
		href: "#step-2",
		step: 2,
		related: [0],
		evidence: evidence.project,
		route: `/projects/${mainProject.slug}`,
	},
	{
		label: d.fields.recommendations,
		fact: counts.recommendationsCount,
		summary: d.hero.sections.recommendations,
		href: "#step-3",
		step: 3,
		related: [0],
		evidence: evidence.recommendations,
	},
	{
		label: d.nav.blog,
		fact: counts.postsCount,
		summary: d.hero.sections.blog,
		href: "#step-4",
		step: 4,
		evidence: evidence.blog,
	},
	{
		label: d.nav.contact,
		fact: d.ui.reply24h,
		summary: d.hero.sections.contact,
		href: "#step-5",
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
		summary: d.hero.sections.cv,
		href: "/pdf.pdf",
		external: true,
		evidence: evidence.cv,
	},
];
