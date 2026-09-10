export default function BlogLoading() {
	return (
		<main className='max-w-[77.5rem] mx-auto px-4 py-16 min-h-screen'>
			<div className='h-10 w-24 shimmer rounded mb-2' />
			<div className='h-4 w-48 shimmer rounded mb-10' />

			<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={i}
						className='flex flex-col border border-slate-700 rounded-xl overflow-hidden'
					>
						<div className='w-full h-48 shimmer' />
						<div className='flex flex-col gap-3 p-5'>
							<div className='h-4 w-full shimmer rounded' />
							<div className='h-4 w-3/4 shimmer rounded' />
							<div className='h-3 w-28 shimmer rounded' />
							<div className='flex gap-2 mt-1'>
								<div className='h-6 w-16 shimmer rounded-full' />
								<div className='h-6 w-20 shimmer rounded-full' />
							</div>
						</div>
					</div>
				))}
			</div>
		</main>
	);
}
