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
}: {
	project: Project;
	lang: Language;
	unwritten: string;
	unmeasured: string;
}) => (
	<div className='membrana flex flex-col'>
		{STAGES.map(({ key, label }, i) => {
			const stage = project.tiempos[key];
			const body = paragraphs(stage, lang);
			const hasContent = stageHasContent(stage);

			return (
				<details
					key={key}
					open={i === 0}
					className='tiempo border-b border-sinapsis/15 last:border-b-0'
				>
					<summary className='grid cursor-pointer list-none grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-4 px-6 py-3.5 transition-colors duration-200 ease-impulso hover:bg-membrana-honda'>
						<span className='font-pieza text-[11px] tabular-nums text-sinapsis'>
							{String(i + 1).padStart(2, "0")}
						</span>
						<h3 className='m-0 text-sm'>{t(label, lang)}</h3>
						{hasContent ? (
							<span
								aria-hidden='true'
								className='marcador font-pieza text-xs text-impulso'
							/>
						) : (
							<span className='font-glosa text-[15px] italic leading-none text-mielina'>
								{unwritten}
							</span>
						)}
					</summary>

					<div className='flex flex-col gap-5 px-6 pb-6 pt-1 md:pl-[3.75rem]'>
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
							<Pending>{t(stage.pendiente, lang)}</Pending>
						)}
					</div>
				</details>
			);
		})}
	</div>
);

export default OpenProject;
