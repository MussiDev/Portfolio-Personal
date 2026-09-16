import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LANGUAGES, localizedPath, type Language } from "../../../../../../entities/i18n";
import { alternates } from "../../../../../src/i18n/meta";
import { getDict } from "../../../../../src/i18n/dict";
import { client } from "../../../../../../sanity/lib/client";
import { allTagsQuery, postsByTagQuery } from "../../../../../../sanity/lib/queries";

type Post = {
	_id: string;
	title: string;
	slug: string;
	publishedAt: string;
	tags?: string[];
};

interface PageProps {
	params: Promise<{ tag: string; lang: Language }>;
}

const getPostsByTag = (tag: string): Promise<Post[]> =>
	client.fetch(postsByTagQuery, { tagName: tag }, { next: { revalidate: 3600 } });

export async function generateStaticParams() {
	let tags: string[] = [];
	try {
		const fetchTags: () => Promise<string[]> = () => client.fetch(allTagsQuery);
		tags = await fetchTags();
	} catch {
		tags = [];
	}
	return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { tag, lang } = await params;
	const d = getDict(lang);

	return {
		title: `${d.blog.porEtiqueta(tag)} — Joaquín Mussi`,
		alternates: alternates(lang, `/blog/tag/${tag}`, false),
	};
}

const TagPage = async ({ params }: PageProps) => {
	const { tag, lang } = await params;
	const d = getDict(lang);

	let posts: Post[] = [];
	try {
		posts = await getPostsByTag(tag);
	} catch {
		posts = [];
	}

	if (posts.length === 0) return notFound();

	return (
		<main className='sistema min-h-screen px-5 py-12 md:px-16 md:py-16'>
			<div className='mx-auto flex max-w-[760px] flex-col gap-8'>
				<div className='entra entra-1 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-sinapsis/20 pb-4'>
					<Link
						href={localizedPath(lang, "/blog")}
						className='font-rotulo text-xs font-semibold uppercase tracking-[.12em] text-sinapsis transition-colors duration-200 ease-impulso hover:text-impulso'
					>
						{d.blog.verTodas}
					</Link>
					<Link
						href={localizedPath(lang, "/")}
						className='font-pieza text-[10px] uppercase tracking-[.18em] text-mielina transition-colors duration-200 ease-impulso hover:text-impulso'
					>
						Joaquín Mussi
					</Link>
				</div>

				<header className='entra entra-2 flex flex-col gap-2'>
					<span className='font-pieza text-[10px] uppercase tracking-[.16em] text-sinapsis'>
						{d.blog.etiqueta}
					</span>
					<h1 className='m-0 text-2xl md:text-4xl'>{d.blog.porEtiqueta(tag)}</h1>
				</header>

				<div className='entra entra-3 membrana flex flex-col'>
					{posts.map((post, i) => (
						<article
							key={post._id}
							className='grid grid-cols-[2rem_1fr] gap-x-4 gap-y-1 border-b border-sinapsis/15 px-6 py-4 last:border-b-0'
						>
							<span className='font-pieza text-[11px] tabular-nums text-sinapsis'>
								{String(i + 1).padStart(2, "0")}
							</span>
							<div className='flex min-w-0 flex-col gap-1'>
								<Link href={localizedPath(lang, `/blog/${post.slug}`)} className='group'>
									<h2 className='m-0 text-base leading-tight transition-colors duration-200 ease-impulso group-hover:text-impulso md:text-lg'>
										{post.title}
									</h2>
								</Link>
								<span className='font-pieza text-[10px] tabular-nums text-mielina'>
									{post.publishedAt?.slice(0, 10)}
								</span>
							</div>
						</article>
					))}
				</div>
			</div>
		</main>
	);
};

export default TagPage;
