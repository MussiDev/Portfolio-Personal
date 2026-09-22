import { formatMonth, formatPeriod } from "../../../entities/dates";
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

const normalize = (e: Company, lang: Language): { period: string; roles: Role[] } => {
	const span = e.totalTime ?? e.time;
	return {
		period: [span && formatPeriod(span, lang), t(e.mode, lang)].filter(Boolean).join(" · "),
		roles:
			e.roles ??
			(e.time
				? [{ position: e.position ?? "", time: e.time, description: e.description ?? {} }]
				: []),
	};
};

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
		title={d.about.career}
		gloss={d.about.careerGloss}
		fact={`${companiesCount} · ${projectsCount} · ${certificationList.length} ${d.ui.courses}`}
	>
		<div className='flex flex-col gap-4'>
			<div className='relative flex flex-col gap-6 border-l-2 border-synapse/25 pl-6 sm:pl-8'>
				{companies.map((e) => {
					const { period, roles } = normalize(e, lang);
					return (
						<div key={e.company} className='relative'>
							<span
								aria-hidden='true'
								className='absolute -left-[calc(1.5rem+5px)] top-1.5 h-[9px] w-[9px] rounded-full bg-impulse shadow-[0_0_0_3px_rgb(5_7_13)] sm:-left-[calc(2rem+5px)]'
							/>
							<Card className='membrane-live'>
								<div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-synapse/20 pb-3'>
									<h3 className='m-0 text-lg md:text-xl'>{e.company}</h3>
									<span className='font-mono text-[10px] uppercase tracking-[.12em] text-synapse'>
										{period}
									</span>
								</div>
								{roles.map((r) => (
									<div
										key={r.position + r.time.from}
										className='flex flex-col gap-1.5'
									>
										<div className='flex flex-wrap items-baseline gap-x-3'>
											<h4 className='m-0 text-sm text-impulse'>
												{r.position}
											</h4>
											<span className='font-mono text-[10px] uppercase tabular-nums text-myelin'>
												{formatPeriod(r.time, lang)}
											</span>
										</div>
										<p className='m-0 font-label text-[14px] leading-relaxed text-myelin'>
											{r.description[lang] ?? r.description.es}
										</p>
										{r.highlights && (
											<ul className='m-0 flex list-none flex-col gap-1 pl-0'>
												{(r.highlights[lang] ?? r.highlights.es).map((h) => (
													<li
														key={h}
														className='flex gap-2 font-label text-[14px] leading-relaxed text-myelin'
													>
														<span aria-hidden='true' className='text-impulse'>
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

			<details className='see-more membrane flex flex-col-reverse'>
				<summary className='flex cursor-pointer list-none items-center gap-3 border-t border-synapse/20 px-6 py-3 font-label text-[11px] font-semibold uppercase tracking-[.14em] text-synapse transition-colors duration-200 ease-impulse hover:text-impulse'>
					<span className='more'>{d.ui.seeProjects(projects.length)}</span>
					<span className='less'>{d.ui.seeLess}</span>
				</summary>
				<div className='flex flex-col'>
					{projects.map((p, i) => (
						<div
							key={p.id}
							className='grid grid-cols-[2rem_1fr] gap-x-4 gap-y-1 border-b border-synapse/15 px-6 py-3.5 last:border-b-0'
						>
							<span className='font-mono text-[11px] tabular-nums text-synapse'>
								{String(i + 1).padStart(2, "0")}
							</span>
							<div className='flex flex-col gap-1'>
								<div className='flex flex-wrap items-baseline gap-x-3'>
									<h4 className='m-0 text-sm'>{t(p.name, lang)}</h4>
									<span className='font-mono text-[10px] text-myelin'>
										{[p.company, p.period && formatPeriod(p.period, lang)]
											.filter(Boolean)
											.join(" · ")}
									</span>
								</div>
								<p className='m-0 font-label text-[13px] leading-relaxed text-myelin'>
									{t(p.description, lang)}
								</p>
								<p className='m-0 font-mono text-[10px] text-synapse'>
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
						<h4 className='m-0 font-label text-[9px] uppercase tracking-[.16em] text-myelin'>
							{d.about.title}
						</h4>
						{d.about.bio.map((p) => (
							<p
								key={p.slice(0, 40)}
								className='m-0 max-w-[52ch] font-label text-[13px] leading-relaxed text-myelin'
							>
								{p}
							</p>
						))}
					</div>
					<div className='flex flex-col gap-2'>
						<h4 className='m-0 font-label text-[9px] uppercase tracking-[.16em] text-myelin'>
							{d.fields.languages}
						</h4>
						{languageItems.map((i) => (
							<div
								key={i.id}
								className='flex items-baseline justify-between gap-3 border-b border-synapse/15 pb-1 last:border-b-0'
							>
								<span className='font-label text-[13px] text-signal'>
									{t(i.name, lang)}
								</span>
								<span className='font-mono text-[10px] text-myelin'>
									{t(i.level, lang)}
								</span>
							</div>
						))}
					</div>
				</div>
			</Card>

			<details className='see-more membrane flex flex-col-reverse'>
				<summary className='flex cursor-pointer list-none items-center gap-3 border-t border-synapse/20 px-6 py-3 font-label text-[11px] font-semibold uppercase tracking-[.14em] text-synapse transition-colors duration-200 ease-impulse hover:text-impulse'>
					<span className='more'>
						{d.about.credentials} · {certificationList.length}
					</span>
					<span className='less'>{d.ui.seeLess}</span>
				</summary>
				<ul className='m-0 flex list-none flex-col p-0'>
					{certificationList.map((c) => (
						<li
							key={c.id}
							className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-synapse/15 px-6 py-2 last:border-b-0'
						>
							<span className='font-label text-[13px] text-signal'>
								{c.name}
							</span>
							<span className='font-mono text-[10px] text-myelin'>
								{c.platform} · {formatMonth(c.date, lang)}
							</span>
						</li>
					))}
				</ul>
			</details>
		</div>
	</Step>
);

export default TrayectoriaSection;
