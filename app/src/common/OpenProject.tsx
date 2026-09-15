import type { Language } from "../../../entities/i18n";
import { t } from "../../../entities/i18n";
import type Project from "../../../entities/project";
import type { Measurement } from "../../../entities/project";
import Pending from "./Pending";
import BlueprintDiagram from "./BlueprintDiagram";
import { STAGES, paragraphs, stageHasContent } from "./projects";

const Flow = ({ steps }: { steps: string[] }) => (
	<ol className='flex list-none flex-col items-start gap-0 p-0 sm:flex-row sm:flex-wrap sm:items-stretch'>
		{steps.map((step, i) => (
			<li key={step} className='flex flex-col items-start sm:flex-row sm:items-center'>
				<span className='border-x border-y border-sinapsis px-4 py-2.5 font-rotulo text-[12px] font-semibold uppercase tracking-[.05em] sm:border-x-0 sm:border-l'>
					{step}
				</span>
				<svg
					width={i < steps.length - 1 ? 34 : 13}
					height='11'
					viewBox={i < steps.length - 1 ? "0 0 34 11" : "0 0 13 11"}
					aria-hidden='true'
					className='ml-6 shrink-0 rotate-90 text-sinapsis sm:ml-0 sm:rotate-0'
				>
					{i < steps.length - 1 ? (
						<>
							<path d='M0 0v11M0 5.5h27' stroke='currentColor' strokeWidth='1' />
							<path
								d='M27 1.5l6 4-6 4'
								stroke='currentColor'
								strokeWidth='1'
								fill='none'
							/>
						</>
					) : (
						<path d='M0 0v11' stroke='currentColor' strokeWidth='1' />
					)}
				</svg>
			</li>
		))}
	</ol>
);

const Measurements = ({
	measurements,
	lang,
	unmeasured,
}: {
	measurements: Measurement[];
	lang: Language;
	unmeasured: string;
}) => (
	<dl className='m-0 grid grid-cols-2 border-t border-sinapsis md:grid-cols-4'>
		{measurements.map((m) => (
			<div
				key={m.etiqueta.es}
				className='flex flex-col gap-1 border-b border-r border-sinapsis/25 px-4 py-3 last:border-r-0'
			>
				<dt className='font-rotulo text-[9px] uppercase tracking-[.16em] text-mielina'>
					{t(m.etiqueta, lang)}
				</dt>
				<dd
					className={`m-0 font-pieza tabular-nums ${
						m.valor ? "text-lg text-senal" : "text-xs italic text-mielina"
					}`}
				>
					{m.valor ?? unmeasured}
				</dd>
			</div>
		))}
	</dl>
);

const OpenProject = ({
	project,
	lang,
	unwritten,
	unmeasured,
	pendingLabel,
}: {
	project: Project;
	lang: Language;
	unwritten: string;
	unmeasured: string;
	pendingLabel: string;
}) => (
	<div className='membrana flex flex-col'>
		<ol className='relative m-0 flex list-none flex-col gap-8 border-l-2 border-sinapsis/25 px-6 py-7 pl-9 sm:pl-11 md:px-8'>
			{STAGES.map(({ key, label }, i) => {
				const stage = project.tiempos[key];
				const body = paragraphs(stage, lang);
				const hasContent = stageHasContent(stage);

				return (
					<li key={key} className='relative'>
						<span
							aria-hidden='true'
							className='absolute -left-[calc(2.25rem+5px)] top-1.5 h-[9px] w-[9px] rounded-full bg-impulso shadow-[0_0_0_3px_rgb(24_32_46)] sm:-left-[calc(2.75rem+5px)]'
						/>
						<div className='flex flex-wrap items-baseline gap-x-4 gap-y-1'>
							<span className='font-pieza text-[11px] tabular-nums text-sinapsis'>
								{String(i + 1).padStart(2, "0")}
							</span>
							<h3 className='m-0 text-sm md:text-base'>{t(label, lang)}</h3>
							{!hasContent && (
								<span className='font-glosa text-[15px] italic leading-none text-mielina'>
									{unwritten}
								</span>
							)}
						</div>

						<div className='mt-4 flex flex-col gap-5'>
							{body.map((p) => (
								<p
									key={p.slice(0, 40)}
									className='m-0 max-w-[68ch] font-nota text-[14px] leading-relaxed text-mielina'
								>
									{p}
								</p>
							))}

							{key === "mecanismo" && "flujo" in stage && stage.flujo && (
								<Flow steps={stage.flujo[lang] ?? stage.flujo.es} />
							)}

							{key === "mecanismo" && "diagrama" in stage && stage.diagrama && (
								<BlueprintDiagram code={stage.diagrama} />
							)}

							{key === "mecanismo" && "codigo" in stage && stage.codigo && (
								<pre className='overflow-x-auto border-l-2 border-sinapsis bg-membrana-honda px-5 py-4 font-pieza text-[12.5px] leading-relaxed'>
									{stage.codigo}
								</pre>
							)}

							{key === "resultado" &&
								"medidas" in stage &&
								stage.medidas.length > 0 && (
									<Measurements
										measurements={stage.medidas}
										lang={lang}
										unmeasured={unmeasured}
									/>
								)}

							{stage.pendiente && (
								<Pending label={pendingLabel}>{t(stage.pendiente, lang)}</Pending>
							)}
						</div>
					</li>
				);
			})}
		</ol>
	</div>
);

export default OpenProject;
