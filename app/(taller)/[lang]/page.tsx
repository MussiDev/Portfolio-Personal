import type { Metadata } from "next";
import Link from "next/link";

import { t, type Idioma, type Texto } from "../../../entities/i18n";
import { ruta } from "../../../entities/i18n";
import Idiomas from "../../src/common/Idiomas";
import { alternativas } from "../../src/i18n/meta";
import { getDict } from "../../src/i18n/dict";

import articles from "../../../api/articles.json";
import mesa from "../../../api/mesa.json";
import { ESTADO_LABEL, getMachines, tiemposEscritos } from "../../src/common/taller";
import Cota from "../../src/common/Cota";

export const generateMetadata = async ({
	params,
}: {
	params: Promise<{ lang: Idioma }>;
}): Promise<Metadata> => {
	const { lang } = await params;
	const d = getDict(lang);

	return {
		title: "Joaquín Mussi — Software Engineer",
		description: d.presentacion,
		alternates: alternativas(lang, "/"),
	};
};

type Articulo = { id: number; title: Texto; summary: Texto; date: string };

const STACK = [
	"Next.js",
	"React",
	"TypeScript",
	".NET · C#",
	"Clean Architecture",
];

const salida =
	"border-b border-linea pb-0.5 font-rotulo text-sm font-semibold uppercase tracking-[.1em] text-linea transition-colors duration-200 ease-mecanico hover:border-marca hover:text-marca";

const renglon =
	"group grid grid-cols-[2.5rem_1fr] items-baseline gap-x-5 gap-y-1 border-b border-linea/20 px-6 py-3.5 transition-colors duration-200 ease-mecanico last:border-b-0 hover:bg-hoja-honda md:grid-cols-[3.5rem_minmax(0,1fr)_9rem_8.5rem] md:px-9";


const VISIBLES = 4;

const Renglones = ({
	lista,
	desde,
	lang,
	d,
}: {
	lista: ReturnType<typeof getMachines>;
	desde: number;
	lang: Idioma;
	d: ReturnType<typeof getDict>;
}) => (
	<>
		{lista.map((m, i) => {
						const propio = m.tipo === "producto";
						const abierta = tiemposEscritos(m) > 0;
						const Fila = abierta ? Link : "div";
						return (
							<Fila
								key={m.slug}
								href={ruta(lang, `/maquinas/${m.slug}`)}
								className={`${renglon} ${
									propio ? "border-l-[3px] border-l-marca" : ""
								} ${abierta ? "" : "cursor-default opacity-60 hover:bg-transparent"}`}
							>
								<span
									className={`font-pieza text-sm tabular-nums ${
										propio ? "text-marca" : "text-linea"
									}`}
								>
									{String(desde + i + 1).padStart(2, "0")}
								</span>
								<div className='flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5'>
									<h2
										className={`m-0 leading-tight ${
											propio ? "text-lg text-marca md:text-xl" : "text-base md:text-lg"
										}`}
									>
										{m.nombre}
									</h2>
									<p className='m-0 min-w-0 flex-1 truncate font-nota text-[15px] leading-snug text-texto-medio'>
										{t(m.resumen, lang)}
									</p>
									{/* La cota real de la fila, no antes de que alguien se
									    detenga a mirarla. */}
									{abierta && (
										<Cota
											valor={`${tiemposEscritos(m)} / 6`}
											className='shrink-0 opacity-0 transition-opacity duration-200 ease-mecanico group-hover:opacity-100'
										/>
									)}
								</div>
																<span
									className={`col-start-2 font-pieza text-[11px] md:col-start-3 ${
										propio ? "text-marca" : "text-texto-medio"
									}`}
								>
									{t(m.contexto, lang)}
								</span>
								<span className='col-start-2 font-pieza text-[11px] text-texto-medio md:col-start-4'>
									{abierta ? (
										m.periodo ? t(m.periodo, lang) : ESTADO_LABEL[m.estado][lang]
									) : (
										<span className='font-lapiz text-[19px] leading-none'>
											{d.maquinas.sinAbrir}
										</span>
									)}
								</span>
							</Fila>
						);
					})}
	</>
);

const MesaPage = async ({ params }: { params: Promise<{ lang: Idioma }> }) => {
	const { lang } = await params;
	const d = getDict(lang);
	const maquinas = getMachines();
	const visibles = maquinas.slice(0, VISIBLES);
	const ocultas = maquinas.slice(VISIBLES);
	const nota = (articles as Articulo[])[0];

	return (
		<main className='taller min-h-screen px-5 py-14 md:px-16 md:py-20'>
			<div className='mx-auto flex max-w-[1120px] flex-col gap-12'>
				{/*
				  La identidad va sobre la mesa, no sobre una hoja: no es un documento.
				  Los datos van en campos rotulados, como el bloque de autor de un
				  plano — un CV apila lineas sin etiquetar, y esa es toda la
				  diferencia de genero entre una cosa y la otra.
				*/}
				<div className='flex justify-end'>
					<Idiomas actual={lang} />
				</div>

				<header className='grid gap-x-12 gap-y-8 md:grid-cols-[minmax(0,1fr)_auto]'>
					<div className='flex max-w-[640px] flex-col gap-6'>
						<h1 className='m-0 text-5xl leading-[.92] md:text-[5.25rem]'>
							Joaquín Mussi
						</h1>
						<p className='m-0 max-w-[36ch] font-nota text-xl leading-snug md:text-[1.65rem]'>
							{d.presentacion}
						</p>
						<nav className='flex flex-wrap gap-x-8 gap-y-3 pt-1'>
							<Link href={ruta(lang, '/maquinas')} className={salida}>
								{d.nav.maquinas}
							</Link>
							<Link href={ruta(lang, '/blog')} className={salida}>
								{d.nav.cuaderno}
							</Link>
							<Link href={ruta(lang, '/oficio')} className={salida}>
								{d.nav.oficio}
							</Link>
							<Link href={ruta(lang, "/contacto")} className={salida}>
								{d.nav.contacto}
							</Link>
							<a href='/pdf.pdf' target='_blank' rel='noreferrer' className={salida}>
								{d.nav.cv}
							</a>
						</nav>
					</div>

					<dl className='m-0 grid w-full grid-cols-2 self-end border-t border-linea/50 md:w-[19rem] md:grid-cols-1'>
						{[
							[d.campos.rol, "Software Engineer"],
							[d.campos.en, "La Mutual de AMR"],
							[d.campos.desde, "2022"],
							[d.campos.lugar, "Rosario, AR"],
						].map(([k, v]) => (
							<div
								key={k}
								className='grid grid-cols-[4.5rem_1fr] items-baseline gap-3 border-b border-linea/25 py-2'
							>
								<dt className='font-rotulo text-[9px] uppercase tracking-[.16em] text-texto-medio'>
									{k}
								</dt>
								<dd className='m-0 font-pieza text-xs tabular-nums text-linea'>{v}</dd>
							</div>
						))}
						<div className='col-span-2 grid grid-cols-[4.5rem_1fr] items-baseline gap-3 py-2 md:col-span-1'>
							<dt className='font-rotulo text-[9px] uppercase tracking-[.16em] text-texto-medio'>
								{d.campos.stack}
							</dt>
							<dd className='m-0 font-pieza text-xs leading-relaxed text-linea'>
								{STACK.join(" · ")}
							</dd>
						</div>
					</dl>
				</header>

				{/*
				  El registro, como el índice de un juego de planos. Todo lo que hay
				  sobre la mesa entra acá — y lo único que es suyo de punta a punta
				  se distingue por el canto rojo, no por el tamaño.
				*/}
				<section className='hoja marcas relative'>
					<div className='flex flex-col gap-2 border-b-[1.5px] border-linea px-6 pb-5 pt-7 md:px-9'>
						<div className='flex flex-wrap items-baseline gap-x-4 gap-y-1'>
							<h2 className='m-0 text-2xl md:text-3xl'>{d.maquinas.titulo}</h2>
							<span className='font-nota text-lg italic leading-none text-texto-medio'>
								{d.maquinas.glosa}
							</span>
						</div>
						<p className='m-0 max-w-[72ch] font-nota text-[15px] leading-relaxed text-texto-medio'>
							{d.maquinas.bajada}
						</p>
					</div>

					<div className='grid grid-cols-[3rem_1fr] items-baseline gap-x-6 border-b border-linea/40 px-6 py-2.5 font-rotulo text-[10px] uppercase tracking-[.16em] text-linea md:grid-cols-[4rem_1fr_10rem_9rem] md:px-9'>
						<span>{d.campos.numero}</span>
						<span>{d.maquinas.titulo}</span>
						<span className='hidden md:block'>{d.campos.contexto}</span>
						<span className='hidden md:block'>{d.campos.periodo}</span>
					</div>

					<Renglones lista={visibles} desde={0} lang={lang} d={d} />

					{ocultas.length > 0 && (
						<details className='vermas flex flex-col-reverse'>
							<summary className='flex cursor-pointer list-none items-center gap-3 border-b border-linea/20 px-6 py-3 font-rotulo text-[11px] uppercase tracking-[.14em] text-linea transition-colors duration-200 ease-mecanico hover:bg-hoja-honda md:px-9'>
								<span className='mas'>
									{lang === "es"
										? `Ver ${ocultas.length} máquinas más`
										: `See ${ocultas.length} more machines`}
								</span>
								<span className='menos'>
									{lang === "es" ? "Ver menos" : "See less"}
								</span>
							</summary>
							<Renglones lista={ocultas} desde={VISIBLES} lang={lang} d={d} />
						</details>
					)}

					{/* El cajetín: la convención que cierra una lámina. Lleva datos
					    verdaderos, no decoración. */}
					<dl className='m-0 grid grid-cols-2 border-t-[1.5px] border-linea md:grid-cols-4'>
						{[
							[d.campos.documento, "REG-01"],
							[d.campos.maquinas, String(maquinas.length)],
							[d.campos.actualizado, "2026-09"],
							[d.campos.autor, "J. Mussi"],
						].map(([k, v]) => (
							<div
								key={k}
								className='flex flex-col gap-0.5 border-r border-linea/20 px-6 py-3 last:border-r-0 md:px-9'
							>
								<dt className='font-rotulo text-[9px] uppercase tracking-[.16em] text-texto-medio'>
									{k}
								</dt>
								<dd className='m-0 font-pieza text-xs tabular-nums text-linea'>{v}</dd>
							</div>
						))}
					</dl>
				</section>

				<div className='flex flex-col gap-5'>
					<div className='flex flex-wrap items-baseline gap-x-4 gap-y-1'>
						<h2 className='m-0 text-2xl md:text-3xl'>{d.cuaderno.titulo}</h2>
						<span className='font-nota text-lg italic leading-none text-texto-medio'>
							{d.cuaderno.glosa}
						</span>
					</div>

				<div className='grid gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'>
					{/* Una hoja chica: la nota del cuaderno. */}
					<article className='hoja flex flex-col gap-3 px-7 py-7'>
						<h2 className='m-0 text-xl leading-tight md:text-2xl'>{t(nota.title, lang)}</h2>
						<p className='m-0 font-nota text-[15px] leading-relaxed text-texto-medio'>
							{t(nota.summary, lang)}
						</p>
						<Link
							href={ruta(lang, '/blog')}
							className='mt-auto pt-2 font-pieza text-[11px] text-linea underline decoration-linea/40 underline-offset-4 hover:text-marca'
						>
							{d.mesa.delCuaderno}, {nota.date.toLowerCase()} — {d.mesa.leer} →
						</Link>
					</article>

					{/* El banco vacío: una hoja rayada, preparada y sin usar. */}
					<div className='hoja rayado flex min-h-[10rem] flex-col justify-start px-7 pb-7 pt-6'>
						<span className='font-lapiz text-[21px] leading-none text-texto-medio'>
							{d.mesa.experimento}
						</span>
					</div>
				</div>
				</div>

				{/* Una corrección hecha sobre la mesa, no sobre una hoja. */}
				<p className='m-0 max-w-[70ch] border-l-2 border-marca/50 pl-5 font-lapiz text-[23px] leading-snug text-texto-medio'>
					<span className='line-through decoration-marca decoration-[1.5px]'>
						{t(mesa.descartado.titulo, lang)}
					</span>
					{" — "}
					{t(mesa.descartado.motivo, lang)}
				</p>

				<footer className='flex flex-wrap items-end justify-between gap-6 border-t-[1.5px] border-linea pt-5 font-pieza text-xs text-texto-medio'>
					<div className='flex flex-wrap gap-x-6 gap-y-2'>
						<a
							href='https://github.com/MussiDev'
							target='_blank'
							rel='noreferrer'
							className='hover:text-linea'
						>
							GitHub
						</a>
						<a
							href='https://www.linkedin.com/in/joaquinmussi/'
							target='_blank'
							rel='noreferrer'
							className='hover:text-linea'
						>
							LinkedIn
						</a>
						<Link href='/anterior' className='hover:text-linea'>
							{d.mesa.verAnterior}
						</Link>
					</div>
					<span>Joaquín Mussi · 2026</span>
				</footer>
			</div>
		</main>
	);
};

export default MesaPage;
