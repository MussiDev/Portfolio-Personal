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
		id='step-0'
		data-step={0}
		tabIndex={-1}
		className='pointer-events-none relative h-[100svh] min-h-[34rem]'
	>
		{/* data-tissue-from / data-tissue-to: on mobile, the tissue fits itself
		 * into the free space between this block and the list below. With a
		 * fixed fraction of the screen it collided with the pitch and the CTA
		 * as soon as the text grew. */}
		<div
			data-tissue-from
			className='pointer-events-none absolute left-0 right-0 top-0 flex items-start justify-between gap-4 px-5 pt-6 md:px-10 md:pt-9'
		>
			<div className='min-w-0'>
				<h1 className='enter enter-1 m-0 text-2xl leading-none text-signal sm:text-3xl'>
					Joaquín Mussi
				</h1>
				<p className='enter enter-2 m-0 mt-2.5 max-w-[46ch] font-mono text-[10.5px] uppercase leading-relaxed tracking-[.16em] text-synapse'>
					{d.hero.role}
				</p>

				{/*
				 * The site's pitch, in the same gloss voice already used for the
				 * statements. The hero used to only say the role: a business
				 * card, not a reason to keep scrolling. This is a claim the rest
				 * of the site proves — the discarded section shows what wasn't
				 * built and why, and NorteAR's six beats start with the user's
				 * problem, not the stack.
				 */}
				<p className='enter enter-2 m-0 mt-5 max-w-[22ch] font-gloss text-[clamp(1.35rem,2.4vw,2rem)] italic leading-[1.15] text-signal sm:max-w-[26ch]'>
					{d.hero.pitch}
				</p>

				{/* The hero's only CTA. The site's business goal is that people
				 * write in, and until now that was six screens of scrolling
				 * away with not one invitation along the way. */}
				{/* The tap target sits on the <a> and the underline on the
				 * <span>, for the same reason as in LanguageSwitch: with
				 * min-h-11 on the link, the bottom border would sit 44px below
				 * the text. */}
				<a
					href='#step-5'
					className='enter enter-3 pointer-events-auto mt-4 inline-flex min-h-11 items-center font-label text-xs font-bold uppercase tracking-[.14em] text-impulse transition-colors duration-200 ease-impulse hover:text-signal'
				>
					<span className='inline-flex items-center gap-2 border-b border-current pb-0.5'>
						{d.hero.cta}
						<span aria-hidden='true'>→</span>
					</span>
				</a>
			</div>
			<div className='enter enter-1 pointer-events-auto shrink-0 font-mono text-xs text-myelin'>
				<LanguageSwitch current={lang} />
			</div>
		</div>

		{/* A 2×3 grid, not six full-width rows: the rows took a third of the
		 * screen and left the tissue a ~130px strip, so the brain read as a
		 * thumbnail. The gap-px over a synapse background draws the hairlines,
		 * and the gradient above lets the tissue run down into the grid. */}
		<nav data-tissue-to className='enter enter-3 pointer-events-auto absolute bottom-0 left-0 right-0 grid grid-cols-2 gap-px border-t border-synapse/25 bg-synapse/15 before:pointer-events-none before:absolute before:inset-x-0 before:-top-16 before:h-16 before:bg-gradient-to-b before:from-tissue/0 before:to-tissue/70 desk:hidden'>
			{sections.map((s, i) => (
				<a
					key={s.href + s.label}
					href={s.external ? s.href : `#step-${s.step}`}
					target={s.external ? "_blank" : undefined}
					rel={s.external ? "noreferrer" : undefined}
					// min-h-14: every cell stays well over the 44px a finger
					// needs. This is the only navigation that exists below
					// 768px.
					// data-region: the cell is the same region as the node with
					// its number on the tissue. NervousSystem writes data-state
					// (active / linked / idle) to it, and the cell responds the
					// same way desktop's labels do — the active one gets the
					// impulse bar on its inner edge, like the lit node's leader.
					data-region={i}
					className='group flex min-h-14 flex-col justify-center gap-1 bg-tissue/90 px-4 py-2.5 transition-[background-color,box-shadow] duration-500 ease-impulse data-[state=active]:bg-membrane/90 data-[state=active]:shadow-[inset_2px_0_0_rgb(var(--impulse))]'
				>
					{/* The name gets the cell's whole width: on a 320px screen
					 * "RECOMENDACIONES" didn't fit beside the number. The number
					 * moves down next to the fact, still in impulse orange so it
					 * keeps reading as the tissue's legend. `length:` is needed:
					 * a bare clamp() is ambiguous and Tailwind drops it. */}
					<span className='font-label text-[length:clamp(10.5px,3.3vw,12.5px)] font-bold uppercase tracking-[.04em] text-signal transition-colors duration-500 ease-impulse group-data-[state=active]:text-impulse group-data-[state=linked]:text-impulse/65'>
						{s.label}
					</span>
					<span className='flex items-baseline gap-2 font-mono text-[9px] uppercase leading-snug tracking-[.06em] text-myelin'>
						<span className='text-[10px] tabular-nums text-impulse'>
							{String(i + 1).padStart(2, "0")}
						</span>
						{s.fact}
					</span>
				</a>
			))}
		</nav>
	</section>
);

export default HeroSection;
