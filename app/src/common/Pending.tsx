const Pending = ({
	children,
	label = "Falta",
}: {
	children: React.ReactNode;
	label?: string;
}) => (
	<p className='flex max-w-[62ch] items-baseline gap-3 border-l-2 border-impulso/60 pl-4 font-glosa italic text-[16px] leading-snug text-mielina'>
		<span className='shrink-0 font-rotulo text-[10px] uppercase tracking-[.14em] text-impulso'>
			{label}
		</span>
		{children}
	</p>
);

export default Pending;
