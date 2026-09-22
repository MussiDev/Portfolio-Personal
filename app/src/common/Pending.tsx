const Pending = ({
	children,
	label = "Falta",
}: {
	children: React.ReactNode;
	label?: string;
}) => (
	<p className='flex max-w-[62ch] items-baseline gap-3 border-l-2 border-impulse/60 pl-4 font-gloss italic text-[16px] leading-snug text-myelin'>
		<span className='shrink-0 font-label text-[10px] uppercase tracking-[.14em] text-impulse'>
			{label}
		</span>
		{children}
	</p>
);

export default Pending;
