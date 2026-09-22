import Link from "next/link";

import { localizedPath, t, type Language } from "../../../entities/i18n";
import type Project from "../../../entities/project";
import type { Dict } from "../i18n/dict";
import OpenProject from "../common/OpenProject";
import { STATUS_LABEL } from "../common/projects";
import NorteArFigura from "./NorteArFigura";
import { Step } from "./StepLayout";

/**
 * The home's step 2: a summary of the case, not the case.
 *
 * A single column, like the other steps. The two-column version (`wide`)
 * stretched to the left, right over the brain, and forced duplicating the
 * links to reorder them by width. Here there's only one order: what it
 * is, the evidence, the problem, and where to go next.
 */
const NorteArSection = ({
	d,
	lang,
	mainProject,
}: {
	d: Dict;
	lang: Language;
	mainProject: Project;
}) => (
	<Step
		n={2}
		title={mainProject.name}
		gloss={t(mainProject.context, lang)}
		fact={`${STATUS_LABEL[mainProject.status][lang]} · ${mainProject.stack.join(" · ")}`}
	>
		<div className='flex flex-col gap-6'>
			<p className='m-0 font-gloss text-2xl italic leading-snug text-signal'>
				{t(mainProject.summary, lang)}
			</p>

			<NorteArFigura d={d} />

			{/*
			 * Only the problem goes on the home: it's the hook, and it's
			 * written from the user's side. The full six beats live at
			 * /projects/[slug], a URL that can be shared and that Google can
			 * index on its own — an anchor inside the home can't.
			 */}
			<OpenProject
				project={mainProject}
				lang={lang}
				unwritten={d.projects.notWritten}
				unmeasured={d.projects.notMeasured}
				pendingLabel={d.missing}
				diagramLabel={d.projects.diagram}
				scrollHint={d.projects.scrollHint}
				codeLabel={d.projects.code}
				stages={["problem"]}
			/>

			<div className='flex flex-wrap items-center gap-x-8 gap-y-2'>
				<Link
					href={localizedPath(lang, `/projects/${mainProject.slug}`)}
					className='inline-flex min-h-11 w-fit items-center font-label text-xs font-bold uppercase tracking-[.14em] text-impulse transition-colors duration-200 ease-impulse hover:text-signal'
				>
					<span className='inline-flex items-center gap-2 border-b border-current pb-0.5'>
						{d.projects.readCase}
						<span aria-hidden='true'>→</span>
					</span>
				</Link>
				{mainProject.links?.map((e) => (
					<a
						key={e.href}
						href={e.href}
						target={e.external ? "_blank" : undefined}
						rel={e.external ? "noreferrer" : undefined}
						className='inline-flex min-h-11 items-center font-label text-[11px] font-bold uppercase tracking-[.14em] text-synapse transition-colors duration-200 ease-impulse hover:text-impulse'
					>
						<span className='border-b border-current pb-0.5'>{t(e.label, lang)}</span>
					</a>
				))}
			</div>
		</div>
	</Step>
);

export default NorteArSection;
