import type { Metadata } from "next";
import Link from "next/link";

import { t, type Idioma } from "../../../../entities/i18n";
import { ruta } from "../../../../entities/i18n";
import { alternativas } from "../../../src/i18n/meta";
import { getDict } from "../../../src/i18n/dict";

import { ESTADO_LABEL, getMachines, tiemposEscritos } from "../../../src/common/taller";

export const generateMetadata = async ({
	params,
}: {
	params: Promise<{ lang: Idioma }>;
}): Promise<Metadata> => {
	const { lang } = await params;
	const d = getDict(lang);

	return {
		title: `${d.maquinas.titulo} — Joaquín Mussi`,
		description: d.maquinas.bajada,
		alternates: alternativas(lang, "/maquinas"),
	};
};

const renglon =
	"group grid grid-cols-[3rem_1fr] items-baseline gap-x-6 gap-y-2 border-b border-linea/20 px-6 py-6 transition-colors duration-200 ease-mecanico last:border-b-0 hover:bg-hoja-honda md:grid-cols-[4rem_1fr_10rem_9rem] md:px-9";

const MaquinasPage = async ({ params }: { params: Promise<{ lang: Idioma }> }) => {
	const { lang } = await params;
	const d = getDict(lang);
	const maquinas = getMachines();

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
							<h1 className='m-0 text-3xl md:text-4xl'>{d.maquinas.titulo}</h1>
							<span className='font-lapiz text-[22px] leading-none text-texto-medio'>
								{d.maquinas.glosa}
							</span>
						</div>
						<p className='m-0 max-w-[72ch] font-nota text-[15px] leading-relaxed text-texto-medio'>
							Cada una se abre en seis tiempos: problema, decisión, mecanismo,
							trade-off, resultado y qué haría distinto hoy. El cuarto es el que
							separa un proyecto real de un ejercicio.
						</p>
					</div>

					<div className='grid grid-cols-[3rem_1fr] items-baseline gap-x-6 border-b border-linea/40 px-6 py-2.5 font-rotulo text-[10px] uppercase tracking-[.16em] text-linea md:grid-cols-[4rem_1fr_10rem_9rem] md:px-9'>
						<span>{d.campos.numero}</span>
						<span>{d.maquinas.titulo}</span>
						<span className='hidden md:block'>{d.campos.contexto}</span>
						<span className='hidden md:block'>{d.campos.periodo}</span>
					</div>

					{maquinas.map((m, i) => {
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
									{String(i + 1).padStart(2, "0")}
								</span>
								<div className='flex flex-col gap-1.5'>
									<h2
										className={`m-0 leading-tight ${
											propio ? "text-2xl text-marca md:text-3xl" : "text-xl md:text-2xl"
										}`}
									>
										{m.nombre}
									</h2>
									<p className='m-0 max-w-[54ch] font-nota text-[15px] leading-relaxed text-texto-medio'>
										{t(m.resumen, lang)}
									</p>
									<span className='font-pieza text-[11px] text-texto-medio'>
										{m.stack.join(" · ")}
									</span>
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
			</div>
		</main>
	);
};

export default MaquinasPage;
