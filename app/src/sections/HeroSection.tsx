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
		{/* data-tejido-desde / data-tejido-hasta: en mobile, el tejido se
		 * acomoda en el espacio libre entre este bloque y la lista de abajo.
		 * Con una proporción fija de la pantalla se pisaba con la frase y el
		 * CTA apenas el texto crecía. */}
		<div
			data-tejido-desde
			className='pointer-events-none absolute left-0 right-0 top-0 flex items-start justify-between gap-4 px-5 pt-6 md:px-10 md:pt-9'
		>
			<div className='min-w-0'>
				<h1 className='entra entra-1 m-0 text-2xl leading-none text-senal sm:text-3xl'>
					Joaquín Mussi
				</h1>
				<p className='entra entra-2 m-0 mt-2.5 max-w-[46ch] font-pieza text-[10.5px] uppercase leading-relaxed tracking-[.16em] text-sinapsis'>
					{d.hero.rol}
				</p>

				{/*
				 * La promesa del sitio, en la voz de glosa que ya se usa para las
				 * afirmaciones. Antes el hero solo decía el puesto: una tarjeta de
				 * presentación, no una razón para seguir scrolleando. Esto es una
				 * afirmación que el resto del sitio prueba — los descartes muestran
				 * qué no se construyó y por qué, y los seis tiempos de NorteAR
				 * empiezan por el problema del usuario, no por el stack.
				 */}
				<p className='entra entra-2 m-0 mt-5 max-w-[22ch] font-glosa text-[clamp(1.35rem,2.4vw,2rem)] italic leading-[1.15] text-senal sm:max-w-[26ch]'>
					{d.hero.propuesta}
				</p>

				{/* El único CTA del hero. El objetivo de negocio del sitio es que
				 * te escriban, y hasta ahora eso estaba a seis pantallas de scroll
				 * sin una sola invitación en el camino. */}
				{/* El área táctil va en el <a> y el subrayado en el <span>, por lo
				 * mismo que en LanguageSwitch: con el min-h-11 en el link, el
				 * borde inferior se despega del texto 44px más abajo. */}
				<a
					href='#paso-5'
					className='entra entra-3 pointer-events-auto mt-4 inline-flex min-h-11 items-center font-rotulo text-xs font-bold uppercase tracking-[.14em] text-impulso transition-colors duration-200 ease-impulso hover:text-senal'
				>
					<span className='inline-flex items-center gap-2 border-b border-current pb-0.5'>
						{d.hero.cta}
						<span aria-hidden='true'>→</span>
					</span>
				</a>
			</div>
			<div className='entra entra-1 pointer-events-auto shrink-0 font-pieza text-xs text-mielina'>
				<LanguageSwitch current={lang} />
			</div>
		</div>

		<nav data-tejido-hasta className='entra entra-3 pointer-events-auto absolute bottom-0 left-0 right-0 flex flex-col gap-px border-t border-sinapsis/25 bg-tejido/85 backdrop-blur-sm md:hidden'>
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
					// data-region: la fila es la misma región que el nodo con su
					// número en el tejido. NervousSystem le escribe data-estado
					// (activo / vinculado / reposo) y la fila responde como las
					// etiquetas del cerebro en desktop.
					data-region={i}
					className='group flex flex-wrap items-baseline gap-x-3 border-b border-sinapsis/12 px-5 py-3.5 transition-colors duration-500 ease-impulso last:border-b-0 data-[estado=activo]:bg-impulso/[.07]'
				>
					<span className='font-pieza text-[10px] tabular-nums text-impulso'>
						{String(i + 1).padStart(2, "0")}
					</span>
					<span className='font-rotulo text-[13px] font-bold uppercase tracking-[.08em] text-senal transition-colors duration-500 ease-impulso group-data-[estado=activo]:text-impulso group-data-[estado=vinculado]:text-impulso/65'>
						{s.label}
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
