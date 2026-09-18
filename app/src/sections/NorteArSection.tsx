import Link from "next/link";

import { localizedPath, t, type Language } from "../../../entities/i18n";
import type Project from "../../../entities/project";
import type { Dict } from "../i18n/dict";
import OpenProject from "../common/OpenProject";
import { STATUS_LABEL } from "../common/projects";
import NorteArFigura from "./NorteArFigura";
import { Step } from "./StepLayout";

/**
 * El paso 2 de la home: un resumen del caso, no el caso.
 *
 * Una sola columna, como los demás pasos. La versión en dos columnas
 * (`wide`) se estiraba hacia la izquierda, justo encima del cerebro, y
 * obligaba a duplicar los links para reordenarlos según el ancho. Acá el
 * orden es uno solo: qué es, la evidencia, el problema, y a dónde seguir.
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
		title={mainProject.nombre}
		gloss={t(mainProject.contexto, lang)}
		fact={`${STATUS_LABEL[mainProject.estado][lang]} · ${mainProject.stack.join(" · ")}`}
	>
		<div className='flex flex-col gap-6'>
			<p className='m-0 font-glosa text-2xl italic leading-snug text-senal'>
				{t(mainProject.resumen, lang)}
			</p>

			<NorteArFigura d={d} />

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

			<div className='flex flex-wrap items-center gap-x-8 gap-y-2'>
				<Link
					href={localizedPath(lang, `/proyectos/${mainProject.slug}`)}
					className='inline-flex min-h-11 w-fit items-center font-rotulo text-xs font-bold uppercase tracking-[.14em] text-impulso transition-colors duration-200 ease-impulso hover:text-senal'
				>
					<span className='inline-flex items-center gap-2 border-b border-current pb-0.5'>
						{d.proyectos.leerCaso}
						<span aria-hidden='true'>→</span>
					</span>
				</Link>
				{mainProject.enlaces?.map((e) => (
					<a
						key={e.href}
						href={e.href}
						target={e.externo ? "_blank" : undefined}
						rel={e.externo ? "noreferrer" : undefined}
						className='inline-flex min-h-11 items-center font-rotulo text-[11px] font-bold uppercase tracking-[.14em] text-sinapsis transition-colors duration-200 ease-impulso hover:text-impulso'
					>
						<span className='border-b border-current pb-0.5'>{t(e.etiqueta, lang)} ↗</span>
					</a>
				))}
			</div>
		</div>
	</Step>
);

export default NorteArSection;
