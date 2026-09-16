import Image from "next/image";

import { t, type Language } from "../../../entities/i18n";
import type Project from "../../../entities/project";
import type { Dict } from "../i18n/dict";
import OpenProject from "../common/OpenProject";
import { STATUS_LABEL } from "../common/projects";
import { Step } from "./StepLayout";

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
		wide
		title={mainProject.nombre}
		gloss={t(mainProject.contexto, lang)}
		fact={`${STATUS_LABEL[mainProject.estado][lang]} · ${mainProject.stack.join(" · ")}`}
	>
		<div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-start'>
			<div className='min-w-0 flex flex-col gap-4'>
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

			<div className='min-w-0 flex flex-col gap-4'>
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
);

export default NorteArSection;
