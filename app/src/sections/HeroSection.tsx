import type { Language } from "../../../entities/i18n";
import type { Dict } from "../i18n/dict";
import type { Section } from "../common/Brain3D";
import LanguageSwitch from "../common/LanguageSwitch";

const HeroSection = ({
	d,
	lang,
	sections,
}: {
	d: Dict;
	lang: Language;
	sections: Section[];
}) => (
	<section
		id='paso-0'
		data-step={0}
		className='pointer-events-none relative h-[100svh] min-h-[34rem]'
	>
		<div className='pointer-events-none absolute left-0 right-0 top-0 flex items-start justify-between gap-4 px-5 pt-6 md:px-10 md:pt-9'>
			<div className='min-w-0'>
				<h1 className='entra entra-1 m-0 text-2xl leading-none text-senal sm:text-3xl'>
					Joaquín Mussi
				</h1>
				<p className='entra entra-2 m-0 mt-2.5 max-w-[46ch] font-pieza text-[10.5px] uppercase leading-relaxed tracking-[.16em] text-sinapsis'>
					{d.hero.rol}
				</p>
			</div>
			<div className='entra entra-1 pointer-events-auto shrink-0 font-pieza text-xs text-mielina'>
				<LanguageSwitch current={lang} />
			</div>
		</div>

		<nav className='entra entra-3 pointer-events-auto absolute bottom-0 left-0 right-0 flex flex-col gap-px border-t border-sinapsis/25 bg-tejido/85 backdrop-blur-sm md:hidden'>
			{sections.map((s, i) => (
				<a
					key={s.href + s.label}
					href={s.external ? s.href : `#paso-${s.step}`}
					target={s.external ? "_blank" : undefined}
					rel={s.external ? "noreferrer" : undefined}
					// py-3.5 en vez de py-2.5: con el line-height del label deja la
					// fila en ~48px, el mínimo cómodo para el dedo. Es la única
					// navegación que existe bajo 768px, así que no puede quedar
					// en 36px. Se mantiene items-baseline: los tres textos tienen
					// tamaños distintos y se alinean por línea base, no por caja.
					className='flex flex-wrap items-baseline gap-x-3 border-b border-sinapsis/12 px-5 py-3.5 last:border-b-0'
				>
					<span className='font-pieza text-[10px] tabular-nums text-impulso'>
						{String(i + 1).padStart(2, "0")}
					</span>
					<span className='font-rotulo text-[13px] font-bold uppercase tracking-[.08em] text-senal'>
						{s.label}
						{s.external && " ↗"}
					</span>
					<span className='ml-auto font-pieza text-[9.5px] uppercase tracking-[.08em] text-mielina'>
						{s.fact}
					</span>
				</a>
			))}
		</nav>
	</section>
);

export default HeroSection;
