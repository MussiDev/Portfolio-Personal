import { FaArrowLeft } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { Suspense } from "react";
import { client } from "../../../../sanity/lib/client";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { postBySlugQuery } from "../../../../sanity/lib/queries";
import { urlFor } from "../../../../sanity/lib/image";

interface Post {
	title: string;
	publishedAt: string;
	coverImage?: any;
	body: any;
	tags?: string[];
}

interface PageProps {
	params: Promise<{ slug: string }>;
}

const BASE_URL = "https://joaquinmussi.vercel.app";

function extractExcerpt(body: any[]): string {
	if (!Array.isArray(body)) return "";
	const firstParagraph = body.find(
		(block) => block._type === "block" && block.style === "normal",
	);
	return (
		firstParagraph?.children
			?.map((child: any) => child.text ?? "")
			.join("")
			.slice(0, 160) ?? ""
	);
}

const portableTextComponents = {
	block: {
		normal: ({ children }: any) => (
			<p className='text-gray-300 leading-relaxed mb-4 break-words'>
				{children}
			</p>
		),
		h1: ({ children }: any) => (
			<h1 className='text-3xl font-bold text-white mt-8 mb-4'>{children}</h1>
		),
		h2: ({ children }: any) => (
			<h2 className='text-2xl font-bold text-white mt-8 mb-3'>{children}</h2>
		),
		h3: ({ children }: any) => (
			<h3 className='text-xl font-semibold text-white mt-6 mb-2'>{children}</h3>
		),
		blockquote: ({ children }: any) => (
			<blockquote className='border-l-4 border-orange-700 pl-4 text-gray-400 italic my-4'>
				{children}
			</blockquote>
		),
	},
	list: {
		bullet: ({ children }: any) => (
			<ul className='list-disc list-inside pl-5 text-gray-300 mb-4 space-y-1'>
				{children}
			</ul>
		),
		number: ({ children }: any) => (
			<ol className='list-decimal list-inside pl-5 text-gray-300 mb-4 space-y-1'>
				{children}
			</ol>
		),
	},
	listItem: {
		bullet: ({ children }: any) => <li className='break-words'>{children}</li>,
		number: ({ children }: any) => <li className='break-words'>{children}</li>,
	},
	marks: {
		strong: ({ children }: any) => (
			<strong className='font-semibold text-white'>{children}</strong>
		),
		em: ({ children }: any) => <em className='italic'>{children}</em>,
		code: ({ children }: any) => (
			<code className='bg-slate-700 text-orange-400 px-1.5 py-0.5 rounded text-sm font-mono'>
				{children}
			</code>
		),
		link: ({ children, value }: any) => (
			<a
				href={value?.href}
				target='_blank'
				rel='noopener noreferrer'
				className='text-orange-700 underline hover:opacity-80 transition-opacity'
			>
				{children}
			</a>
		),
	},
};

export async function generateStaticParams() {
	const posts: { slug: string }[] = await client.fetch(
		`*[_type=="post"]{ "slug": slug.current }`,
	);
	return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps) {
	const { slug } = await params;
	const post: Post | null = await client.fetch(postBySlugQuery, { slug });
	if (!post) return { title: "Post not found" };

	const description = extractExcerpt(post.body);
	const ogImage = post.coverImage
		? urlFor(post.coverImage).width(1200).height(630).url()
		: undefined;

	return {
		title: `${post.title} — Joaquín Mussi`,
		description,
		alternates: {
			canonical: `${BASE_URL}/blog/${slug}`,
		},
		openGraph: {
			title: post.title,
			description,
			url: `${BASE_URL}/blog/${slug}`,
			type: "article",
			publishedTime: post.publishedAt,
			authors: ["Joaquín Mussi"],
			images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : [],
		},
		twitter: {
			card: "summary_large_image",
			title: post.title,
			description,
			images: ogImage ? [ogImage] : [],
		},
	};
}

async function PostContent({ slug }: { slug: string }) {
	const post: Post | null = await client.fetch(postBySlugQuery, { slug });

	if (!post) return notFound();

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		description: extractExcerpt(post.body),
		author: {
			"@type": "Person",
			name: "Joaquín Mussi",
			url: BASE_URL,
		},
		publisher: {
			"@type": "Person",
			name: "Joaquín Mussi",
			url: BASE_URL,
		},
		url: `${BASE_URL}/blog/${slug}`,
		datePublished: post.publishedAt ?? undefined,
		...(post.coverImage && {
			image: urlFor(post.coverImage).width(1200).height(630).url(),
		}),
	};

	return (
		<>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<h1 className='text-3xl md:text-4xl font-bold text-white mb-3'>
				{post.title}
			</h1>

			{post.publishedAt && (
				<p className='text-sm text-gray-400 mb-8 uppercase tracking-widest'>
					{format(new Date(post.publishedAt), "MMMM dd, yyyy")}
				</p>
			)}

			{post.coverImage && (
				<div className='relative w-full h-64 md:h-96 mb-10 rounded-xl overflow-hidden'>
					<Image
						src={urlFor(post.coverImage).width(1200).height(600).url()}
						alt={post.coverImage.alt || post.title}
						fill
						className='object-cover'
					/>
				</div>
			)}

			<article className='max-w-3xl break-words'>
				<PortableText value={post.body} components={portableTextComponents} />
			</article>

			{post.tags && post.tags.length > 0 && (
				<div className='mt-10 flex flex-wrap gap-2'>
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
		</>
	);
}

function PostSkeleton() {
	return (
		<>
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
		</>
	);
}

export default async function PostPage({ params }: PageProps) {
	const { slug } = await params;

	return (
		<main className='max-w-[77.5rem] mx-auto px-4 py-16'>
			<Link
				href='/blog'
				className='inline-flex items-center gap-2 text-gray-400 hover:text-orange-700 transition-colors text-sm mb-10'
			>
				<FaArrowLeft size={12} />
				Back to Blog
			</Link>

			<Suspense fallback={<PostSkeleton />}>
				<PostContent slug={slug} />
			</Suspense>
		</main>
	);
}
