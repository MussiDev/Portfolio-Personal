import { t, type Language } from "../../../entities/i18n";
import type { Recommendation } from "../../../entities/schemas";
import type { Dict } from "../i18n/dict";
import { Step } from "./StepLayout";

const RecomendacionesSection = ({
	d,
	lang,
	recommendationList,
	recommendationsCount,
}: {
	d: Dict;
	lang: Language;
	recommendationList: Recommendation[];
	recommendationsCount: string;
}) => (
	<Step
		n={3}
		title={d.campos.recomendaciones}
		gloss={d.ui.recomendacionesGlosa}
		fact={recommendationsCount}
	>
		<div className='flex flex-col gap-8'>
			{recommendationList[0] && (
				<figure className='m-0 flex flex-col gap-5 border-l-2 border-impulso pl-6'>
					<blockquote className='m-0'>
						<p className='m-0 font-glosa text-[clamp(1.6rem,4vw,2.5rem)] italic leading-[1.2] text-senal'>
							“{t(recommendationList[0].text, lang)}”
						</p>
					</blockquote>
					<figcaption className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
						<span className='font-rotulo text-xs font-bold uppercase tracking-[.1em] text-impulso'>
							{recommendationList[0].name}
						</span>
						<span className='font-pieza text-[10px] text-mielina'>
							{recommendationList[0].role}
						</span>
						<span className='font-pieza text-[10px] uppercase tracking-[.1em] text-sinapsis'>
							{t(recommendationList[0].relation, lang)} · {recommendationList[0].date}
						</span>
					</figcaption>
				</figure>
			)}

			<div className='flex flex-col gap-4'>
				{recommendationList.slice(1).map((r) => (
					<figure
						key={r.id}
						className='membrana m-0 flex flex-col gap-4 px-6 py-6'
					>
						<blockquote className='m-0'>
							<p className='m-0 font-glosa text-[19px] italic leading-relaxed text-senal'>
								“{t(r.text, lang)}”
							</p>
						</blockquote>
						<figcaption className='flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-sinapsis/20 pt-3'>
							<span className='font-rotulo text-xs font-bold uppercase tracking-[.1em] text-impulso'>
								{r.name}
							</span>
							<span className='font-pieza text-[10px] text-mielina'>
								{r.role}
							</span>
							<span className='ml-auto font-pieza text-[10px] uppercase tracking-[.1em] text-sinapsis'>
								{t(r.relation, lang)} · {r.date}
							</span>
						</figcaption>
					</figure>
				))}
			</div>
		</div>
	</Step>
);

export default RecomendacionesSection;
