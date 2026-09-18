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

/**
 * El caso completo de un proyecto, en su propia URL.
 *
 * Antes los seis tiempos vivían solo dentro del paso 2 de la home: un ancla
 * dentro de otra página, compitiendo con Trayectoria, Recomendaciones, Blog
 * y Contacto por una única URL indexable. NorteAR es el contenido con más
 * sustancia del sitio y no se podía compartir ni rankear por separado.
 *
 * A diferencia del blog, esto sí está traducido de verdad (projects.json
 * tiene es y en en cada tiempo), así que declara hreflang a los dos idiomas.
 */

type Params = { params: Promise<{ lang: Language; slug: string }> };

// Solo los proyectos que existen: cualquier otro slug es 404 en build, no
// una página vacía renderizada bajo demanda.
export const dynamicParams = false;

export const generateStaticParams = () =>
	getProjects().map((project) => ({ slug: project.slug }));

const pathDe = (slug: string) => `/proyectos/${slug}`;

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
	const { lang, slug } = await params;
	const project = getProject(slug);
	if (!project) return {};

	const title = `${project.nombre} — Joaquín Mussi`;
	const description = t(project.resumen, lang);

	return {
		title,
		description,
		alternates: alternates(lang, pathDe(slug)),
		// openGraph se reemplaza entero, no se mezcla con el del layout: por
		// eso vuelven a ir siteName y locale.
		openGraph: {
			type: "article",
			url: `${SITE_URL}${localizedPath(lang, pathDe(slug))}`,
			title,
			description,
			siteName: "Joaquín Mussi Portfolio",
			locale: lang === "es" ? "es_AR" : "en_US",
		},
		twitter: { card: "summary_large_image", title, description },
	};
};

/**
 * Evidencia visual por proyecto. Hoy hay uno solo; un mapa y no un `if`
 * para que el segundo proyecto no obligue a tocar la página.
 */
const EVIDENCIA: Record<string, (d: Dict) => ReactNode> = {
	nortear: (d) => <NorteArFigura d={d} />,
};

const ProyectoPage = async ({ params }: Params) => {
	const { lang, slug } = await params;
	const project = getProject(slug);
	if (!project) notFound();

	const d = getDict(lang);
	const url = `${SITE_URL}${localizedPath(lang, pathDe(slug))}`;
	const inicio = localizedPath(lang, "/");
	const sitioDelProducto = project.enlaces.find((e) => e.externo)?.href;

	// Una WebPage cuyo tema es el software, no un SoftwareApplication a secas:
	// la página es el caso contado por quien lo construye, no la ficha del
	// producto. Sin rating, precio ni sistema operativo — no hay fuente real
	// para ninguno, y un schema inventado es peor que uno incompleto.
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: `${project.nombre} — Joaquín Mussi`,
		url,
		inLanguage: lang,
		description: t(project.resumen, lang),
		author: { "@type": "Person", name: "Joaquín Mussi", url: SITE_URL },
		about: {
			"@type": "SoftwareApplication",
			name: project.nombre,
			applicationCategory: "BusinessApplication",
			description: t(project.resumen, lang),
			...(sitioDelProducto && { url: sitioDelProducto }),
		},
	};

	const breadcrumb = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Joaquín Mussi", item: `${SITE_URL}${inicio}` },
			{ "@type": "ListItem", position: 2, name: project.nombre, item: url },
		],
	};

	return (
		<main className='sistema min-h-screen px-5 py-12 md:px-16 md:py-16'>
			<ReadingProgress targetId='caso' />
			<div className='mx-auto flex max-w-[760px] flex-col gap-8'>
				<div className='entra entra-1 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-sinapsis/20 pb-4'>
					{/* Vuelve al paso de donde se viene, no al tope de la home. */}
					<Link
						href={`${inicio}#paso-2`}
						className='inline-flex min-h-11 w-fit items-center gap-2 font-rotulo text-xs font-semibold uppercase tracking-[.12em] text-sinapsis transition-colors duration-200 ease-impulso hover:text-impulso'
					>
						<span aria-hidden='true'>←</span>
						{d.proyectos.volver}
					</Link>
					<Link
						href={inicio}
						className='inline-flex min-h-11 items-center font-pieza text-[10px] uppercase tracking-[.18em] text-mielina transition-colors duration-200 ease-impulso hover:text-impulso'
					>
						Joaquín Mussi
					</Link>
				</div>

				<article id='caso' className='entra entra-2 flex flex-col gap-8'>
					<script
						type='application/ld+json'
						dangerouslySetInnerHTML={{ __html: toJsonLdScript(jsonLd) }}
					/>
					<script
						type='application/ld+json'
						dangerouslySetInnerHTML={{ __html: toJsonLdScript(breadcrumb) }}
					/>

					<header className='flex flex-col gap-3'>
						<h1 className='m-0 text-4xl leading-[.95] md:text-6xl'>{project.nombre}</h1>
						<p className='m-0 font-glosa text-xl italic leading-none text-mielina'>
							{t(project.contexto, lang)}
						</p>
						<p className='m-0 font-pieza text-[10px] uppercase tracking-[.16em] text-sinapsis'>
							{STATUS_LABEL[project.estado][lang]} · {project.stack.join(" · ")}
						</p>
						<p className='m-0 mt-3 max-w-[30ch] font-glosa text-[clamp(1.5rem,3.4vw,2.25rem)] italic leading-[1.15] text-senal'>
							{t(project.resumen, lang)}
						</p>
						{project.enlaces.length > 0 && (
							<div className='mt-2 flex flex-wrap items-center gap-x-6 gap-y-2'>
								{project.enlaces.map((e) => (
									<a
										key={e.href}
										href={e.href}
										target={e.externo ? "_blank" : undefined}
										rel={e.externo ? "noreferrer" : undefined}
										className='inline-flex min-h-11 items-center font-rotulo text-[11px] font-bold uppercase tracking-[.14em] text-impulso transition-colors duration-200 ease-impulso hover:text-senal'
									>
										<span className='border-b border-current pb-0.5'>
											{t(e.etiqueta, lang)} ↗
										</span>
									</a>
								))}
							</div>
						)}
					</header>

					{EVIDENCIA[project.slug]?.(d)}

					<section aria-labelledby='seis-tiempos' className='flex flex-col gap-4'>
						<h2 id='seis-tiempos' className='m-0 text-xl md:text-2xl'>
							{d.proyectos.enSeisTiempos}
						</h2>
						<OpenProject
							project={project}
							lang={lang}
							unwritten={d.proyectos.sinEscribir}
							unmeasured={d.proyectos.sinMedir}
							pendingLabel={d.falta}
							diagramLabel={d.proyectos.diagrama}
							scrollHint={d.proyectos.deslizar}
							codeLabel={d.proyectos.codigo}
						/>
					</section>
				</article>
			</div>
		</main>
	);
};

export default ProyectoPage;
