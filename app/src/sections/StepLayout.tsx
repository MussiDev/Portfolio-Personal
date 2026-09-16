import type { ReactNode } from "react";

export const Step = ({
	n,
	title,
	gloss,
	fact,
	wide,
	children,
}: {
	n: number;
	title: string;
	gloss?: string;
	fact?: string;
	wide?: boolean;
	children: ReactNode;
}) => (
	<section
		id={`paso-${n}`}
		data-step={n}
		className='pointer-events-none flex min-h-[100svh] items-center px-5 py-16 md:px-10 md:py-24 lg:px-16'
	>
		<div
			data-revelar
			className={`pointer-events-auto ml-auto w-full ${
				wide ? "max-w-[68rem] md:w-[86%]" : "max-w-[42rem] md:w-[54%]"
			}`}
		>
			<header className='mb-7 flex items-start gap-3 sm:gap-4 md:mb-9'>
				<span
					data-drop-target
					aria-hidden='true'
					className='mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-[3px] sm:h-9 sm:w-9 border border-impulso/45 bg-impulso/5 font-pieza text-[11px] tabular-nums text-impulso shadow-[0_0_18px_-4px_rgb(255_106_58/.55)]'
				>
					{String(n).padStart(2, "0")}
				</span>
				<div className='flex min-w-0 flex-col gap-1.5'>
					<h2 className='m-0 text-2xl leading-[.95] [overflow-wrap:anywhere] hyphens-auto sm:text-3xl md:text-4xl'>
						{title}
					</h2>
					{gloss && (
						<span className='font-glosa text-lg italic leading-none text-mielina'>
							{gloss}
						</span>
					)}
					{fact && (
						<span className='mt-1 font-pieza text-[10px] uppercase tracking-[.16em] text-sinapsis'>
							{fact}
						</span>
					)}
				</div>
			</header>
			{children}
		</div>
	</section>
);

export const Card = ({
	children,
	className = "",
}: {
	children: ReactNode;
	className?: string;
}) => (
	<div className={`membrana flex flex-col gap-3 px-6 py-5 ${className}`}>
		{children}
	</div>
);
