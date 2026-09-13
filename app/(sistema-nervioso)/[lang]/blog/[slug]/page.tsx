import { FaArrowLeft } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import ReactMarkdown from "react-markdown";
import { Suspense, cache } from "react";
import { client } from "../../../../../sanity/lib/client";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { localizedPath, type Language } from "../../../../../entities/i18n";
import { getDict } from "../../../../src/i18n/dict";
import { alternates } from "../../../../src/i18n/meta";
import { es } from "date-fns/locale";
import { notFound } from "next/navigation";
import { postBySlugQuery } from "../../../../../sanity/lib/queries";
import { urlFor } from "../../../../../sanity/lib/image";
import ReadingProgress from "../../../../src/components/Blog/ReadingProgress";

const MermaidDiagram = dynamic(
	() => import("../../../../src/components/Blog/MermaidDiagram"),
	{ ssr: true },
);

interface Post {
	title: string;
	publishedAt: string;
	coverImage?: any;
	body?: any;
	markdownBody?: string;
	tags?: string[];
}

interface PageProps {
	params: Promise<{ slug: string; lang: Language }>;
}

const BASE_URL = "https://joaquinmussi.vercel.app";
const EXCERPT_LENGTH = 155;

const getPost = cache(
	(slug: string): Promise<Post | null> => client.fetch(postBySlugQuery, { slug }),
);

function extractExcerpt(post: Pick<Post, "body" | "markdownBody">): string {
	let raw = post.markdownBody ?? "";
	if (!raw) {
		if (!Array.isArray(post.body)) return "";
		const firstParagraph = post.body.find(
			(block: any) => block._type === "block" && block.style === "normal",
		);
		raw = firstParagraph?.children?.map((child: any) => child.text ?? "").join("") ?? "";
	}

	const clean = raw
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/[#*`>]/g, "")
		.replace(/\s+/g, " ")
		.trim();

	if (clean.length <= EXCERPT_LENGTH) return clean;
	const cut = clean.slice(0, EXCERPT_LENGTH);
	const lastSpace = cut.lastIndexOf(" ");
	return `${cut.slice(0, lastSpace > 0 ? lastSpace : EXCERPT_LENGTH)}…`;
}

const portableTextComponents = {
	types: {
		mermaidBlock: ({ value }: any) => <MermaidDiagram code={value.code} />,
	},
	block: {
		normal: ({ children }: any) => (
			<p className='m-0 mb-5 max-w-[68ch] break-words font-nota text-lg leading-relaxed'>
				{children}
			</p>
		),
		h1: ({ children }: any) => (
			<h1 className='mb-4 mt-10 text-2xl md:text-3xl'>{children}</h1>
		),
		h2: ({ children }: any) => (
			<h2 className='mb-3 mt-10 text-xl md:text-2xl'>{children}</h2>
		),
		h3: ({ children }: any) => (
			<h3 className='mb-2 mt-8 text-lg md:text-xl'>{children}</h3>
		),
		blockquote: ({ children }: any) => (
			<blockquote className='my-6 max-w-[62ch] border-l-2 border-impulso/60 pl-4 font-glosa text-xl italic leading-snug text-mielina'>
				{children}
			</blockquote>
		),
	},
	list: {
		bullet: ({ children }: any) => (
			<ul className='mb-5 max-w-[68ch] list-inside list-disc space-y-1 pl-5 font-nota text-lg leading-relaxed'>
				{children}
			</ul>
		),
		number: ({ children }: any) => (
			<ol className='mb-5 max-w-[68ch] list-inside list-decimal space-y-1 pl-5 font-nota text-lg leading-relaxed'>
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
			<strong className='font-medium text-senal'>{children}</strong>
		),
		em: ({ children }: any) => <em className='italic'>{children}</em>,
		code: ({ children }: any) => (
			<code className='bg-membrana-honda px-1.5 py-0.5 font-pieza text-[.9em] text-sinapsis'>
				{children}
			</code>
		),
		link: ({ children, value }: any) => (
			<a
				href={value?.href}
				target='_blank'
				rel='noopener noreferrer'
				className='text-sinapsis underline decoration-sinapsis/40 underline-offset-4 hover:text-impulso'
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
	const { slug, lang } = await params;
	const post = await getPost(slug);
	if (!post) return { title: "Post not found" };

	const description = extractExcerpt(post);
	const ogImage = post.coverImage
		? urlFor(post.coverImage).width(1200).height(630).url()
		: undefined;

	return {
		title: `${post.title} — Joaquín Mussi`,
		description,
		alternates: alternates(lang, `/blog/${slug}`),
		openGraph: {
			title: post.title,
			description,
			url: `${BASE_URL}${localizedPath(lang, `/blog/${slug}`)}`,
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

async function PostContent({ slug, lang }: { slug: string; lang: Language }) {
	const post = await getPost(slug);

	if (!post) return notFound();

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		description: extractExcerpt(post),
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
		url: `${BASE_URL}${localizedPath(lang, `/blog/${slug}`)}`,
		datePublished: post.publishedAt ?? undefined,
		dateModified: post.publishedAt ?? undefined,
		inLanguage: lang,
		...(post.coverImage && {
			image: urlFor(post.coverImage).width(1200).height(630).url(),
		}),
	};

	return (
		<article id='post-article' className='membrana marcas relative px-7 py-9 md:px-14 md:py-14'>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<h1 className='m-0 mb-4 text-3xl leading-tight md:text-5xl'>
				{post.title}
			</h1>

			{post.publishedAt && (
				<p className='m-0 mb-8 font-pieza text-xs text-sinapsis'>
					{lang === "en"
						? format(new Date(post.publishedAt), "MMMM d, yyyy")
						: format(new Date(post.publishedAt), "d 'de' MMMM 'de' yyyy", {
								locale: es,
							})}
				</p>
			)}

			{post.coverImage && (
				<div className='relative mb-10 h-64 w-full overflow-hidden border border-sinapsis/30 md:h-96'>
					<Image
						src={urlFor(post.coverImage).width(1200).height(600).url()}
						alt={post.coverImage.alt || post.title}
						fill
						className='object-cover'
					/>
				</div>
			)}

			<div className='break-words'>
				{post.markdownBody ? (
					<ReactMarkdown
						components={{
							p: ({ children }) => <p className='m-0 mb-5 max-w-[68ch] break-words font-nota text-lg leading-relaxed'>{children}</p>,
							h1: ({ children }) => <h1 className='mb-4 mt-10 text-2xl md:text-3xl'>{children}</h1>,
							h2: ({ children }) => <h2 className='mb-3 mt-10 text-xl md:text-2xl'>{children}</h2>,
							h3: ({ children }) => <h3 className='mb-2 mt-8 text-lg md:text-xl'>{children}</h3>,
							blockquote: ({ children }) => <blockquote className='my-6 max-w-[62ch] border-l-2 border-impulso/60 pl-4 font-glosa text-xl italic leading-snug text-mielina'>{children}</blockquote>,
							ul: ({ children }) => <ul className='mb-5 max-w-[68ch] list-inside list-disc space-y-1 pl-5 font-nota text-lg leading-relaxed'>{children}</ul>,
							ol: ({ children }) => <ol className='mb-5 max-w-[68ch] list-inside list-decimal space-y-1 pl-5 font-nota text-lg leading-relaxed'>{children}</ol>,
							li: ({ children }) => <li className='break-words'>{children}</li>,
							strong: ({ children }) => <strong className='font-medium text-senal'>{children}</strong>,
							em: ({ children }) => <em className='italic'>{children}</em>,
							code: ({ className, children }) => {
								const lang = /language-(\w+)/.exec(className ?? "")?.[1];
								if (lang === "mermaid") return <MermaidDiagram code={String(children).trim()} />;
								return <code className='bg-membrana-honda px-1.5 py-0.5 font-pieza text-[.9em] text-sinapsis'>{children}</code>;
							},
							a: ({ children, href }) => <a href={href} target='_blank' rel='noopener noreferrer' className='text-sinapsis underline decoration-sinapsis/40 underline-offset-4 hover:text-impulso'>{children}</a>,
						}}
					>
						{post.markdownBody}
					</ReactMarkdown>
				) : (
					<PortableText value={post.body} components={portableTextComponents} />
				)}
			</div>

			{post.tags && post.tags.length > 0 && (
				<div className='mt-10 flex flex-wrap gap-2'>
					{post.tags.map((tag) => (
						<span
							key={tag}
							className='border border-sinapsis/50 px-2.5 py-1 font-pieza text-[11px] text-sinapsis'
						>
							{tag}
						</span>
					))}
				</div>
			)}
		</article>
	);
}

function PostSkeleton() {
	return (
		<div className='membrana px-7 py-9 md:px-14 md:py-14'>
			<div className='h-8 w-2/3 bg-sinapsis/15 mb-3' />
			<div className='h-8 w-1/2 bg-sinapsis/15 mb-3' />
			<div className='h-3 w-36 bg-sinapsis/15 mb-8' />
			<div className='w-full h-64 md:h-96 bg-sinapsis/15 mb-10' />
			<div className='max-w-3xl flex flex-col gap-3'>
				{Array.from({ length: 5 }).map((_, i) => (
					<div
						key={i}
						className={`h-4 bg-sinapsis/15 ${i % 4 === 3 ? "w-2/3" : "w-full"}`}
					/>
				))}
				<div className='mt-6 flex flex-col gap-3'>
					<div className='h-4 w-full bg-sinapsis/15' />
					<div className='h-4 w-5/6 bg-sinapsis/15' />
					<div className='h-4 w-11/12 bg-sinapsis/15' />
					<div className='h-4 w-3/4 bg-sinapsis/15' />
				</div>
			</div>
			<div className='mt-10 flex gap-2'>
				<div className='h-6 w-16 bg-sinapsis/15' />
				<div className='h-6 w-20 bg-sinapsis/15' />
			</div>
		</div>
	);
}

export default async function PostPage({ params }: PageProps) {
	const { slug, lang } = await params;
	const d = getDict(lang);

	return (
		<main className='sistema min-h-screen px-5 py-12 md:px-16 md:py-16'>
			<ReadingProgress targetId='post-article' />
			<div className='mx-auto flex max-w-[760px] flex-col gap-8'>
				<div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-sinapsis/20 pb-4'>
					<Link
						href={localizedPath(lang, "/#paso-4")}
						className='inline-flex w-fit items-center gap-2 font-rotulo text-xs font-semibold uppercase tracking-[.12em] text-sinapsis transition-colors duration-200 ease-impulso hover:text-impulso'
					>
						<FaArrowLeft size={11} />
						{d.blog.volver}
					</Link>
					<Link
						href={localizedPath(lang, "/")}
						className='font-pieza text-[10px] uppercase tracking-[.18em] text-mielina transition-colors duration-200 ease-impulso hover:text-impulso'
					>
						Joaquín Mussi
					</Link>
				</div>

				<Suspense fallback={<PostSkeleton />}>
					<PostContent slug={slug} lang={lang} />
				</Suspense>
			</div>
		</main>
	);
}
