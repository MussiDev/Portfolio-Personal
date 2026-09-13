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
import discardedData from "../../../api/mesa.json";
import recommendations from "../../../api/recommendations.json";
import workProjects from "../../../api/workProjects.json";
import { STATUS_LABEL, getMachines, stagesWritten } from "../../src/common/workshop";
import OpenMachine from "../../src/common/OpenMachine";
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
	children,
}: {
	n: number;
	title: string;
	gloss?: string;
	fact?: string;
	children: ReactNode;
}) => (
	<section
		id={`paso-${n}`}
		data-step={n}
		className='pointer-events-none flex min-h-[100svh] items-center px-5 py-16 md:px-10 md:py-24 lg:px-16'
	>
		<div
			data-revelar
			className='pointer-events-auto ml-auto w-full max-w-[42rem] md:w-[54%]'
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
	const isSpanish = lang === "es";

	const machines = getMachines();
	const mainMachine = machines[0];
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

	const companiesCount = `${companies.length} ${isSpanish ? "empresas" : "companies"}`;
	const projectsCount = `${projects.length} ${isSpanish ? "proyectos" : "projects"}`;
	const postsCount = `${posts.length} ${isSpanish ? "notas" : "notes"}`;
	const recommendationsCount = `${recommendationList.length} ${isSpanish ? "personas" : "people"}`;

	const sections = [
		{
			label: d.oficio.trayectoria,
			fact: `${companiesCount} · ${projectsCount}`,
			summary: d.hero.secciones.experiencia,
			href: "#paso-1",
			step: 1,
			anchor: [0, 0.8, 0.02] as [number, number, number],
		},
		{
			label: mainMachine.nombre,
			fact: `${stagesWritten(mainMachine)} / 6 ${isSpanish ? "tiempos" : "beats"}`,
			summary: d.hero.secciones.proyectos,
			href: "#paso-2",
			step: 2,
			anchor: [0, 0.34, 0.7] as [number, number, number],
		},
		{
			label: d.campos.recomendaciones,
			fact: recommendationsCount,
			summary: isSpanish
				? "Lo que dijeron de trabajar conmigo quienes lo hicieron, con nombre, rol y relación."
				: "What the people who actually worked with me said, with name, role and relation.",
			href: "#paso-3",
			step: 3,
			anchor: [0, -0.12, 0.58] as [number, number, number],
		},
		{
			label: d.nav.cuaderno,
			fact: postsCount,
			summary: d.hero.secciones.blog,
			href: "#paso-4",
			step: 4,
			anchor: [0, -0.36, 0.44] as [number, number, number],
		},
		{
			label: d.nav.contacto,
			fact: isSpanish ? "respuesta en 24 h" : "reply within 24 h",
			summary: d.hero.secciones.contacto,
			href: "#paso-5",
			step: 5,
			anchor: [0, 0.46, -0.62] as [number, number, number],
		},
		{
			label: d.nav.cv,
			fact: "PDF",
			summary: d.hero.secciones.cv,
			href: "/pdf.pdf",
			external: true,
			anchor: [0, -0.06, -0.8] as [number, number, number],
		},
	];

	const links: [string, string, boolean][] = [
		["GitHub", "https://github.com/MussiDev", true],
		["LinkedIn", "https://www.linkedin.com/in/joaquinmussi/", true],
		[d.nav.cv, "/pdf.pdf", true],
	];

	return (
		<main className='sistema'>
			<NervousSystem
				sections={sections}
				loadingText={d.hero.cargando}
				drawingText={d.hero.dibujando}
				activityText={d.hero.actividad}
				openText={d.hero.abrir}
				backText={d.hero.volver}
				stepsLabel={d.hero.pasos}
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
					title={d.oficio.trayectoria}
					gloss={d.oficio.trayectoriaGlosa}
					fact={`${companiesCount} · ${projectsCount} · ${certificationList.length} ${isSpanish ? "cursos" : "courses"}`}
				>
					<div className='flex flex-col gap-4'>
						{companies.map((e) => {
							const { period, roles } = normalize(e);
							return (
								<Card key={e.company}>
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
										</div>
									))}
								</Card>
							);
						})}

						<details className='vermas membrana flex flex-col-reverse'>
							<summary className='flex cursor-pointer list-none items-center gap-3 border-t border-sinapsis/20 px-6 py-3 font-rotulo text-[11px] font-semibold uppercase tracking-[.14em] text-sinapsis transition-colors duration-200 ease-impulso hover:text-impulso'>
								<span className='mas'>
									{isSpanish
										? `Ver los ${projects.length} proyectos`
										: `See the ${projects.length} projects`}
								</span>
								<span className='menos'>{isSpanish ? "Ver menos" : "See less"}</span>
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
								<div className='flex flex-col gap-2'>
									<h4 className='m-0 font-rotulo text-[9px] uppercase tracking-[.16em] text-mielina'>
										{d.campos.educacion}
									</h4>
									<p className='m-0 max-w-[52ch] font-nota text-[13px] leading-relaxed text-mielina'>
										{d.oficio.bio}
									</p>
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
									{d.oficio.credenciales} · {certificationList.length}
								</span>
								<span className='menos'>{isSpanish ? "Ver menos" : "See less"}</span>
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
					title={mainMachine.nombre}
					gloss={t(mainMachine.contexto, lang)}
					fact={`${STATUS_LABEL[mainMachine.estado][lang]} · ${mainMachine.stack.join(" · ")}`}
				>
					<div className='flex flex-col gap-4'>
						<p className='m-0 font-glosa text-2xl italic leading-snug text-senal'>
							{t(mainMachine.resumen, lang)}
						</p>

						<figure className='membrana m-0 flex flex-col gap-0 overflow-hidden p-1.5'>
							<Image
								src='/image/nortear/margen.jpg'
								alt={
									isSpanish
										? "Margen de hoy: $40.100, el 89%, con la línea que lo explica: $45.000 facturado menos $4.900 en insumos."
										: "Margin today: $40,100, 89%, with the line that explains it: $45,000 invoiced minus $4,900 in supplies."
								}
								width={1337}
								height={151}
								sizes='(max-width: 768px) 100vw, 42rem'
								priority
								className='h-auto w-full rounded-[2px]'
							/>
							<figcaption className='flex flex-wrap items-baseline gap-x-3 px-4 pb-3 pt-3 font-pieza text-[10px] uppercase tracking-[.12em] text-mielina'>
								<span className='text-impulso'>
									{isSpanish ? "Margen del día" : "Margin of the day"}
								</span>
								<span>
									{isSpanish
										? "$45.000 facturado − $4.900 en insumos = $40.100"
										: "$45,000 invoiced − $4,900 supplies = $40,100"}
								</span>
							</figcaption>

							<details className='tiempo border-t border-sinapsis/15'>
								<summary className='flex cursor-pointer list-none items-center gap-3 px-4 py-2.5 font-rotulo text-[10px] font-semibold uppercase tracking-[.14em] text-sinapsis transition-colors duration-200 ease-impulso hover:text-impulso'>
									{isSpanish ? "Ver el panel completo" : "See the full panel"}
									<span className='marcador font-pieza text-[11px]' />
								</summary>
								<Image
									src='/image/nortear/dashboard.jpg'
									alt={
										isSpanish
											? "Panel completo de NorteAR: caja del día, resumen del mes, ventas, turnos, alertas de stock y actividad reciente."
											: "Full NorteAR panel: today's till, monthly summary, sales, appointments, stock alerts and recent activity."
									}
									width={1568}
									height={703}
									sizes='(max-width: 768px) 100vw, 42rem'
									className='h-auto w-full rounded-[2px]'
								/>
							</details>
						</figure>

						<OpenMachine
							machine={mainMachine}
							lang={lang}
							unwritten={d.maquinas.sinEscribir}
							unmeasured={d.maquinas.sinMedir}
						/>

						<div className='flex flex-wrap items-center gap-x-6 gap-y-2'>
							{mainMachine.enlaces?.map((e) => (
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
				</Step>

				<Step
					n={3}
					title={d.campos.recomendaciones}
					gloss={
						isSpanish
							? "lo que dijeron quienes trabajaron conmigo"
							: "what the people who worked with me said"
					}
					fact={recommendationsCount}
				>
					<div className='flex flex-col gap-4'>
						{recommendationList.map((r) => (
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
				</Step>

				<Step
					n={4}
					title={d.cuaderno.titulo}
					gloss={d.cuaderno.glosa}
					fact={postsCount}
				>
					<div className='flex flex-col gap-4'>
						<p className='m-0 max-w-[60ch] font-nota text-[15px] leading-relaxed text-mielina'>
							{d.cuaderno.bajada}
						</p>

						<div className='membrana flex flex-col'>
							{posts.length === 0 ? (
								<p className='m-0 px-6 py-8 font-glosa text-[16px] italic text-mielina'>
									{d.cuaderno.vacio}
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

						<div className='membrana rayado flex min-h-[7rem] flex-col justify-start px-6 pb-6 pt-5'>
							<span className='font-glosa text-[16px] italic leading-none text-mielina'>
								{d.mesa.experimento}
							</span>
						</div>
					</div>
				</Step>

				<Step n={5} title={d.nav.contacto} gloss={isSpanish ? "en remoto" : "remote"}>
					<div className='flex flex-col gap-6'>
						<p className='m-0 max-w-[36ch] font-glosa text-[2rem] italic leading-[1.15] text-senal'>
							{d.hero.secciones.contacto}
						</p>

						<dl className='m-0 grid grid-cols-1 border-t border-sinapsis/30 sm:grid-cols-2'>
							{[
								[d.campos.rol, "Frontend Engineer"],
								[d.campos.en, "La Mutual de AMR"],
								[d.campos.desde, "2022"],
								[d.campos.lugar, isSpanish ? "Remoto" : "Remote"],
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
								{isSpanish
									? "Este sitio · lo que descarté"
									: "This site · what I discarded"}
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
