import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { localizedPath, t, type Language } from "../../../../../entities/i18n";
import { toJsonLdScript } from "../../../../../entities/jsonLd";
import { SITE_URL } from "../../../../../entities/site";
import OpenProject from "../../../../src/common/OpenProject";
import { STATUS_LABEL, getProject, getProjects } from "../../../../src/common/projects";
import ReadingProgress from "../../../../src/components/Blog/ReadingProgress";
import { getDict, type Dict } from "../../../../src/i18n/dict";
import { alternates } from "../../../../src/i18n/meta";
import NorteArFigura from "../../../../src/sections/NorteArFigura";
import TissuePreload from "../../../../src/common/TissuePreload";

/**
 * A project's full case, on its own URL.
 *
 * The six beats used to live only inside the home's step 2: an anchor
 * inside another page, competing with Career, Recommendations, Blog and
 * Contact for a single indexable URL. NorteAR is the site's most
 * substantial content and couldn't be shared or ranked separately.
 *
 * Unlike the blog, this is actually translated (projects.json has es and
 * en for every beat), so it declares hreflang for both languages.
 */

type Params = { params: Promise<{ lang: Language; slug: string }> };

// Only projects that exist: any other slug is a 404 at build time, not an
// empty page rendered on demand.
export const dynamicParams = false;

export const generateStaticParams = () =>
	getProjects().map((project) => ({ slug: project.slug }));

const projectPath = (slug: string) => `/projects/${slug}`;

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
	const { lang, slug } = await params;
	const project = getProject(slug);
	if (!project) return {};

	const title = `${project.name} — Joaquín Mussi`;
	const description = t(project.summary, lang);

	return {
		title,
		description,
		alternates: alternates(lang, projectPath(slug)),
		// openGraph gets replaced whole, not merged with the layout's: that's
		// why siteName and locale are repeated here.
		openGraph: {
			type: "article",
			url: `${SITE_URL}${localizedPath(lang, projectPath(slug))}`,
			title,
			description,
			siteName: "Joaquín Mussi Portfolio",
			locale: lang === "es" ? "es_AR" : "en_US",
		},
		twitter: { card: "summary_large_image", title, description },
	};
};

/**
 * Per-project visual evidence. There's only one today; a map instead of an
 * `if` so a second project doesn't force touching this page.
 */
const EVIDENCE: Record<string, (d: Dict) => ReactNode> = {
	nortear: (d) => <NorteArFigura d={d} />,
};

const ProjectPage = async ({ params }: Params) => {
	const { lang, slug } = await params;
	const project = getProject(slug);
	if (!project) notFound();

	const d = getDict(lang);
	const url = `${SITE_URL}${localizedPath(lang, projectPath(slug))}`;
	const home = localizedPath(lang, "/");
	const productSite = project.links.find((e) => e.external)?.href;

	// A WebPage whose topic is the software, not a bare SoftwareApplication:
	// the page is the case as told by whoever built it, not the product's
	// spec sheet. No rating, price or operating system — there's no real
	// source for any of those, and a made-up schema is worse than an
	// incomplete one.
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: `${project.name} — Joaquín Mussi`,
		url,
		inLanguage: lang,
		description: t(project.summary, lang),
		author: { "@type": "Person", name: "Joaquín Mussi", url: SITE_URL },
		about: {
			"@type": "SoftwareApplication",
			name: project.name,
			applicationCategory: "BusinessApplication",
			description: t(project.summary, lang),
			...(productSite && { url: productSite }),
		},
	};

	const breadcrumb = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Joaquín Mussi", item: `${SITE_URL}${home}` },
			{ "@type": "ListItem", position: 2, name: project.name, item: url },
		],
	};

	return (
		<main className='min-h-screen px-5 py-12 md:px-16 md:py-16'>
			<TissuePreload />
			<ReadingProgress targetId='caso' />
			{/* Right-hand column, the same rhythm the home's steps use: the
			 * left half belongs to the tissue, where the decision trace runs.
			 * Centred, the column sat on top of the brain and the trace had
			 * nowhere to be seen. */}
			<div className='ml-auto flex w-full max-w-[42rem] flex-col gap-8 md:w-[56%]'>
				<div className='enter enter-1 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-synapse/20 pb-4'>
					{/* Goes back to the step it came from, not to the top of the home. */}
					<Link
						href={`${home}#step-2`}
						className='inline-flex min-h-11 w-fit items-center gap-2 font-label text-xs font-semibold uppercase tracking-[.12em] text-synapse transition-colors duration-200 ease-impulse hover:text-impulse'
					>
						<span aria-hidden='true'>←</span>
						{d.projects.backToHome}
					</Link>
					<Link
						href={home}
						className='inline-flex min-h-11 items-center font-mono text-[10px] uppercase tracking-[.18em] text-myelin transition-colors duration-200 ease-impulse hover:text-impulse'
					>
						Joaquín Mussi
					</Link>
				</div>

				<article id='caso' className='enter enter-2 flex flex-col gap-8'>
					<script
						type='application/ld+json'
						dangerouslySetInnerHTML={{ __html: toJsonLdScript(jsonLd) }}
					/>
					<script
						type='application/ld+json'
						dangerouslySetInnerHTML={{ __html: toJsonLdScript(breadcrumb) }}
					/>

					<header className='flex flex-col gap-3'>
						<h1 className='m-0 text-4xl leading-[.95] md:text-6xl'>{project.name}</h1>
						<p className='m-0 font-gloss text-xl italic leading-none text-myelin'>
							{t(project.context, lang)}
						</p>
						<p className='m-0 font-mono text-[10px] uppercase tracking-[.16em] text-synapse'>
							{STATUS_LABEL[project.status][lang]} · {project.stack.join(" · ")}
						</p>
						<p className='m-0 mt-3 max-w-[30ch] font-gloss text-[clamp(1.5rem,3.4vw,2.25rem)] italic leading-[1.15] text-signal'>
							{t(project.summary, lang)}
						</p>
						{project.links.length > 0 && (
							<div className='mt-2 flex flex-wrap items-center gap-x-6 gap-y-2'>
								{project.links.map((e) => (
									<a
										key={e.href}
										href={e.href}
										target={e.external ? "_blank" : undefined}
										rel={e.external ? "noreferrer" : undefined}
										className='inline-flex min-h-11 items-center font-label text-[11px] font-bold uppercase tracking-[.14em] text-impulse transition-colors duration-200 ease-impulse hover:text-signal'
									>
										<span className='border-b border-current pb-0.5'>
											{t(e.label, lang)}
										</span>
									</a>
								))}
							</div>
						)}
					</header>

					{EVIDENCE[project.slug]?.(d)}

					<section aria-labelledby='six-beats' className='flex flex-col gap-4'>
						<h2 id='six-beats' className='m-0 text-xl md:text-2xl'>
							{d.projects.sixBeats}
						</h2>
						<OpenProject
							project={project}
							lang={lang}
							unwritten={d.projects.notWritten}
							unmeasured={d.projects.notMeasured}
							pendingLabel={d.missing}
							diagramLabel={d.projects.diagram}
							scrollHint={d.projects.scrollHint}
							codeLabel={d.projects.code}
						/>
					</section>
				</article>
			</div>
		</main>
	);
};

export default ProjectPage;
