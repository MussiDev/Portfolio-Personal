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
import LanguageSwitch from "../../src/common/LanguageSwitch";
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
import { getProjects, stagesWritten } from "../../src/common/projects";
import NervousSystem from "../../src/common/NervousSystem";
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

	// Conexiones reales, no decorativas: NorteAR usa el mismo stack que
	// aparece en Trayectoria, y las recomendaciones son de gente de esos
	// mismos trabajos. Blog no conecta con nada — ningún post menciona el
	// proyecto ni la trayectoria, así que no se inventa una relación ahí.
	const sections = [
		{
			label: d.sobreMi.trayectoria,
			fact: `${companiesCount} · ${projectsCount}`,
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
		},
		{
			label: d.campos.recomendaciones,
			fact: recommendationsCount,
			summary: d.hero.secciones.recomendaciones,
			href: "#paso-3",
			step: 3,
			related: [0],
		},
		{
			label: d.nav.blog,
			fact: postsCount,
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
				<section
					id='paso-0'
					data-step={0}
					className='pointer-events-none relative h-[100svh] min-h-[34rem]'
				>
					<div className='pointer-events-none absolute left-0 right-0 top-0 flex items-start justify-between gap-4 px-5 pt-6 md:px-10 md:pt-9'>
						<div className='min-w-0'>
							<h1 className='entra entra-1 m-0 text-2xl leading-none text-senal sm:text-3xl'>
								Joaquín Mussi
							</h1>
							<p className='entra entra-2 m-0 mt-2.5 max-w-[46ch] font-pieza text-[10.5px] uppercase leading-relaxed tracking-[.16em] text-sinapsis'>
								{d.hero.rol}
							</p>
						</div>
						<div className='entra entra-1 pointer-events-auto shrink-0 font-pieza text-xs text-mielina'>
							<LanguageSwitch current={lang} />
						</div>
					</div>

					<nav className='entra entra-3 pointer-events-auto absolute bottom-0 left-0 right-0 flex flex-col gap-px border-t border-sinapsis/25 bg-tejido/85 backdrop-blur-sm md:hidden'>
						{sections.map((s, i) => (
							<a
								key={s.href + s.label}
								href={s.external ? s.href : `#paso-${s.step}`}
								target={s.external ? "_blank" : undefined}
								rel={s.external ? "noreferrer" : undefined}
								className='flex flex-wrap items-baseline gap-x-3 border-b border-sinapsis/12 px-5 py-2.5 last:border-b-0'
							>
								<span className='font-pieza text-[10px] tabular-nums text-impulso'>
									{String(i + 1).padStart(2, "0")}
								</span>
								<span className='font-rotulo text-[13px] font-bold uppercase tracking-[.08em] text-senal'>
									{s.label}
									{s.external && " ↗"}
								</span>
								<span className='ml-auto font-pieza text-[9.5px] uppercase tracking-[.08em] text-mielina'>
									{s.fact}
								</span>
							</a>
						))}
					</nav>
				</section>

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
