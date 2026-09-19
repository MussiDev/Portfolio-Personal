import { t, type Language } from "../../../entities/i18n";
import type {
	Certification,
	Company,
	LanguageItem,
	Role,
	WorkProject,
} from "../../../entities/schemas";
import type { Dict } from "../i18n/dict";
import { Card, Step } from "./StepLayout";

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

const TrayectoriaSection = ({
	d,
	lang,
	companies,
	projects,
	certificationList,
	languageItems,
	companiesCount,
	projectsCount,
}: {
	d: Dict;
	lang: Language;
	companies: Company[];
	projects: WorkProject[];
	certificationList: Certification[];
	languageItems: LanguageItem[];
	companiesCount: string;
	projectsCount: string;
}) => (
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
							<Card className='membrana-viva'>
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
										<p className='m-0 font-rotulo text-[14px] leading-relaxed text-mielina'>
											{r.description[lang] ?? r.description.es}
										</p>
										{r.highlights && (
											<ul className='m-0 flex list-none flex-col gap-1 pl-0'>
												{(r.highlights[lang] ?? r.highlights.es).map((h) => (
													<li
														key={h}
														className='flex gap-2 font-rotulo text-[14px] leading-relaxed text-mielina'
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
								<p className='m-0 font-rotulo text-[13px] leading-relaxed text-mielina'>
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
								className='m-0 max-w-[52ch] font-rotulo text-[13px] leading-relaxed text-mielina'
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
								<span className='font-rotulo text-[13px] text-senal'>
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
							<span className='font-rotulo text-[13px] text-senal'>
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
);

export default TrayectoriaSection;
