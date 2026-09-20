import Link from "next/link";

import { localizedPath, type Language } from "../../../entities/i18n";
import { limpiarTitulo } from "../components/Blog/title";
import type { Dict } from "../i18n/dict";
import { Step } from "./StepLayout";

type Post = {
	_id: string;
	title: string;
	slug: string;
	publishedAt: string;
	tags?: string[];
};

const BlogSection = ({
	d,
	lang,
	posts,
	postsCount,
}: {
	d: Dict;
	lang: Language;
	posts: Post[];
	postsCount: string;
}) => (
	<Step n={4} title={d.blog.titulo} gloss={d.blog.glosa} fact={postsCount}>
		<div className='flex flex-col gap-4'>
			<p className='m-0 max-w-[60ch] font-rotulo text-[15px] leading-relaxed text-mielina'>
				{d.blog.bajada}
			</p>

			<div className='membrana flex flex-col'>
				{posts.length === 0 ? (
					<p className='m-0 px-6 py-8 font-glosa text-[16px] italic text-mielina'>
						{d.blog.vacio}
					</p>
				) : (
					posts.map((post, i) => (
						<Link
							key={post._id}
							href={localizedPath(lang, `/blog/${post.slug}`)}
							className='group grid grid-cols-[2rem_1fr] items-baseline gap-x-4 gap-y-1 border-b border-sinapsis/15 px-6 py-4 transition-colors duration-200 ease-impulso last:border-b-0 hover:bg-membrana-honda'
						>
							<span className='font-pieza text-[11px] tabular-nums text-sinapsis'>
								{String(i + 1).padStart(2, "0")}
							</span>
							<div className='flex min-w-0 flex-col gap-1'>
								<h3 className='m-0 text-base leading-tight transition-colors duration-200 ease-impulso group-hover:text-impulso md:text-lg'>
									{limpiarTitulo(post.title)}
								</h3>
								<div className='flex flex-wrap items-baseline gap-x-3 font-pieza text-[10px] text-mielina'>
									<span className='tabular-nums'>
										{post.publishedAt?.slice(0, 10)}
									</span>
									{post.tags?.length ? (
										<span className='text-sinapsis'>
											{post.tags.join(" · ")}
										</span>
									) : null}
								</div>
							</div>
						</Link>
					))
				)}
			</div>
		</div>
	</Step>
);

export default BlogSection;
export type { Post };
