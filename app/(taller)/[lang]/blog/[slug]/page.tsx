import { FaArrowLeft } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import ReactMarkdown from "react-markdown";
import { Suspense } from "react";
import { client } from "../../../../../sanity/lib/client";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { ruta, type Idioma } from "../../../../../entities/i18n";
import { alternativas } from "../../../../src/i18n/meta";
import { es } from "date-fns/locale";
import { notFound } from "next/navigation";
import { postBySlugQuery } from "../../../../../sanity/lib/queries";
import { urlFor } from "../../../../../sanity/lib/image";

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
	params: Promise<{ slug: string; lang: Idioma }>;
}

const BASE_URL = "https://joaquinmussi.vercel.app";

function extractExcerpt(post: Pick<Post, "body" | "markdownBody">): string {
	if (post.markdownBody) {
		return post.markdownBody.replace(/[#*`>\[\]]/g, "").slice(0, 160);
	}
	if (!Array.isArray(post.body)) return "";
	const firstParagraph = post.body.find(
		(block: any) => block._type === "block" && block.style === "normal",
	);
	return (
		firstParagraph?.children
			?.map((child: any) => child.text ?? "")
			.join("")
			.slice(0, 160) ?? ""
	);
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
			<blockquote className='my-6 max-w-[62ch] border-l-2 border-marca/60 pl-4 font-lapiz text-[23px] leading-snug text-texto-medio'>
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
			<strong className='font-medium text-texto'>{children}</strong>
		),
		em: ({ children }: any) => <em className='italic'>{children}</em>,
		code: ({ children }: any) => (
			<code className='bg-hoja-honda px-1.5 py-0.5 font-pieza text-[.9em] text-linea'>
				{children}
			</code>
		),
		link: ({ children, value }: any) => (
			<a
				href={value?.href}
				target='_blank'
				rel='noopener noreferrer'
				className='text-linea underline decoration-linea/40 underline-offset-4 hover:text-marca'
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
	const post: Post | null = await client.fetch(postBySlugQuery, { slug });
	if (!post) return { title: "Post not found" };

	const description = extractExcerpt(post);
	const ogImage = post.coverImage
		? urlFor(post.coverImage).width(1200).height(630).url()
		: undefined;

	return {
		title: `${post.title} — Joaquín Mussi`,
		description,
		alternates: alternativas(lang, `/blog/${slug}`),
		openGraph: {
			title: post.title,
			description,
			url: `${BASE_URL}${ruta(lang, `/blog/${slug}`)}`,
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
		url: `${BASE_URL}/blog/${slug}`,
		datePublished: post.publishedAt ?? undefined,
		...(post.coverImage && {
			image: urlFor(post.coverImage).width(1200).height(630).url(),
		}),
	};

	return (
		<article className='hoja marcas relative px-7 py-9 md:px-14 md:py-14'>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<h1 className='m-0 mb-4 text-3xl leading-tight md:text-5xl'>
				{post.title}
			</h1>

			{post.publishedAt && (
				<p className='m-0 mb-8 font-pieza text-xs text-linea'>
					{format(new Date(post.publishedAt), "d 'de' MMMM 'de' yyyy", { locale: es })}
				</p>
			)}

			{post.coverImage && (
				<div className='relative mb-10 h-64 w-full overflow-hidden border border-linea/30 md:h-96'>
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
							blockquote: ({ children }) => <blockquote className='my-6 max-w-[62ch] border-l-2 border-marca/60 pl-4 font-lapiz text-[23px] leading-snug text-texto-medio'>{children}</blockquote>,
							ul: ({ children }) => <ul className='mb-5 max-w-[68ch] list-inside list-disc space-y-1 pl-5 font-nota text-lg leading-relaxed'>{children}</ul>,
							ol: ({ children }) => <ol className='mb-5 max-w-[68ch] list-inside list-decimal space-y-1 pl-5 font-nota text-lg leading-relaxed'>{children}</ol>,
							li: ({ children }) => <li className='break-words'>{children}</li>,
							strong: ({ children }) => <strong className='font-medium text-texto'>{children}</strong>,
							em: ({ children }) => <em className='italic'>{children}</em>,
							code: ({ className, children }) => {
								const lang = /language-(\w+)/.exec(className ?? "")?.[1];
								if (lang === "mermaid") return <MermaidDiagram code={String(children).trim()} />;
								return <code className='bg-hoja-honda px-1.5 py-0.5 font-pieza text-[.9em] text-linea'>{children}</code>;
							},
							a: ({ children, href }) => <a href={href} target='_blank' rel='noopener noreferrer' className='text-linea underline decoration-linea/40 underline-offset-4 hover:text-marca'>{children}</a>,
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
							className='border border-linea/50 px-2.5 py-1 font-pieza text-[11px] text-linea'
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
		<div className='hoja px-7 py-9 md:px-14 md:py-14'>
			<div className='h-8 w-2/3 bg-linea/15 mb-3' />
			<div className='h-8 w-1/2 bg-linea/15 mb-3' />
			<div className='h-3 w-36 bg-linea/15 mb-8' />
			<div className='w-full h-64 md:h-96 bg-linea/15 mb-10' />
			<div className='max-w-3xl flex flex-col gap-3'>
				{Array.from({ length: 5 }).map((_, i) => (
					<div
						key={i}
						className={`h-4 bg-linea/15 ${i % 4 === 3 ? "w-2/3" : "w-full"}`}
					/>
				))}
				<div className='mt-6 flex flex-col gap-3'>
					<div className='h-4 w-full bg-linea/15' />
					<div className='h-4 w-5/6 bg-linea/15' />
					<div className='h-4 w-11/12 bg-linea/15' />
					<div className='h-4 w-3/4 bg-linea/15' />
				</div>
			</div>
			<div className='mt-10 flex gap-2'>
				<div className='h-6 w-16 bg-linea/15' />
				<div className='h-6 w-20 bg-linea/15' />
			</div>
		</div>
	);
}

export default async function PostPage({ params }: PageProps) {
	const { slug, lang } = await params;

	return (
		<main className='taller min-h-screen px-5 py-12 md:px-16 md:py-16'>
			{/* Una nota se lee: la hoja es más angosta que el registro. */}
			<div className='mx-auto flex max-w-[880px] flex-col gap-8'>
				<Link
					href={ruta(lang, '/blog')}
					className='inline-flex w-fit items-center gap-2 font-rotulo text-xs font-semibold uppercase tracking-[.12em] text-linea hover:text-marca'
				>
					<FaArrowLeft size={11} />
					Volver al cuaderno
				</Link>

				<Suspense fallback={<PostSkeleton />}>
					<PostContent slug={slug} />
				</Suspense>
			</div>
		</main>
	);
}
