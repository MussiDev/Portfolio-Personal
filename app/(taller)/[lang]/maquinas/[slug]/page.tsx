import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Cota from "../../../../src/common/Cota";
import Pendiente from "../../../../src/common/Pendiente";
import PlanoDiagrama from "../../../../src/common/PlanoDiagrama";
import {
	ESTADO_LABEL,
	TIEMPOS,
	getMachine,
	getMachines,
	parrafos,
} from "../../../../src/common/taller";
import type { Medida } from "../../../../../entities/machine";
import { IDIOMAS, ruta, t, type Idioma } from "../../../../../entities/i18n";
import { getDict } from "../../../../src/i18n/dict";
import { alternativas } from "../../../../src/i18n/meta";

type Props = { params: Promise<{ slug: string; lang: Idioma }> };

export const generateStaticParams = () =>
	IDIOMAS.flatMap((lang) => getMachines().map((m) => ({ lang, slug: m.slug })));

export const generateMetadata = async ({
	params,
}: Props): Promise<Metadata> => {
	const { slug, lang } = await params;
	const maquina = getMachine(slug);
	if (!maquina) return {};

	return {
		title: `${maquina.nombre} — Joaquín Mussi`,
		description: t(maquina.resumen, lang),
		alternates: alternativas(lang, `/maquinas/${maquina.slug}`),
		openGraph: {
			title: `${maquina.nombre} — Joaquín Mussi`,
			description: t(maquina.resumen, lang),
			url: ruta(lang, `/maquinas/${maquina.slug}`),
		},
	};
};

/** Un campo rotulado: la diferencia de género entre un plano y un CV. */
const Campo = ({ k, v }: { k: string; v: string }) => (
	<div className='grid grid-cols-[5.5rem_1fr] items-baseline gap-3 border-b border-linea/25 py-2'>
		<dt className='font-rotulo text-[9px] uppercase tracking-[.16em] text-texto-medio'>
			{k}
		</dt>
		<dd className='m-0 font-pieza text-xs leading-relaxed text-linea'>{v}</dd>
	</div>
);

const Flujo = ({ pasos }: { pasos: string[] }) => (
	<ol className='flex list-none flex-wrap items-stretch gap-0 p-0'>
		{pasos.map((paso, i) => (
			<li key={paso} className='flex items-center'>
				<span className='border-y border-l border-linea px-5 py-3 font-rotulo text-[12.5px] font-semibold uppercase tracking-[.05em]'>
					{paso}
				</span>
				<svg
					width={i < pasos.length - 1 ? 34 : 13}
					height='11'
					viewBox={i < pasos.length - 1 ? "0 0 34 11" : "0 0 13 11"}
					aria-hidden='true'
					className='shrink-0 text-linea'
				>
					{i < pasos.length - 1 ? (
						<>
							<path d='M0 0v11M0 5.5h27' stroke='currentColor' strokeWidth='1' />
							<path
								d='M27 1.5l6 4-6 4'
								stroke='currentColor'
								strokeWidth='1'
								fill='none'
							/>
						</>
					) : (
						<path d='M0 0v11' stroke='currentColor' strokeWidth='1' />
					)}
				</svg>
			</li>
		))}
	</ol>
);

const Medidas = ({ medidas, lang, sinMedir }: { medidas: Medida[]; lang: Idioma; sinMedir: string }) => (
	<dl className='m-0 grid grid-cols-2 border-t border-linea md:grid-cols-4'>
		{medidas.map((m) => (
			<div
				key={m.etiqueta.es}
				className='flex flex-col gap-1 border-b border-r border-linea/25 px-4 py-3 last:border-r-0'
			>
				<dt className='font-rotulo text-[9px] uppercase tracking-[.16em] text-texto-medio'>
					{t(m.etiqueta, lang)}
				</dt>
				<dd
					className={`m-0 font-pieza tabular-nums ${
						m.valor
							? "text-lg text-texto"
							: "text-xs italic text-texto-medio"
					}`}
				>
					{m.valor ?? sinMedir}
				</dd>
			</div>
		))}
	</dl>
);

const MaquinaPage = async ({ params }: Props) => {
	const { slug, lang } = await params;
	const maquina = getMachine(slug);
	if (!maquina) notFound();
	const d = getDict(lang);

	const { tiempos } = maquina;
	const escritos = TIEMPOS.filter(
		({ clave }) => parrafos(tiempos[clave], lang).length > 0,
	).length;

	return (
		<main className='taller min-h-screen px-5 py-12 md:px-16 md:py-16'>
			<div className='mx-auto flex max-w-[1080px] flex-col gap-8'>
				<Link
					href={ruta(lang)}
					className='font-rotulo text-xs font-semibold uppercase tracking-[.12em] text-linea hover:text-marca'
				>
					← {d.volverMesa}
				</Link>

				{/* La máquina entera es una lámina. */}
				<article className='hoja marcas relative'>
					<header className='grid gap-x-12 gap-y-7 border-b-[1.5px] border-linea px-7 py-9 md:grid-cols-[minmax(0,1fr)_19rem] md:px-12 md:py-12'>
						<div className='flex flex-col gap-5'>
							<h1 className='m-0 text-4xl leading-[.95] md:text-6xl'>
								{maquina.nombre}
							</h1>
							<p className='m-0 max-w-[46ch] font-nota text-xl leading-snug'>
								{t(maquina.resumen, lang)}
							</p>
							{maquina.enlaces.map((e) => (
								<a
									key={e.href}
									href={e.href}
									target={e.externo ? "_blank" : undefined}
									rel={e.externo ? "noreferrer" : undefined}
									className='w-fit border-b border-linea pb-0.5 font-rotulo text-[13px] font-semibold uppercase tracking-[.1em] text-linea hover:border-marca hover:text-marca'
								>
									{t(e.etiqueta, lang)} {e.externo ? "↗" : "→"}
								</a>
							))}
						</div>

						<dl className='m-0 self-end border-t border-linea/50'>
							<Campo k={d.campos.contexto} v={t(maquina.contexto, lang)} />
							{maquina.periodo && <Campo k={d.campos.periodo} v={t(maquina.periodo, lang)} />}
							<Campo k={d.campos.estado} v={ESTADO_LABEL[maquina.estado][lang]} />
							<Campo k={d.campos.stack} v={maquina.stack.join(" · ")} />
						</dl>
					</header>

					<div className='flex flex-col'>
						{TIEMPOS.map(({ clave, titulo }, i) => {
							const tiempo = tiempos[clave];
							const cuerpo = parrafos(tiempo, lang);
							const escrito = cuerpo.length > 0;

							return (
								<details
									key={clave}
									open={i === 0}
									className='tiempo border-b border-linea/20 last:border-b-0'
								>
									<summary className='grid cursor-pointer list-none grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-5 px-7 py-5 transition-colors duration-200 ease-mecanico hover:bg-hoja-honda md:px-12'>
										<span className='font-pieza text-xs tabular-nums text-linea'>
											{String(i + 1).padStart(2, "0")}
										</span>
										<h2 className='m-0 font-rotulo text-[16px] font-semibold tracking-[.08em]'>
											{titulo[lang]}
										</h2>
										{escrito ? (
											<span
												aria-hidden='true'
												className='marcador font-pieza text-xs text-linea'
											>
												+
											</span>
										) : (
											<span className='font-lapiz text-[19px] leading-none text-texto-medio'>
												{d.maquinas.sinEscribir}
											</span>
										)}
									</summary>

									<div className='flex flex-col gap-5 px-7 pb-9 pt-1 md:px-12 md:pl-[4.4rem]'>
										{cuerpo.map((p) => (
											<p
												key={p.slice(0, 40)}
												className='m-0 max-w-[68ch] font-nota text-lg leading-relaxed'
											>
												{p}
											</p>
										))}

										{clave === "mecanismo" && "flujo" in tiempo && tiempo.flujo && (
											<Flujo pasos={tiempo.flujo[lang] ?? tiempo.flujo.es} />
										)}

										{clave === "mecanismo" && "diagrama" in tiempo && tiempo.diagrama && (
											<PlanoDiagrama codigo={tiempo.diagrama} />
										)}

										{clave === "mecanismo" && "codigo" in tiempo && tiempo.codigo && (
											<pre className='overflow-x-auto border-l-2 border-linea bg-hoja-honda px-6 py-5 font-pieza text-[13px] leading-relaxed'>
												{tiempo.codigo}
											</pre>
										)}

										{clave === "resultado" &&
											"medidas" in tiempo &&
											tiempo.medidas.length > 0 && <Medidas medidas={tiempo.medidas} lang={lang} sinMedir={d.maquinas.sinMedir} />}

										{tiempo.pendiente && (
											<Pendiente>{t(tiempo.pendiente, lang)}</Pendiente>
										)}
									</div>
								</details>
							);
						})}
					</div>

					{/* El cajetín. `Tiempos` no miente: cuenta los que están escritos. */}
					<dl className='m-0 grid grid-cols-2 border-t-[1.5px] border-linea md:grid-cols-4'>
						{[
							[d.campos.documento, `MAQ-${maquina.slug.slice(0, 8).toUpperCase()}`],
							[d.campos.estado, ESTADO_LABEL[maquina.estado][lang]],
							[d.campos.autor, "J. Mussi"],
						].map(([k, v]) => (
							<div
								key={k}
								className='flex flex-col gap-0.5 border-r border-linea/20 px-7 py-3 last:border-r-0 md:px-12'
							>
								<dt className='font-rotulo text-[9px] uppercase tracking-[.16em] text-texto-medio'>
									{k}
								</dt>
								<dd className='m-0 font-pieza text-xs tabular-nums text-linea'>{v}</dd>
							</div>
						))}
						{/* La única cota del cajetín: mide lo que sí se puede medir sin
						    inventar un número, cuántos de los seis tiempos existen. */}
						<div className='flex flex-col gap-0.5 border-r border-linea/20 px-7 py-3 last:border-r-0 md:px-12'>
							<dt className='font-rotulo text-[9px] uppercase tracking-[.16em] text-texto-medio'>
								{d.campos.tiempos}
							</dt>
							<dd className='m-0'>
								<Cota valor={`${escritos} / ${TIEMPOS.length}`} />
							</dd>
						</div>
					</dl>
				</article>
			</div>
		</main>
	);
};

export default MaquinaPage;
