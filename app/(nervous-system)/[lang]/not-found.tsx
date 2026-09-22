import Link from "next/link";

/**
 * not-found receives no params, so it cannot know the language. It speaks
 * both, each marked with its own lang for screen readers, and links to both
 * homes.
 */
const NotFound = () => (
	<main className='nervous-system flex min-h-[100svh] items-center px-5 py-16 md:px-16'>
		<div className='mx-auto flex w-full max-w-[42rem] flex-col gap-6'>
			<p className='m-0 flex items-center gap-3 font-mono text-xs uppercase tracking-[.16em] text-impulse'>
				<span aria-hidden='true' className='h-1.5 w-1.5 animate-breathe rounded-full bg-impulse' />
				404 · sin señal / no signal
			</p>
			<h1 lang='es' className='m-0 text-3xl leading-[.95] sm:text-4xl md:text-5xl'>
				Esta ruta no llega a ninguna región
			</h1>
			<p lang='en' className='m-0 font-gloss text-xl italic leading-snug text-myelin md:text-2xl'>
				This path doesn&apos;t reach any region.
			</p>
			<div className='flex flex-wrap gap-x-8 gap-y-3 border-t border-synapse/25 pt-5'>
				<Link
					href='/'
					lang='es'
					className='inline-flex min-h-11 items-center font-label text-xs font-bold uppercase tracking-[.14em] text-impulse transition-colors duration-200 ease-impulse hover:text-signal'
				>
					<span className='inline-flex items-center gap-2 border-b border-current pb-0.5'>
						Volver al inicio <span aria-hidden='true'>→</span>
					</span>
				</Link>
				<Link
					href='/en'
					lang='en'
					className='inline-flex min-h-11 items-center font-label text-xs font-bold uppercase tracking-[.14em] text-synapse transition-colors duration-200 ease-impulse hover:text-impulse'
				>
					<span className='border-b border-current pb-0.5'>Back to home</span>
				</Link>
			</div>
		</div>
	</main>
);

export default NotFound;
