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
				<span className='border-x border-y border-synapse px-4 py-2.5 font-label text-[12px] font-semibold uppercase tracking-[.05em] sm:border-x-0 sm:border-l'>
					{step}
				</span>
				<svg
					width={i < steps.length - 1 ? 34 : 13}
					height='11'
					viewBox={i < steps.length - 1 ? "0 0 34 11" : "0 0 13 11"}
					aria-hidden='true'
					className='ml-6 shrink-0 rotate-90 text-synapse sm:ml-0 sm:rotate-0'
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
	<dl className='m-0 grid grid-cols-2 border-t border-synapse md:grid-cols-4'>
		{measurements.map((m) => (
			<div
				key={m.label.es}
				className='flex flex-col gap-1 border-b border-r border-synapse/25 px-4 py-3 last:border-r-0'
			>
				<dt className='font-label text-[9px] uppercase tracking-[.16em] text-myelin'>
					{t(m.label, lang)}
				</dt>
				<dd
					className={`m-0 font-mono tabular-nums ${
						m.value ? "text-lg text-signal" : "text-xs italic text-myelin"
					}`}
				>
					{m.value ?? unmeasured}
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
	diagramLabel,
	scrollHint,
	codeLabel,
	stages,
}: {
	project: Project;
	lang: Language;
	unwritten: string;
	unmeasured: string;
	pendingLabel: string;
	diagramLabel: string;
	scrollHint: string;
	codeLabel: string;
	/** Which stages to show. All six by default. The home shows only the
	 * problem as a hook; the full case lives at /projects/[slug]. */
	stages?: readonly (typeof STAGES)[number]["key"][];
}) => (
	<div className='membrane flex flex-col'>
		<ol className='relative m-0 flex list-none flex-col gap-8 border-l-2 border-synapse/25 px-6 py-7 pl-9 sm:pl-11 md:px-8'>
			{STAGES.filter(({ key }) => !stages || stages.includes(key)).map(({ key, label }, i) => {
				const stage = project.stages[key];
				const body = paragraphs(stage, lang);
				const hasContent = stageHasContent(stage);

				return (
					// data-stage: the brain reads which beat is on screen to
					// advance the decision trace (useActiveBeat).
					<li key={key} data-stage={i} className='relative'>
						<span
							aria-hidden='true'
							className='absolute -left-[calc(2.25rem+5px)] top-1.5 h-[9px] w-[9px] rounded-full bg-impulse shadow-[0_0_0_3px_rgb(24_32_46)] sm:-left-[calc(2.75rem+5px)]'
						/>
						{/* Collapsed by default only on mobile (md:stage-six forces
						everything open on desktop via CSS) — on mobile all six
						complete beats are too much scrolling to read in one go. */}
						<details className='stage stage-six' open={i === 0}>
							<summary className='flex cursor-pointer list-none flex-wrap items-baseline gap-x-4 gap-y-1'>
								<span className='font-mono text-[11px] tabular-nums text-synapse'>
									{String(i + 1).padStart(2, "0")}
								</span>
								<h3 className='m-0 text-sm md:text-base'>{t(label, lang)}</h3>
								{!hasContent && (
									<span className='font-gloss text-[15px] italic leading-none text-myelin'>
										{unwritten}
									</span>
								)}
								<span className='mark ml-auto font-mono text-[11px] text-synapse md:hidden' />
							</summary>

							<div className='mt-4 flex flex-col gap-5'>
								{body.map((p) => (
									<p
										key={p.slice(0, 40)}
										className='m-0 max-w-[68ch] font-label text-[14px] leading-relaxed text-myelin'
									>
										{p}
									</p>
								))}

								{key === "mechanism" && "flow" in stage && stage.flow && (
									<Flow steps={stage.flow[lang] ?? stage.flow.es} />
								)}

								{key === "mechanism" && "diagram" in stage && stage.diagram && (
									<BlueprintDiagram code={stage.diagram} label={diagramLabel} hint={scrollHint} />
								)}

								{key === "mechanism" && "code" in stage && stage.code && (
									// Focusable and named: on narrow screens the lines don't
									// fit and the block scrolls, and a zone that scrolls
									// without being focusable is out of reach without a
									// mouse. Always, not only when it overflows, because this
									// renders on the server, where the width isn't known —
									// same as GitHub's blocks.
									<pre
										tabIndex={0}
										role='region'
										aria-label={codeLabel}
										className='overflow-x-auto border-l-2 border-synapse bg-membrane-deep px-5 py-4 font-mono text-[12.5px] leading-relaxed'
									>
										{stage.code}
									</pre>
								)}

								{key === "result" &&
									"measurements" in stage &&
									stage.measurements.length > 0 && (
										<Measurements
											measurements={stage.measurements}
											lang={lang}
											unmeasured={unmeasured}
										/>
									)}

								{stage.pending && (
									<Pending label={pendingLabel}>{t(stage.pending, lang)}</Pending>
								)}
							</div>
						</details>
					</li>
				);
			})}
		</ol>
	</div>
);

export default OpenProject;
