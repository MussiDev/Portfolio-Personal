import type { Metadata } from "next";

import { localizedPath, type Language } from "../../../entities/i18n";
import { toJsonLdScript } from "../../../entities/jsonLd";
import { PERSON_ID, SITE_URL } from "../../../entities/site";
import { DescartesSchema } from "../../../entities/schemas";
import { alternates } from "../../src/i18n/meta";
import { getDict } from "../../src/i18n/dict";

import discardedDataRaw from "../../../api/descartes.json";
import TissuePreload from "../../src/common/TissuePreload";
import { getSiteData } from "../../src/common/siteData";
import HeroSection from "../../src/sections/HeroSection";
import TrayectoriaSection from "../../src/sections/TrayectoriaSection";
import NorteArSection from "../../src/sections/NorteArSection";
import RecomendacionesSection from "../../src/sections/RecomendacionesSection";
import BlogSection from "../../src/sections/BlogSection";
import ContactoSection from "../../src/sections/ContactoSection";

export const generateMetadata = async ({
	params,
}: {
	params: Promise<{ lang: Language }>;
}): Promise<Metadata> => {
	const { lang } = await params;
	const d = getDict(lang);

	return {
		title: "Joaquín Mussi — Frontend Engineer",
		description: d.presentacion,
		alternates: alternates(lang, "/"),
	};
};

const discardedData = DescartesSchema.parse(discardedDataRaw);

const HomePage = async ({ params }: { params: Promise<{ lang: Language }> }) => {
	const { lang } = await params;
	const {
		d,
		mainProject,
		posts,
		companies,
		projects,
		recommendationList,
		certificationList,
		languageItems,
		counts,
		sections,
	} = await getSiteData(lang);

	// The home is a profile page: its main entity is the Person declared in
	// the layout, referenced by @id instead of repeated.
	const homePath = localizedPath(lang, "/");
	const profilePage = {
		"@context": "https://schema.org",
		"@type": "ProfilePage",
		// Same form as the canonical: no trailing slash on the root.
		url: homePath === "/" ? SITE_URL : `${SITE_URL}${homePath}`,
		inLanguage: lang,
		mainEntity: { "@id": PERSON_ID },
	};

	return (
		<main>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: toJsonLdScript(profilePage) }}
			/>
			<TissuePreload />
			<HeroSection d={d} lang={lang} sections={sections} />

			<TrayectoriaSection
				d={d}
				lang={lang}
				companies={companies}
				projects={projects}
				certificationList={certificationList}
				languageItems={languageItems}
				companiesCount={counts.companiesCount}
				projectsCount={counts.projectsCount}
			/>

			<NorteArSection d={d} lang={lang} mainProject={mainProject} />

			<RecomendacionesSection
				d={d}
				lang={lang}
				recommendationList={recommendationList}
				recommendationsCount={counts.recommendationsCount}
			/>

			<BlogSection d={d} lang={lang} posts={posts} postsCount={counts.postsCount} />

			<ContactoSection d={d} lang={lang} discardedData={discardedData} />

			<footer className='pointer-events-none px-5 pb-16 md:px-10 lg:px-16'>
				<div
					data-revelar
					className='pointer-events-auto ml-auto flex w-full max-w-[42rem] flex-wrap items-end justify-between gap-6 border-t border-sinapsis/30 pt-5 font-pieza text-xs text-mielina md:w-[54%]'>
					<span>Joaquín Mussi · 2026</span>
				</div>
			</footer>
		</main>
	);
};

export default HomePage;
