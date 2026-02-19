import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { client } from "../../../sanity/lib/client";
import { format } from "date-fns";
import { postsQuery } from "../../../sanity/lib/queries";
import { urlFor } from "../../../sanity/lib/image";

export const dynamic = "force-dynamic";

interface Post {
	_id: string;
	title: string;
	slug: string;
	publishedAt: string;
	coverImage: any;
	tags: string[];
}

async function BlogGrid() {
	const posts: Post[] = await client.fetch(postsQuery);

	if (posts.length === 0) {
		return <p className='text-gray-500'>No posts yet. Check back soon.</p>;
	}

	return (
		<div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
			{posts.map((post) => (
				<Link
					key={post._id}
					href={`/blog/${post.slug}`}
					className='flex flex-col border border-slate-700 rounded-xl overflow-hidden hover:border-orange-700 transition-colors duration-300'
				>
					{post.coverImage ? (
						<div className='relative w-full h-48'>
							<Image
								src={urlFor(post.coverImage).width(600).height(400).url()}
								alt={post.coverImage.alt || post.title}
								fill
								className='object-cover'
							/>
						</div>
					) : (
						<div className='w-full h-48 bg-slate-700 flex items-center justify-center'>
							<span className='text-gray-500 text-sm'>No image</span>
						</div>
					)}

					<div className='flex flex-col gap-3 p-5'>
						<h2 className='text-base font-semibold leading-snug text-white'>
							{post.title}
						</h2>

						{post.publishedAt && (
							<p className='text-xs text-gray-400'>
								{format(new Date(post.publishedAt), "MMMM dd, yyyy")}
							</p>
						)}

						{post.tags?.length > 0 && (
							<div className='flex flex-wrap gap-2'>
								{post.tags.map((tag) => (
									<span
										key={tag}
										className='text-xs px-3 py-1 rounded-full border border-slate-600 text-gray-300'
									>
										{tag}
									</span>
								))}
							</div>
						)}
					</div>
				</Link>
			))}
		</div>
	);
}

function BlogGridSkeleton() {
	return (
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
	);
}

export default function BlogPage() {
	return (
		<main className='max-w-[77.5rem] mx-auto px-4 py-16 min-h-screen'>
			<h1 className='text-4xl font-bold mb-2 text-white'>
				Blog<span className='text-orange-700'>.</span>
			</h1>
			<p className='text-gray-400 text-sm mb-10 uppercase tracking-widest'>
				Articles & thoughts
			</p>
			<Suspense fallback={<BlogGridSkeleton />}>
				<BlogGrid />
			</Suspense>
		</main>
	);
}
