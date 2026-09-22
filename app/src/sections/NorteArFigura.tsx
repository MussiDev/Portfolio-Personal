import Image from "next/image";

import type { Dict } from "../i18n/dict";

/**
 * NorteAR's visual evidence: the daily margin strip, with the math that
 * explains it, and the full panel on demand.
 *
 * It lives on its own because two places use it — step 2's summary on the
 * home and the case page — and it's the same statement in both: the
 * product shows margin, not revenue.
 */
const NorteArFigura = ({ d }: { d: Dict }) => (
	<figure className='membrane m-0 flex flex-col gap-0 overflow-hidden p-1.5'>
		<Image
			src='/image/nortear/margen.jpg'
			alt={d.ui.marginAlt}
			width={1337}
			height={151}
			sizes='(max-width: 768px) 100vw, 42rem'
			className='h-auto w-full rounded-[2px]'
		/>
		<figcaption className='flex flex-wrap items-baseline gap-x-3 px-4 pb-3 pt-3 font-mono text-[10px] uppercase tracking-[.12em] text-myelin'>
			<span className='text-impulse'>{d.ui.dailyMargin}</span>
			<span>{d.ui.marginFormula}</span>
		</figcaption>

		<details className='stage border-t border-synapse/15'>
			<summary className='flex cursor-pointer list-none items-center gap-3 px-4 py-2.5 font-label text-[10px] font-semibold uppercase tracking-[.14em] text-synapse transition-colors duration-200 ease-impulse hover:text-impulse'>
				{d.ui.seeFullPanel}
				<span className='mark font-mono text-[11px]' />
			</summary>
			<Image
				src='/image/nortear/dashboard.jpg'
				alt={d.ui.panelAlt}
				width={1568}
				height={703}
				sizes='(max-width: 768px) 100vw, 42rem'
				className='h-auto w-full rounded-[2px]'
			/>
		</details>
	</figure>
);

export default NorteArFigura;
