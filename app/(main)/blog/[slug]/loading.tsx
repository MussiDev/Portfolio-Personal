export default function PostLoading() {
	return (
		<main className='max-w-[77.5rem] mx-auto px-4 py-16'>
			<div className='h-4 w-28 shimmer rounded mb-10' />

			<div className='h-8 w-2/3 shimmer rounded mb-3' />
			<div className='h-8 w-1/2 shimmer rounded mb-3' />
			<div className='h-3 w-36 shimmer rounded mb-8' />

			<div className='w-full h-64 md:h-96 shimmer rounded-xl mb-10' />

			<div className='max-w-3xl flex flex-col gap-3'>
				{Array.from({ length: 5 }).map((_, i) => (
					<div
						key={i}
						className={`h-4 shimmer rounded ${i % 4 === 3 ? "w-2/3" : "w-full"}`}
					/>
				))}
				<div className='mt-6 flex flex-col gap-3'>
					<div className='h-4 w-full shimmer rounded' />
					<div className='h-4 w-5/6 shimmer rounded' />
					<div className='h-4 w-11/12 shimmer rounded' />
					<div className='h-4 w-3/4 shimmer rounded' />
				</div>
			</div>

			<div className='mt-10 flex gap-2'>
				<div className='h-6 w-16 shimmer rounded-full' />
				<div className='h-6 w-20 shimmer rounded-full' />
			</div>
		</main>
	);
}
