import type { Metadata } from "next";

import { type Language } from "../../../entities/i18n";
import {
	CertificationsSchema,
	CompaniesSchema,
	DescartesSchema,
	LanguageItemsSchema,
	RecommendationsSchema,
	WorkProjectsSchema,
} from "../../../entities/schemas";
import { alternates } from "../../src/i18n/meta";
import { getDict } from "../../src/i18n/dict";
import { client } from "../../../sanity/lib/client";
import { postsQuery } from "../../../sanity/lib/queries";

import certifications from "../../../api/certifications.json";
import experienceItems from "../../../api/experienceItems.json";
import languages from "../../../api/languages.json";
import discardedDataRaw from "../../../api/descartes.json";
import recommendations from "../../../api/recommendations.json";
import workProjects from "../../../api/workProjects.json";
import { getProjects } from "../../src/common/projects";
import { buildSections } from "../../src/common/sections";
import NervousSystem from "../../src/common/NervousSystem";
import HeroSection from "../../src/sections/HeroSection";
import TrayectoriaSection from "../../src/sections/TrayectoriaSection";
import NorteArSection from "../../src/sections/NorteArSection";
import RecomendacionesSection from "../../src/sections/RecomendacionesSection";
import BlogSection, { type Post } from "../../src/sections/BlogSection";
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
	const d = getDict(lang);

	const mainProject = getProjects()[0];
	let posts: Post[] = [];
	try {
		posts = await client.fetch<Post[]>(
			postsQuery,
			{},
			{ next: { revalidate: 3600 } },
		);
	} catch {
		posts = [];
	}
	const companies = CompaniesSchema.parse(experienceItems);
	const projects = WorkProjectsSchema.parse(workProjects);
	const recommendationList = RecommendationsSchema.parse(recommendations);
	const certificationList = CertificationsSchema.parse(certifications);
	const languageItems = LanguageItemsSchema.parse(languages);

	const companiesCount = `${companies.length} ${d.ui.empresas}`;
	const projectsCount = `${projects.length} ${d.ui.proyectos}`;
	const postsCount = `${posts.length} ${d.ui.notas}`;
	const recommendationsCount = `${recommendationList.length} ${d.ui.personas}`;

	const sections = buildSections(d, mainProject, {
		companiesCount,
		projectsCount,
		postsCount,
		recommendationsCount,
	});

	return (
		<main className='sistema'>
			<NervousSystem
				sections={sections}
				loadingText={d.hero.cargando}
				activityText={d.hero.actividad}
				openText={d.hero.abrir}
				backText={d.hero.volver}
				stepsLabel={d.hero.pasos}
				scrollHintText={d.hero.bajar}
				navLabel={d.hero.navegacion}
				connectedLabel={d.hero.conectadoCon}
			>
				<HeroSection d={d} lang={lang} sections={sections} />

				<TrayectoriaSection
					d={d}
					lang={lang}
					companies={companies}
					projects={projects}
					certificationList={certificationList}
					languageItems={languageItems}
					companiesCount={companiesCount}
					projectsCount={projectsCount}
				/>

				<NorteArSection d={d} lang={lang} mainProject={mainProject} />

				<RecomendacionesSection
					d={d}
					lang={lang}
					recommendationList={recommendationList}
					recommendationsCount={recommendationsCount}
				/>

				<BlogSection d={d} lang={lang} posts={posts} postsCount={postsCount} />

				<ContactoSection d={d} lang={lang} discardedData={discardedData} />

				<footer className='pointer-events-none px-5 pb-16 md:px-10 lg:px-16'>
					<div
						data-revelar
						className='pointer-events-auto ml-auto flex w-full max-w-[42rem] flex-wrap items-end justify-between gap-6 border-t border-sinapsis/30 pt-5 font-pieza text-xs text-mielina md:w-[54%]'>
						<span>Joaquín Mussi · 2026</span>
					</div>
				</footer>
			</NervousSystem>
		</main>
	);
};

export default HomePage;
