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
		<Step n={5} title={d.nav.contact} gloss={d.ui.remotely}>
			<div className='flex flex-col gap-6'>
				<p className='m-0 max-w-[36ch] font-gloss text-[2rem] italic leading-[1.15] text-signal'>
					{d.hero.sections.contact}
				</p>

				<p className='m-0 inline-flex w-fit items-center gap-2 border border-synapse/40 bg-synapse/5 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[.1em] text-synapse'>
					<span aria-hidden='true' className='h-1.5 w-1.5 rounded-full bg-synapse' />
					{d.availability}
				</p>

				<dl className='m-0 grid grid-cols-1 border-t border-synapse/30 sm:grid-cols-2'>
					{[
						[d.fields.role, "Frontend Engineer"],
						[d.fields.en, "La Mutual de AMR"],
						[d.fields.since, "2022"],
						[d.fields.location, d.ui.remote],
					].map(([k, v]) => (
						<div
							key={k}
							className='grid grid-cols-[4.5rem_1fr] items-baseline gap-3 border-b border-synapse/20 py-2.5'
						>
							<dt className='font-label text-[9px] uppercase tracking-[.16em] text-myelin'>
								{k}
							</dt>
							<dd className='m-0 font-mono text-xs tabular-nums text-synapse'>
								{v}
							</dd>
						</div>
					))}
					<div className='col-span-1 grid grid-cols-[4.5rem_1fr] items-baseline gap-3 py-2.5 sm:col-span-2'>
						<dt className='font-label text-[9px] uppercase tracking-[.16em] text-myelin'>
							{d.fields.stack}
						</dt>
						<dd className='m-0 font-mono text-xs leading-relaxed text-synapse'>
							{d.stack.join(" · ")}
						</dd>
					</div>
				</dl>

				<ContactForm copy={d.form} />

				<div className='flex flex-wrap gap-x-8 gap-y-3'>
					{links.map(([text, href, external]) => (
						<a
							key={href}
							href={href}
							target={external ? "_blank" : undefined}
							rel={external ? "noreferrer" : undefined}
							className='border-b border-synapse pb-0.5 font-label text-sm font-bold uppercase tracking-[.1em] text-synapse transition-colors duration-200 ease-impulse hover:border-impulse hover:text-impulse'
						>
							{text}
						</a>
					))}
				</div>

				<aside className='border-l-2 border-impulse/50 pl-5'>
					<p className='m-0 font-label text-[9px] uppercase tracking-[.16em] text-myelin'>
						{d.ui.discarded}
					</p>
					<p className='m-0 mt-2 max-w-[60ch] font-gloss text-[16px] italic leading-relaxed text-myelin'>
						<span className='line-through decoration-impulse decoration-[1.5px]'>
							{t(discardedData.discarded.title, lang)}
						</span>
						{" — "}
						{t(discardedData.discarded.reason, lang)}
					</p>
				</aside>
			</div>
		</Step>
	);
};

export default ContactoSection;
