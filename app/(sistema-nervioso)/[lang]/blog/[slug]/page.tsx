import Link from "next/link";
import { Suspense, cache } from "react";
import { client } from "../../../../../sanity/lib/client";
import {
	DEFAULT_LANGUAGE,
	localizedPath,
	type Language,
} from "../../../../../entities/i18n";
import { SITE_URL } from "../../../../../entities/site";
import { toJsonLdScript } from "../../../../../entities/jsonLd";
import { formatPostDate } from "../../../../src/components/Blog/postDate";
import { getDict } from "../../../../src/i18n/dict";
import { alternates } from "../../../../src/i18n/meta";
import { notFound } from "next/navigation";
import { postBySlugQuery, postsQuery } from "../../../../../sanity/lib/queries";
import ReadingProgress from "../../../../src/components/Blog/ReadingProgress";
import PostBody from "../../../../src/components/Blog/PostBody";
import PostCover from "../../../../src/components/Blog/PostCover";
import { limpiarTitulo } from "../../../../src/components/Blog/title";
import {
	extractExcerpt,
	type PortableTextBlock,
} from "../../../../src/components/Blog/excerpt";

interface Post {
	_updatedAt?: string;
	title: string;
	publishedAt: string;
	body?: PortableTextBlock[];
	markdownBody?: string;
	tags?: string[];
}

interface PageProps {
	params: Promise<{ slug: string; lang: Language }>;
}

const BASE_URL = SITE_URL;

const getPost = cache(
	(slug: string): Promise<Post | null> => client.fetch(postBySlugQuery, { slug }),
);

type PostSummary = { slug: string; title: string };

const getAllPosts = cache(
	(): Promise<PostSummary[]> => client.fetch(postsQuery),
);

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
	const title = limpiarTitulo(post.title);

	return {
		title: `${title} — Joaquín Mussi`,
		description,
		// El blog vive en Sanity solo en español: no declarar un hreflang "en"
		// que no tiene traducción real detrás (ver proxy.ts).
		alternates: alternates(lang, `/blog/${slug}`, false),
		// Sin `images`: la tarjeta la pone opengraph-image.tsx de esta misma
		// carpeta, y declarar el campo acá —aunque sea con []— le gana al
		// archivo y deja la nota sin imagen al compartirla. Mismo trato que
		// en proyectos/[slug].
		openGraph: {
			title,
			description,
			url: `${BASE_URL}${localizedPath(DEFAULT_LANGUAGE, `/blog/${slug}`)}`,
			type: "article",
			publishedTime: post.publishedAt,
			authors: ["Joaquín Mussi"],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
		},
	};
}

async function PostContent({ slug, lang }: { slug: string; lang: Language }) {
	const post = await getPost(slug);

	if (!post) return notFound();

	const d = getDict(lang);
	const title = limpiarTitulo(post.title);
	const breadcrumbJsonLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Joaquín Mussi", item: BASE_URL },
			{
				// /blog, no /#paso-4: el breadcrumb debe apuntar a una URL
				// indexable por sí misma. La sección 4 de la home es un ancla
				// dentro de otra página, no el padre del post.
				"@type": "ListItem",
				position: 2,
				name: d.blog.titulo,
				item: `${BASE_URL}${localizedPath(DEFAULT_LANGUAGE, "/blog")}`,
			},
			{
				"@type": "ListItem",
				position: 3,
				name: title,
				item: `${BASE_URL}${localizedPath(DEFAULT_LANGUAGE, `/blog/${slug}`)}`,
			},
		],
	};

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: title,
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
		url: `${BASE_URL}${localizedPath(DEFAULT_LANGUAGE, `/blog/${slug}`)}`,
		datePublished: post.publishedAt ?? undefined,
		// _updatedAt de Sanity: antes esto repetía publishedAt, o sea que le
		// declaraba a Google que ninguna nota se editó nunca — justo la señal
		// que usa para saber si vale la pena volver a rastrearla.
		dateModified: post._updatedAt ?? post.publishedAt ?? undefined,
		// El contenido del blog es español, siempre — no lo que declare la ruta.
		inLanguage: DEFAULT_LANGUAGE,
		// Sin `image`: la portada ahora la genera opengraph-image.tsx, y Next
		// le pone al archivo un sufijo y un hash propios
		// (…/opengraph-image-1lndgs?fb20b39…) que no se pueden escribir a
		// mano — armar la URL acá daba un 404 dentro del structured data.
		// La tarjeta igual viaja en og:image, que es de donde Google la
		// levanta. Mismo criterio que proyectos/[slug]: un schema incompleto
		// es mejor que uno inventado.
	};

	const allPosts = await getAllPosts();
	const idx = allPosts.findIndex((p) => p.slug === slug);
	const olderPost = idx >= 0 ? allPosts[idx + 1] : undefined;
	const newerPost = idx >= 0 && idx > 0 ? allPosts[idx - 1] : undefined;

	return (
		<>
		<article id='post-article' className='entra entra-2 membrana marcas relative px-7 py-9 md:px-14 md:py-14'>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: toJsonLdScript(jsonLd) }}
			/>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: toJsonLdScript(breadcrumbJsonLd) }}
			/>
			<h1 className='m-0 mb-4 text-3xl leading-tight md:text-5xl'>
				{title}
			</h1>

			{post.publishedAt && (
				<p className='m-0 mb-8 font-pieza text-xs text-sinapsis'>
					{formatPostDate(post.publishedAt, lang)}
				</p>
			)}

			{/* La portada sale del tejido del propio sitio, no de un banco de
			imágenes (ver PostCover.tsx). Es SVG en el HTML del server: ya no
			hay una imagen que descargar, así que tampoco hace falta pelearle
			al LCP con `priority` y `sizes` como con la portada anterior. */}
			<PostCover slug={slug} tagCount={post.tags?.length ?? 0} />

			<PostBody body={post.body} markdownBody={post.markdownBody} />

			{post.tags && post.tags.length > 0 && (
				<div className='mt-10 flex flex-wrap gap-2'>
					{post.tags.map((tag) => (
						<Link
							key={tag}
							href={localizedPath(lang, `/blog/tag/${tag}`)}
							className='border border-sinapsis/50 px-2.5 py-1 font-pieza text-[11px] text-sinapsis transition-colors duration-200 ease-impulso hover:border-impulso hover:text-impulso'
						>
							{tag}
						</Link>
					))}
				</div>
			)}
		</article>

		{(olderPost || newerPost) && (
			<nav
				aria-label={`${d.blog.anterior} / ${d.blog.siguiente}`}
				className='grid grid-cols-1 gap-4 border-t border-sinapsis/20 pt-6 sm:grid-cols-2'
			>
				<div>
					{olderPost && (
						<Link
							href={localizedPath(lang, `/blog/${olderPost.slug}`)}
							className='group flex flex-col gap-1'
						>
							<span className='font-pieza text-[10px] uppercase tracking-[.14em] text-sinapsis'>
								← {d.blog.anterior}
							</span>
							<span className='font-rotulo text-sm text-mielina transition-colors duration-200 ease-impulso group-hover:text-impulso'>
								{limpiarTitulo(olderPost.title)}
							</span>
						</Link>
					)}
				</div>
				<div className='sm:text-right'>
					{newerPost && (
						<Link
							href={localizedPath(lang, `/blog/${newerPost.slug}`)}
							className='group flex flex-col gap-1 sm:items-end'
						>
							<span className='font-pieza text-[10px] uppercase tracking-[.14em] text-sinapsis'>
								{d.blog.siguiente} →
							</span>
							<span className='font-rotulo text-sm text-mielina transition-colors duration-200 ease-impulso group-hover:text-impulso'>
								{limpiarTitulo(newerPost.title)}
							</span>
						</Link>
					)}
				</div>
			</nav>
		)}
		</>
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
				<div className='entra entra-1 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-sinapsis/20 pb-4'>
					<Link
						href={localizedPath(lang, "/blog")}
						className='inline-flex w-fit items-center gap-2 font-rotulo text-xs font-semibold uppercase tracking-[.12em] text-sinapsis transition-colors duration-200 ease-impulso hover:text-impulso'
					>
						<svg
							width='11'
							height='11'
							viewBox='0 0 448 512'
							fill='currentColor'
							aria-hidden='true'
						>
							<path d='M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z' />
						</svg>
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
