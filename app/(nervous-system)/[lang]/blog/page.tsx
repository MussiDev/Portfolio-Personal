import type { Metadata } from "next";
import Link from "next/link";

import { LANGUAGES, localizedPath, type Language } from "../../../../entities/i18n";
import { alternates } from "../../../src/i18n/meta";
import { getDict } from "../../../src/i18n/dict";
import { client } from "../../../../sanity/lib/client";
import { postsQuery } from "../../../../sanity/lib/queries";
import { cleanTitle } from "../../../src/components/Blog/title";

type Post = {
	_id: string;
	title: string;
	slug: string;
	publishedAt: string;
	tags?: string[];
};

export const generateStaticParams = () => LANGUAGES.map((lang) => ({ lang }));

export const generateMetadata = async ({
	params,
}: {
	params: Promise<{ lang: Language }>;
}): Promise<Metadata> => {
	const { lang } = await params;
	const d = getDict(lang);

	return {
		title: `${d.blog.title} — Joaquín Mussi`,
		description: d.blog.intro,
		alternates: alternates(lang, "/blog", false),
	};
};

const BlogIndexPage = async ({ params }: { params: Promise<{ lang: Language }> }) => {
	const { lang } = await params;
	const d = getDict(lang);

	let posts: Post[] = [];
	try {
		posts = await client.fetch<Post[]>(postsQuery, {}, { next: { revalidate: 3600 } });
	} catch {
		posts = [];
	}

	return (
		<main className='nervous-system min-h-screen px-5 py-12 md:px-16 md:py-16'>
			<div className='mx-auto flex max-w-[760px] flex-col gap-8'>
				<div className='enter enter-1 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-synapse/20 pb-4'>
					<Link
						href={localizedPath(lang, "/")}
						className='font-label text-xs font-semibold uppercase tracking-[.12em] text-synapse transition-colors duration-200 ease-impulse hover:text-impulse'
					>
						{d.blog.backToHome}
					</Link>
					<Link
						href={localizedPath(lang, "/")}
						className='font-mono text-[10px] uppercase tracking-[.18em] text-myelin transition-colors duration-200 ease-impulse hover:text-impulse'
					>
						Joaquín Mussi
					</Link>
				</div>

				<header className='enter enter-2 flex flex-col gap-2'>
					<h1 className='m-0 text-3xl md:text-5xl'>{d.blog.title}</h1>
					<span className='font-gloss text-lg italic leading-none text-myelin'>
						{d.blog.gloss}
					</span>
					<p className='m-0 mt-2 max-w-[60ch] font-label text-[15px] leading-relaxed text-myelin'>
						{d.blog.intro}
					</p>
				</header>

				<div className='enter enter-3 membrane flex flex-col'>
					{posts.length === 0 ? (
						<p className='m-0 px-6 py-8 font-gloss text-[16px] italic text-myelin'>
							{d.blog.empty}
						</p>
					) : (
						posts.map((post, i) => (
							<article
								key={post._id}
								className='grid grid-cols-[2rem_1fr] gap-x-4 gap-y-1 border-b border-synapse/15 px-6 py-4 last:border-b-0'
							>
								<span className='font-mono text-[11px] tabular-nums text-synapse'>
									{String(i + 1).padStart(2, "0")}
								</span>
								<div className='flex min-w-0 flex-col gap-1'>
									<Link
										href={localizedPath(lang, `/blog/${post.slug}`)}
										className='group'
									>
										<h2 className='m-0 text-base leading-tight transition-colors duration-200 ease-impulse group-hover:text-impulse md:text-lg'>
											{cleanTitle(post.title)}
										</h2>
									</Link>
									<div className='flex flex-wrap items-baseline gap-x-3 font-mono text-[10px] text-myelin'>
										<span className='tabular-nums'>
											{post.publishedAt?.slice(0, 10)}
										</span>
										{post.tags?.length ? (
											<span className='flex flex-wrap gap-x-2 text-synapse'>
												{post.tags.map((tag) => (
													<Link
														key={tag}
														href={localizedPath(lang, `/blog/tag/${tag}`)}
														className='transition-colors duration-200 ease-impulse hover:text-impulse'
													>
														#{tag}
													</Link>
												))}
											</span>
										) : null}
									</div>
								</div>
							</article>
						))
					)}
				</div>
			</div>
		</main>
	);
};

export default BlogIndexPage;
