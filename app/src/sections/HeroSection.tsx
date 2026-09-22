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

		<nav data-tissue-to className='enter enter-3 pointer-events-auto absolute bottom-0 left-0 right-0 flex flex-col gap-px border-t border-synapse/25 bg-tissue/85 backdrop-blur-sm desk:hidden'>
			{sections.map((s, i) => (
				<a
					key={s.href + s.label}
					href={s.external ? s.href : `#step-${s.step}`}
					target={s.external ? "_blank" : undefined}
					rel={s.external ? "noreferrer" : undefined}
					// py-3.5 instead of py-2.5: with the label's line-height this
					// leaves the row at ~48px, the comfortable minimum for a
					// finger. This is the only navigation that exists below
					// 768px, so it can't stay at 36px. items-baseline is kept:
					// the three texts have different sizes and align on the
					// baseline, not the box.
					// data-region: the row is the same region as the node with
					// its number on the tissue. NervousSystem writes data-state
					// (active / linked / idle) to it, and the row responds the
					// same way desktop's labels do.
					data-region={i}
					className='group flex flex-wrap items-baseline gap-x-3 border-b border-synapse/12 px-5 py-3.5 transition-colors duration-500 ease-impulse last:border-b-0 data-[state=active]:bg-impulse/[.07]'
				>
					<span className='font-mono text-[10px] tabular-nums text-impulse'>
						{String(i + 1).padStart(2, "0")}
					</span>
					<span className='font-label text-[13px] font-bold uppercase tracking-[.08em] text-signal transition-colors duration-500 ease-impulse group-data-[state=active]:text-impulse group-data-[state=linked]:text-impulse/65'>
						{s.label}
					</span>
					<span className='ml-auto font-mono text-[9.5px] uppercase tracking-[.08em] text-myelin'>
						{s.fact}
					</span>
				</a>
			))}
		</nav>
	</section>
);

export default HeroSection;
