/**
 * Una cota.
 *
 * En un plano la cota no decora: mide. Acá mide lo mismo que mediría en
 * papel — cuánto duró algo, cuántas piezas tiene — con las marcas de
 * extremo y el valor sobre la línea. Si no hay un valor real que poner,
 * no se dibuja la cota.
 */
const Cota = ({ valor, className = "" }: { valor: string; className?: string }) => (
	<span
		className={`inline-flex items-center gap-2 text-linea ${className}`}
		aria-hidden='true'
	>
		<svg width='14' height='9' viewBox='0 0 14 9' className='shrink-0'>
			<path d='M1 0v9M1 4.5h13' stroke='currentColor' strokeWidth='1' fill='none' />
		</svg>
		<span className='font-pieza text-[11px] tabular-nums tracking-tight'>
			{valor}
		</span>
		<svg width='14' height='9' viewBox='0 0 14 9' className='shrink-0'>
			<path d='M13 0v9M0 4.5h13' stroke='currentColor' strokeWidth='1' fill='none' />
		</svg>
	</span>
);

export default Cota;
