import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { t, type Language, type LocalizedText } from "../../../entities/i18n";
import { localizedPath } from "../../../entities/i18n";
import LanguageSwitch from "../../src/common/LanguageSwitch";
import { alternates } from "../../src/i18n/meta";
import { getDict } from "../../src/i18n/dict";
import { client } from "../../../sanity/lib/client";
import { postsQuery } from "../../../sanity/lib/queries";

import certifications from "../../../api/certifications.json";
import experienceItems from "../../../api/experienceItems.json";
import languages from "../../../api/languages.json";
import discardedData from "../../../api/descartes.json";
import recommendations from "../../../api/recommendations.json";
import workProjects from "../../../api/workProjects.json";
import { STATUS_LABEL, getProjects, stagesWritten } from "../../src/common/projects";
import OpenProject from "../../src/common/OpenProject";
import NervousSystem from "../../src/common/NervousSystem";
import ContactForm from "../../src/components/Workshop/ContactForm";

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

type Post = {
	_id: string;
	title: string;
	slug: string;
	publishedAt: string;
	tags?: string[];
};
type Role = {
	position: string;
	time: string;
	description: Record<string, string>;
	highlights?: Record<string, string[]>;
};
type Company = {
	company: string;
	totalTime?: string;
	time?: string;
	position?: string;
	description?: Record<string, string>;
	roles?: Role[];
};

const normalize = (e: Company): { period: string; roles: Role[] } => ({
	period: e.totalTime ?? e.time ?? "",
	roles: e.roles ?? [
		{
			position: e.position ?? "",
			time: e.time ?? "",
			description: e.description ?? {},
		},
	],
});
type Project = {
	id: number;
	name: string;
	company: string;
	period: string;
	description: string;
	skills: string[];
};
type Recommendation = {
	id: number;
	name: string;
	role: string;
	relation: LocalizedText;
	date: string;
	text: LocalizedText;
};
type Certification = {
	id: number;
	platform: string;
	name: string;
	date: string;
};
type LanguageItem = { id: number; nombre: LocalizedText; nivel: LocalizedText };

const STACK = [
	"Next.js",
	"React",
	"TypeScript",
	"Arquitectura frontend",
	"Performance",
	"APIs .NET",
	"Clean Architecture",
];

const Step = ({
	n,
	title,
	gloss,
	fact,
	wide,
	children,
}: {
	n: number;
	title: string;
	gloss?: string;
	fact?: string;
	wide?: boolean;
	children: ReactNode;
}) => (
	<section
		id={`paso-${n}`}
		data-step={n}
		className='pointer-events-none flex min-h-[100svh] items-center px-5 py-16 md:px-10 md:py-24 lg:px-16'
	>
		<div
			data-revelar
			className={`pointer-events-auto ml-auto w-full ${
				wide ? "max-w-[68rem] md:w-[86%]" : "max-w-[42rem] md:w-[54%]"
			}`}
		>
			<header className='mb-7 flex items-start gap-3 sm:gap-4 md:mb-9'>
				<span
					data-drop-target
					aria-hidden='true'
					className='mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-[3px] sm:h-9 sm:w-9 border border-impulso/45 bg-impulso/5 font-pieza text-[11px] tabular-nums text-impulso shadow-[0_0_18px_-4px_rgb(255_106_58/.55)]'
				>
					{String(n).padStart(2, "0")}
				</span>
				<div className='flex min-w-0 flex-col gap-1.5'>
					<h2 className='m-0 text-2xl leading-[.95] [overflow-wrap:anywhere] hyphens-auto sm:text-3xl md:text-4xl'>
						{title}
					</h2>
					{gloss && (
						<span className='font-glosa text-lg italic leading-none text-mielina'>
							{gloss}
						</span>
					)}
					{fact && (
						<span className='mt-1 font-pieza text-[10px] uppercase tracking-[.16em] text-sinapsis'>
							{fact}
						</span>
					)}
				</div>
			</header>
			{children}
		</div>
	</section>
);

const Card = ({ children }: { children: ReactNode }) => (
	<div className='membrana flex flex-col gap-3 px-6 py-5'>{children}</div>
);

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
	const companies = experienceItems as Company[];
	const projects = workProjects as Project[];
	const recommendationList = recommendations as Recommendation[];
	const certificationList = certifications as Certification[];
	const languageItems = languages as LanguageItem[];

	const companiesCount = `${companies.length} ${d.ui.empresas}`;
	const projectsCount = `${projects.length} ${d.ui.proyectos}`;
	const postsCount = `${posts.length} ${d.ui.notas}`;
	const recommendationsCount = `${recommendationList.length} ${d.ui.personas}`;

	const sections = [
		{
			label: d.sobreMi.trayectoria,
			fact: `${companiesCount} · ${projectsCount}`,
			summary: d.hero.secciones.experiencia,
			href: "#paso-1",
			step: 1,
		},
		{
			label: mainProject.nombre,
			fact: `${stagesWritten(mainProject)} / 6 ${d.ui.tiempos}`,
			summary: d.hero.secciones.proyectos,
			href: "#paso-2",
			step: 2,
		},
		{
			label: d.campos.recomendaciones,
			fact: recommendationsCount,
			summary: d.hero.secciones.recomendaciones,
			href: "#paso-3",
			step: 3,
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

	const links: [string, string, boolean][] = [
		["GitHub", "https://github.com/MussiDev", true],
		["LinkedIn", "https://www.linkedin.com/in/joaquinmussi/", true],
		["Email", "mailto:joakoomussi@gmail.com", false],
		[d.nav.cv, "/pdf.pdf", true],
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

				<Step
					n={1}
					title={d.sobreMi.trayectoria}
					gloss={d.sobreMi.trayectoriaGlosa}
					fact={`${companiesCount} · ${projectsCount} · ${certificationList.length} ${d.ui.cursos}`}
				>
					<div className='flex flex-col gap-4'>
						<div className='relative flex flex-col gap-6 border-l-2 border-sinapsis/25 pl-6 sm:pl-8'>
							{companies.map((e) => {
								const { period, roles } = normalize(e);
								return (
									<div key={e.company} className='relative'>
										<span
											aria-hidden='true'
											className='absolute -left-[calc(1.5rem+5px)] top-1.5 h-[9px] w-[9px] rounded-full bg-impulso shadow-[0_0_0_3px_rgb(5_7_13)] sm:-left-[calc(2rem+5px)]'
										/>
										<Card>
											<div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-sinapsis/20 pb-3'>
												<h3 className='m-0 text-lg md:text-xl'>{e.company}</h3>
												<span className='font-pieza text-[10px] uppercase tracking-[.12em] text-sinapsis'>
													{period}
												</span>
											</div>
											{roles.map((r) => (
												<div
													key={r.position + r.time}
													className='flex flex-col gap-1.5'
												>
													<div className='flex flex-wrap items-baseline gap-x-3'>
														<h4 className='m-0 text-sm text-impulso'>
															{r.position}
														</h4>
														<span className='font-pieza text-[10px] tabular-nums text-mielina'>
															{r.time}
														</span>
													</div>
													<p className='m-0 font-nota text-[14px] leading-relaxed text-mielina'>
														{r.description[lang] ?? r.description.es}
													</p>
													{r.highlights && (
														<ul className='m-0 flex list-none flex-col gap-1 pl-0'>
															{(r.highlights[lang] ?? r.highlights.es).map((h) => (
																<li
																	key={h}
																	className='flex gap-2 font-nota text-[14px] leading-relaxed text-mielina'
																>
																	<span aria-hidden='true' className='text-impulso'>
																		·
																	</span>
																	{h}
																</li>
															))}
														</ul>
													)}
												</div>
											))}
										</Card>
									</div>
								);
							})}
						</div>

						<details className='vermas membrana flex flex-col-reverse'>
							<summary className='flex cursor-pointer list-none items-center gap-3 border-t border-sinapsis/20 px-6 py-3 font-rotulo text-[11px] font-semibold uppercase tracking-[.14em] text-sinapsis transition-colors duration-200 ease-impulso hover:text-impulso'>
				<span className='mas'>{d.ui.verProyectos(projects.length)}</span>
								<span className='menos'>{d.ui.verMenos}</span>
							</summary>
							<div className='flex flex-col'>
								{projects.map((p, i) => (
									<div
										key={p.id}
										className='grid grid-cols-[2rem_1fr] gap-x-4 gap-y-1 border-b border-sinapsis/15 px-6 py-3.5 last:border-b-0'
									>
										<span className='font-pieza text-[11px] tabular-nums text-sinapsis'>
											{String(i + 1).padStart(2, "0")}
										</span>
										<div className='flex flex-col gap-1'>
											<div className='flex flex-wrap items-baseline gap-x-3'>
												<h4 className='m-0 text-sm'>{p.name}</h4>
												<span className='font-pieza text-[10px] text-mielina'>
													{p.company} · {p.period}
												</span>
											</div>
											<p className='m-0 font-nota text-[13px] leading-relaxed text-mielina'>
												{p.description}
											</p>
											<p className='m-0 font-pieza text-[10px] text-sinapsis'>
												{p.skills.join(" · ")}
											</p>
										</div>
									</div>
								))}
							</div>
						</details>

						<Card>
							<div className='grid gap-x-10 gap-y-5 sm:grid-cols-[1.6fr_1fr]'>
								<div className='flex flex-col gap-3'>
									<h4 className='m-0 font-rotulo text-[9px] uppercase tracking-[.16em] text-mielina'>
										{d.sobreMi.titulo}
									</h4>
									{d.sobreMi.bio.map((p) => (
										<p
											key={p.slice(0, 40)}
											className='m-0 max-w-[52ch] font-nota text-[13px] leading-relaxed text-mielina'
										>
											{p}
										</p>
									))}
								</div>
								<div className='flex flex-col gap-2'>
									<h4 className='m-0 font-rotulo text-[9px] uppercase tracking-[.16em] text-mielina'>
										{d.campos.idiomas}
									</h4>
									{languageItems.map((i) => (
										<div
											key={i.id}
											className='flex items-baseline justify-between gap-3 border-b border-sinapsis/15 pb-1 last:border-b-0'
										>
											<span className='font-nota text-[13px] text-senal'>
												{t(i.nombre, lang)}
											</span>
											<span className='font-pieza text-[10px] text-mielina'>
												{t(i.nivel, lang)}
											</span>
										</div>
									))}
								</div>
							</div>
						</Card>

						<details className='vermas membrana flex flex-col-reverse'>
							<summary className='flex cursor-pointer list-none items-center gap-3 border-t border-sinapsis/20 px-6 py-3 font-rotulo text-[11px] font-semibold uppercase tracking-[.14em] text-sinapsis transition-colors duration-200 ease-impulso hover:text-impulso'>
							<span className='mas'>
									{d.sobreMi.credenciales} · {certificationList.length}
								</span>
								<span className='menos'>{d.ui.verMenos}</span>
							</summary>
							<ul className='m-0 flex list-none flex-col p-0'>
								{certificationList.map((c) => (
									<li
										key={c.id}
										className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-sinapsis/15 px-6 py-2 last:border-b-0'
									>
										<span className='font-nota text-[13px] text-senal'>
											{c.name}
										</span>
										<span className='font-pieza text-[10px] text-mielina'>
											{c.platform} · {c.date}
										</span>
									</li>
								))}
							</ul>
						</details>
					</div>
				</Step>

				<Step
					n={2}
					wide
					title={mainProject.nombre}
					gloss={t(mainProject.contexto, lang)}
					fact={`${STATUS_LABEL[mainProject.estado][lang]} · ${mainProject.stack.join(" · ")}`}
				>
					<div className='grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-start'>
					<div className='flex flex-col gap-4'>
						<p className='m-0 font-glosa text-2xl italic leading-snug text-senal'>
							{t(mainProject.resumen, lang)}
						</p>

						<div className='flex flex-wrap items-center gap-x-6 gap-y-2 lg:hidden'>
							{mainProject.enlaces?.map((e) => (
								<a
									key={e.href}
									href={e.href}
									target={e.externo ? "_blank" : undefined}
									rel={e.externo ? "noreferrer" : undefined}
									className='border-b border-impulso pb-0.5 font-rotulo text-[11px] font-bold uppercase tracking-[.14em] text-impulso transition-colors duration-200 ease-impulso hover:text-senal'
								>
									{t(e.etiqueta, lang)} ↗
								</a>
							))}
						</div>

						<OpenProject
							project={mainProject}
							lang={lang}
							unwritten={d.proyectos.sinEscribir}
							unmeasured={d.proyectos.sinMedir}
							pendingLabel={d.falta}
						/>

						<div className='hidden flex-wrap items-center gap-x-6 gap-y-2 lg:flex'>
							{mainProject.enlaces?.map((e) => (
								<a
									key={e.href}
									href={e.href}
									target={e.externo ? "_blank" : undefined}
									rel={e.externo ? "noreferrer" : undefined}
									className='border-b border-impulso pb-0.5 font-rotulo text-[11px] font-bold uppercase tracking-[.14em] text-impulso transition-colors duration-200 ease-impulso hover:text-senal'
								>
									{t(e.etiqueta, lang)} ↗
								</a>
							))}
						</div>
					</div>

					<div className='flex flex-col gap-4'>
						<figure className='membrana m-0 flex flex-col gap-0 overflow-hidden p-1.5'>
						<Image
								src='/image/nortear/margen.jpg'
								alt={d.ui.altMargen}
								width={1337}
								height={151}
								sizes='(max-width: 768px) 100vw, 42rem'
								className='h-auto w-full rounded-[2px]'
							/>
							<figcaption className='flex flex-wrap items-baseline gap-x-3 px-4 pb-3 pt-3 font-pieza text-[10px] uppercase tracking-[.12em] text-mielina'>
								<span className='text-impulso'>{d.ui.margenDelDia}</span>
								<span>{d.ui.formulaMargen}</span>
							</figcaption>

							<details className='tiempo border-t border-sinapsis/15'>
								<summary className='flex cursor-pointer list-none items-center gap-3 px-4 py-2.5 font-rotulo text-[10px] font-semibold uppercase tracking-[.14em] text-sinapsis transition-colors duration-200 ease-impulso hover:text-impulso'>
									{d.ui.verPanelCompleto}
									<span className='marcador font-pieza text-[11px]' />
								</summary>
								<Image
									src='/image/nortear/dashboard.jpg'
									alt={d.ui.altPanel}
									width={1568}
									height={703}
									sizes='(max-width: 768px) 100vw, 42rem'
									className='h-auto w-full rounded-[2px]'
								/>
							</details>
						</figure>
					</div>
					</div>
				</Step>

				<Step
					n={3}
					title={d.campos.recomendaciones}
					gloss={d.ui.recomendacionesGlosa}
					fact={recommendationsCount}
				>
					<div className='flex flex-col gap-8'>
						{recommendationList[0] && (
							<figure className='m-0 flex flex-col gap-5 border-l-2 border-impulso pl-6'>
								<blockquote className='m-0'>
									<p className='m-0 font-glosa text-[clamp(1.6rem,4vw,2.5rem)] italic leading-[1.2] text-senal'>
										“{t(recommendationList[0].text, lang)}”
									</p>
								</blockquote>
								<figcaption className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
									<span className='font-rotulo text-xs font-bold uppercase tracking-[.1em] text-impulso'>
										{recommendationList[0].name}
									</span>
									<span className='font-pieza text-[10px] text-mielina'>
										{recommendationList[0].role}
									</span>
									<span className='font-pieza text-[10px] uppercase tracking-[.1em] text-sinapsis'>
										{t(recommendationList[0].relation, lang)} · {recommendationList[0].date}
									</span>
								</figcaption>
							</figure>
						)}

						<div className='flex flex-col gap-4'>
							{recommendationList.slice(1).map((r) => (
								<figure
									key={r.id}
									className='membrana m-0 flex flex-col gap-4 px-6 py-6'
								>
									<blockquote className='m-0'>
										<p className='m-0 font-glosa text-[19px] italic leading-relaxed text-senal'>
											“{t(r.text, lang)}”
										</p>
									</blockquote>
									<figcaption className='flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-sinapsis/20 pt-3'>
										<span className='font-rotulo text-xs font-bold uppercase tracking-[.1em] text-impulso'>
											{r.name}
										</span>
										<span className='font-pieza text-[10px] text-mielina'>
											{r.role}
										</span>
										<span className='ml-auto font-pieza text-[10px] uppercase tracking-[.1em] text-sinapsis'>
											{t(r.relation, lang)} · {r.date}
										</span>
									</figcaption>
								</figure>
							))}
						</div>
					</div>
				</Step>

				<Step
					n={4}
					title={d.blog.titulo}
					gloss={d.blog.glosa}
					fact={postsCount}
				>
					<div className='flex flex-col gap-4'>
						<p className='m-0 max-w-[60ch] font-nota text-[15px] leading-relaxed text-mielina'>
							{d.blog.bajada}
						</p>

						<div className='membrana flex flex-col'>
							{posts.length === 0 ? (
								<p className='m-0 px-6 py-8 font-glosa text-[16px] italic text-mielina'>
									{d.blog.vacio}
								</p>
							) : (
								posts.map((post, i) => (
									<Link
										key={post._id}
										href={localizedPath(lang, `/blog/${post.slug}`)}
										className='group grid grid-cols-[2rem_1fr] items-baseline gap-x-4 gap-y-1 border-b border-sinapsis/15 px-6 py-4 transition-colors duration-200 ease-impulso last:border-b-0 hover:bg-membrana-honda'
									>
										<span className='font-pieza text-[11px] tabular-nums text-sinapsis'>
											{String(i + 1).padStart(2, "0")}
										</span>
										<div className='flex min-w-0 flex-col gap-1'>
											<h3 className='m-0 text-base leading-tight transition-colors duration-200 ease-impulso group-hover:text-impulso md:text-lg'>
												{post.title}
											</h3>
											<div className='flex flex-wrap items-baseline gap-x-3 font-pieza text-[10px] text-mielina'>
												<span className='tabular-nums'>
													{post.publishedAt?.slice(0, 10)}
												</span>
												{post.tags?.length ? (
													<span className='text-sinapsis'>
														{post.tags.join(" · ")}
													</span>
												) : null}
											</div>
										</div>
									</Link>
								))
							)}
						</div>
					</div>
				</Step>

				<Step n={5} title={d.nav.contacto} gloss={d.ui.enRemoto}>
					<div className='flex flex-col gap-6'>
						<p className='m-0 max-w-[36ch] font-glosa text-[2rem] italic leading-[1.15] text-senal'>
							{d.hero.secciones.contacto}
						</p>

						<p className='m-0 inline-flex w-fit items-center gap-2 border border-sinapsis/40 bg-sinapsis/5 px-3 py-1.5 font-pieza text-[11px] uppercase tracking-[.1em] text-sinapsis'>
							<span aria-hidden='true' className='h-1.5 w-1.5 rounded-full bg-sinapsis' />
							{d.disponibilidad}
						</p>

						<dl className='m-0 grid grid-cols-1 border-t border-sinapsis/30 sm:grid-cols-2'>
							{[
								[d.campos.rol, "Frontend Engineer"],
								[d.campos.en, "La Mutual de AMR"],
								[d.campos.desde, "2022"],
								[d.campos.lugar, d.ui.remoto],
							].map(([k, v]) => (
								<div
									key={k}
									className='grid grid-cols-[4.5rem_1fr] items-baseline gap-3 border-b border-sinapsis/20 py-2.5'
								>
									<dt className='font-rotulo text-[9px] uppercase tracking-[.16em] text-mielina'>
										{k}
									</dt>
									<dd className='m-0 font-pieza text-xs tabular-nums text-sinapsis'>
										{v}
									</dd>
								</div>
							))}
							<div className='col-span-1 grid grid-cols-[4.5rem_1fr] items-baseline gap-3 py-2.5 sm:col-span-2'>
								<dt className='font-rotulo text-[9px] uppercase tracking-[.16em] text-mielina'>
									{d.campos.stack}
								</dt>
								<dd className='m-0 font-pieza text-xs leading-relaxed text-sinapsis'>
									{STACK.join(" · ")}
								</dd>
							</div>
						</dl>

						<ContactForm lang={lang} />

						<div className='flex flex-wrap gap-x-8 gap-y-3'>
							{links.map(([text, href, external]) => (
								<a
									key={href}
									href={href}
									target={external ? "_blank" : undefined}
									rel={external ? "noreferrer" : undefined}
									className='border-b border-sinapsis pb-0.5 font-rotulo text-sm font-bold uppercase tracking-[.1em] text-sinapsis transition-colors duration-200 ease-impulso hover:border-impulso hover:text-impulso'
								>
									{text}
									{external && " ↗"}
								</a>
							))}
						</div>

						<aside className='border-l-2 border-impulso/50 pl-5'>
						<p className='m-0 font-rotulo text-[9px] uppercase tracking-[.16em] text-mielina'>
								{d.ui.descartes}
							</p>
							<p className='m-0 mt-2 max-w-[60ch] font-glosa text-[16px] italic leading-relaxed text-mielina'>
								<span className='line-through decoration-impulso decoration-[1.5px]'>
									{t(discardedData.descartado.titulo, lang)}
								</span>
								{" — "}
								{t(discardedData.descartado.motivo, lang)}
							</p>
						</aside>
					</div>
				</Step>

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
