import { t, type Language } from "../../../entities/i18n";
import type { Descartes } from "../../../entities/schemas";
import type { Dict } from "../i18n/dict";
import ContactForm from "../components/Workshop/ContactForm";
import { Step } from "./StepLayout";

const ContactoSection = ({
	d,
	lang,
	discardedData,
}: {
	d: Dict;
	lang: Language;
	discardedData: Descartes;
}) => {
	const links: [string, string, boolean][] = [
		["GitHub", "https://github.com/MussiDev", true],
		["LinkedIn", "https://www.linkedin.com/in/joaquinmussi/", true],
		["Email", "mailto:joakoomussi@gmail.com", false],
		[d.nav.cv, "/pdf.pdf", true],
	];

	return (
		<Step n={5} title={d.nav.contacto} gloss={d.ui.enRemoto}>
			<div className='flex flex-col gap-6'>
				<p className='m-0 max-w-[36ch] font-glosa text-[2rem] italic leading-[1.15] text-senal'>
					{d.hero.secciones.contacto}
				</p>

				<p className='m-0 inline-flex w-fit items-center gap-2 border border-sinapsis/40 bg-sinapsis/5 px-3 py-1.5 font-pieza text-[11px] uppercase tracking-[.1em] text-sinapsis'>
					<span aria-hidden='true' className='h-1.5 w-1.5 rounded-full bg-sinapsis' />
					{d.disponibilidad}
				</p>

				<dl className='m-0 grid grid-cols-1 border-t border-sinapsis/30 sm:grid-cols-2'>
					{[
						[d.campos.rol, "Frontend Engineer"],
						[d.campos.en, "La Mutual de AMR"],
						[d.campos.desde, "2022"],
						[d.campos.lugar, d.ui.remoto],
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
							{d.stack.join(" · ")}
						</dd>
					</div>
				</dl>

				<ContactForm copy={d.formulario} />

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
						</a>
					))}
				</div>

				<aside className='border-l-2 border-impulso/50 pl-5'>
					<p className='m-0 font-rotulo text-[9px] uppercase tracking-[.16em] text-mielina'>
						{d.ui.descartes}
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
	);
};

export default ContactoSection;
