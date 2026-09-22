import { cache } from "react";

import certifications from "../../../api/certifications.json";
import experienceItems from "../../../api/experienceItems.json";
import languages from "../../../api/languages.json";
import recommendations from "../../../api/recommendations.json";
import workProjects from "../../../api/workProjects.json";
import type { Language } from "../../../entities/i18n";
import {
	CertificationsSchema,
	CompaniesSchema,
	LanguageItemsSchema,
	RecommendationsSchema,
	WorkProjectsSchema,
} from "../../../entities/schemas";
import { client } from "../../../sanity/lib/client";
import { postsQuery } from "../../../sanity/lib/queries";
import { getDict } from "../i18n/dict";
import type { Post } from "../sections/BlogSection";
import { getProjects, stagesWritten } from "./projects";
import { buildSections } from "./sections";

/**
 * The index of the site, and the content the home renders from it.
 *
 * It lives here because the brain moved to the [lang] layout: the layout
 * needs the six regions, and the home needs the same regions plus the data
 * behind them. `cache` dedupes it inside a single request, so the layout and
 * the page don't each hit Sanity.
 */
export const getSiteData = cache(async (lang: Language) => {
	const d = getDict(lang);
	const mainProject = getProjects()[0];

	let posts: Post[] = [];
	try {
		posts = await client.fetch<Post[]>(postsQuery, {}, { next: { revalidate: 3600 } });
	} catch {
		// The CMS being down cannot take the page with it.
		posts = [];
	}

	const companies = CompaniesSchema.parse(experienceItems);
	const projects = WorkProjectsSchema.parse(workProjects);
	const recommendationList = RecommendationsSchema.parse(recommendations);
	const certificationList = CertificationsSchema.parse(certifications);
	const languageItems = LanguageItemsSchema.parse(languages);

	const counts = {
		companiesCount: `${companies.length} ${d.ui.companies}`,
		projectsCount: `${projects.length} ${d.ui.projects}`,
		postsCount: `${posts.length} ${d.ui.notes}`,
		recommendationsCount: `${recommendationList.length} ${d.ui.people}`,
	};

	// The brain seeds one mark per item, so these are the numbers behind the
	// tissue — the same ones the sections below the fold render. Career
	// counts both lists it shows: the companies and the projects built at
	// them. Contact has no list of its own; see sections.ts.
	const evidence = {
		career: companies.length + projects.length,
		project: stagesWritten(mainProject),
		recommendations: recommendationList.length,
		blog: posts.length,
		cv: certificationList.length,
	};

	return {
		d,
		mainProject,
		posts,
		companies,
		projects,
		recommendationList,
		certificationList,
		languageItems,
		counts,
		evidence,
		sections: buildSections(d, mainProject, counts, evidence),
	};
});
