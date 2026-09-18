import Link from "next/link";

import { localizedPath, t, type Language } from "../../../entities/i18n";
import type Project from "../../../entities/project";
import type { Dict } from "../i18n/dict";
import OpenProject from "../common/OpenProject";
import { STATUS_LABEL } from "../common/projects";
import NorteArFigura from "./NorteArFigura";
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

				{/*
				 * En la home va solo el problema: es el gancho, y está escrito
				 * desde el usuario. Los seis tiempos completos viven en
				 * /proyectos/[slug], una URL que se puede compartir y que Google
				 * puede indexar por sí sola — un ancla dentro de la home no.
				 */}
				<OpenProject
					project={mainProject}
					lang={lang}
					unwritten={d.proyectos.sinEscribir}
					unmeasured={d.proyectos.sinMedir}
					pendingLabel={d.falta}
					etapas={["problema"]}
				/>

				<Link
					href={localizedPath(lang, `/proyectos/${mainProject.slug}`)}
					className='inline-flex min-h-11 w-fit items-center font-rotulo text-xs font-bold uppercase tracking-[.14em] text-impulso transition-colors duration-200 ease-impulso hover:text-senal'
				>
					<span className='inline-flex items-center gap-2 border-b border-current pb-0.5'>
						{d.proyectos.leerCaso}
						<span aria-hidden='true'>→</span>
					</span>
				</Link>

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
				<NorteArFigura d={d} />
			</div>
		</div>
	</Step>
);

export default NorteArSection;
