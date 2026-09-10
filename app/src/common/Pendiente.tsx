/**
 * Un hueco marcado.
 *
 * El taller no rellena lo que todavía no existe: lo señala. Va a lápiz
 * porque es exactamente eso — una anotación a mano sobre el dibujo, no
 * parte del dibujo.
 */
const Pendiente = ({ children }: { children: React.ReactNode }) => (
	<p className='flex max-w-[62ch] items-baseline gap-3 border-l-2 border-marca/60 pl-4 font-lapiz text-[21px] leading-snug text-texto-medio'>
		<span className='shrink-0 font-rotulo text-[10px] uppercase tracking-[.14em] text-marca'>
			Falta
		</span>
		{children}
	</p>
);

export default Pendiente;
