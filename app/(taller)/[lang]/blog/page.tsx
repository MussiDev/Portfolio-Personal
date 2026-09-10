import Link from "next/link";
import { Suspense } from "react";
import { client } from "../../../../sanity/lib/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { postsQuery } from "../../../../sanity/lib/queries";
import { IDIOMA_POR_DEFECTO, type Idioma } from "../../../../entities/i18n";
import { ruta } from "../../../../entities/i18n";
import { getDict } from "../../../src/i18n/dict";

export const dynamic = "force-dynamic";

const BASE_URL = "https://joaquinmussi.vercel.app";
const DESCRIPCION =
	"Notas de laboratorio: hipótesis, experimento y resultado sobre ingeniería web, arquitectura y sistemas con IA.";

export const metadata = {
	title: "Cuaderno — Joaquín Mussi",
	description: DESCRIPCION,
	alternates: { canonical: `${BASE_URL}/blog` },
	openGraph: {
		title: "Cuaderno — Joaquín Mussi",
		description: DESCRIPCION,
		url: `${BASE_URL}/blog`,
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Cuaderno — Joaquín Mussi",
		description: DESCRIPCION,
	},
};

interface Post {
	_id: string;
	title: string;
	slug: string;
	publishedAt: string;
	tags: string[];
}

const renglon =
	"group grid grid-cols-1 items-baseline gap-x-8 gap-y-2 border-b border-linea/20 px-6 py-6 transition-colors duration-200 ease-mecanico last:border-b-0 hover:bg-hoja-honda md:grid-cols-[7.5rem_minmax(0,1fr)_13rem] md:px-9";

const Entradas = async ({ lang }: { lang: Idioma }) => {
	const posts: Post[] = await client.fetch(postsQuery);

	if (posts.length === 0) {
		return (
			<p className='px-6 py-8 font-lapiz text-[21px] text-texto-medio md:px-9'>
				El cuaderno todavía está en blanco.
			</p>
		);
	}

	return (
		<>
			{posts.map((post) => (
				<Link key={post._id} href={ruta(lang, `/blog/${post.slug}`)} className={renglon}>
					<span className='font-pieza text-[11px] tabular-nums text-linea'>
						{post.publishedAt
							? format(new Date(post.publishedAt), "dd MMM yyyy", { locale: es })
							: "—"}
					</span>

					<h2 className='m-0 text-xl leading-tight md:text-2xl'>{post.title}</h2>

					{post.tags?.length > 0 && (
						<span className='font-pieza text-[11px] leading-relaxed text-texto-medio'>
							{post.tags.join(" · ")}
						</span>
					)}
				</Link>
			))}
		</>
	);
};

const Esqueleto = () => (
	<>
		{Array.from({ length: 4 }).map((_, i) => (
			<div key={i} className={`${renglon} pointer-events-none`}>
				<span className='h-3 w-20 bg-linea/15' />
				<span className='h-5 w-3/4 bg-linea/15' />
				<span className='h-3 w-32 bg-linea/15' />
			</div>
		))}
	</>
);

const BlogPage = async ({ params }: { params: Promise<{ lang: Idioma }> }) => {
	const { lang } = await params;
	const d = getDict(lang);

	return (
	<main className='taller min-h-screen px-5 py-12 md:px-16 md:py-16'>
		<div className='mx-auto flex max-w-[1080px] flex-col gap-8'>
			<Link
				href={ruta(lang)}
				className='font-rotulo text-xs font-semibold uppercase tracking-[.12em] text-linea hover:text-marca'
			>
				← {d.volverMesa}
			</Link>

			<section className='hoja marcas relative'>
				<div className='flex flex-col gap-2 border-b-[1.5px] border-linea px-6 pb-6 pt-8 md:px-9'>
					<div className='flex flex-wrap items-baseline gap-x-4 gap-y-1'>
						<h1 className='m-0 text-3xl md:text-4xl'>{d.cuaderno.titulo}</h1>
						<span className='font-lapiz text-[22px] leading-none text-texto-medio'>
							{d.cuaderno.glosa}
						</span>
					</div>
					<p className='m-0 max-w-[72ch] font-nota text-[15px] leading-relaxed text-texto-medio'>
						{d.cuaderno.bajada}
					</p>
				</div>

				<div className='grid grid-cols-1 gap-x-8 border-b border-linea/40 px-6 py-2.5 font-rotulo text-[10px] uppercase tracking-[.16em] text-linea md:grid-cols-[7.5rem_minmax(0,1fr)_13rem] md:px-9'>
					<span className='hidden md:block'>{d.campos.fecha}</span>
					<span>{d.campos.nota}</span>
					<span className='hidden md:block'>{d.campos.temas}</span>
				</div>

				<Suspense fallback={<Esqueleto />}>
					<Entradas lang={lang} />
				</Suspense>
			</section>
		</div>
	</main>
	);
};

export default BlogPage;
