import Image from "next/image";

import type { Dict } from "../i18n/dict";

/**
 * La evidencia visual de NorteAR: la tira del margen del día, con la cuenta
 * que la explica, y el panel completo a demanda.
 *
 * Vive aparte porque la usan dos lugares — el resumen del paso 2 en la home
 * y la página del caso — y es la misma afirmación en los dos: el producto
 * muestra el margen, no la facturación.
 */
const NorteArFigura = ({ d }: { d: Dict }) => (
	<figure className='membrana m-0 flex flex-col gap-0 overflow-hidden p-1.5'>
		<Image
			src='/image/nortear/margen.jpg'
			alt={d.ui.altMargen}
			width={1337}
			height={151}
			sizes='(max-width: 768px) 100vw, 42rem'
			className='h-auto w-full rounded-[2px]'
		/>
		<figcaption className='flex flex-wrap items-baseline gap-x-3 px-4 pb-3 pt-3 font-pieza text-[10px] uppercase tracking-[.12em] text-mielina'>
			<span className='text-impulso'>{d.ui.margenDelDia}</span>
			<span>{d.ui.formulaMargen}</span>
		</figcaption>

		<details className='tiempo border-t border-sinapsis/15'>
			<summary className='flex cursor-pointer list-none items-center gap-3 px-4 py-2.5 font-rotulo text-[10px] font-semibold uppercase tracking-[.14em] text-sinapsis transition-colors duration-200 ease-impulso hover:text-impulso'>
				{d.ui.verPanelCompleto}
				<span className='marcador font-pieza text-[11px]' />
			</summary>
			<Image
				src='/image/nortear/dashboard.jpg'
				alt={d.ui.altPanel}
				width={1568}
				height={703}
				sizes='(max-width: 768px) 100vw, 42rem'
				className='h-auto w-full rounded-[2px]'
			/>
		</details>
	</figure>
);

export default NorteArFigura;
