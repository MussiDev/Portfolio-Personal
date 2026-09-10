import type { Metadata } from "next";
import Link from "next/link";

import certifications from "../../../../api/certifications.json";
import experienceItems from "../../../../api/experienceItems.json";
import recommendations from "../../../../api/recommendations.json";
import { t, type Idioma, type Texto } from "../../../../entities/i18n";
import { ruta } from "../../../../entities/i18n";
import { alternativas } from "../../../src/i18n/meta";
import { getDict } from "../../../src/i18n/dict";

export const generateMetadata = async ({
	params,
}: {
	params: Promise<{ lang: Idioma }>;
}): Promise<Metadata> => {
	const { lang } = await params;
	const d = getDict(lang);

	return {
		title: `${d.oficio.titulo} — Joaquín Mussi`,
		description: d.oficio.bio,
		alternates: alternativas(lang, "/oficio"),
	};
};

type Rol = { position: string; time: string; description: Texto };
type Empleo = {
	company: string;
	totalTime?: string;
	time?: string;
	position?: string;
	description?: Texto;
	roles?: Rol[];
};
type Recomendacion = {
	id: number;
	name: string;
	role: string;
	relation: Texto;
	date: string;
	text: Texto;
};
type Certificacion = { id: number; platform: string; name: string; date: string };

/**
 * La recomendación se muestra junto al empleo del que habla. Un testimonio
 * leído en su contexto vale más que cuatro apilados en un carrusel.
 */
const RECOMENDACION_POR_EMPRESA: Record<string, number> = {
	"La Mutual de AMR": 3,
	"It-techgroup": 1,
};

const Cita = ({ rec, lang }: { rec: Recomendacion; lang: Idioma }) => (
	<figure className='m-0 mt-3 flex max-w-[58ch] flex-col gap-2 border-l-2 border-marca/60 pl-4'>
		<blockquote className='m-0 font-lapiz text-[23px] leading-snug text-texto'>
			“{t(rec.text, lang)}”
		</blockquote>
		<figcaption className='font-pieza text-[11px] text-texto-medio'>
			{rec.name} · {rec.role} · {t(rec.relation, lang)} · {rec.date}
		</figcaption>
	</figure>
);

const OficioPage = async ({ params }: { params: Promise<{ lang: Idioma }> }) => {
	const { lang } = await params;
	const d = getDict(lang);
	const empleos = experienceItems as Empleo[];
	const recs = recommendations as Recomendacion[];
	const certs = certifications as Certificacion[];

	return (
		<main className='taller min-h-screen px-5 py-12 md:px-16 md:py-16'>
			<div className='mx-auto flex max-w-[1080px] flex-col gap-8'>
				<Link
					href={ruta(lang)}
					className='font-rotulo text-xs font-semibold uppercase tracking-[.12em] text-linea hover:text-marca'
				>
					← {d.volverMesa}
				</Link>

				<article className='hoja marcas relative'>
					<header className='grid gap-x-12 gap-y-7 border-b-[1.5px] border-linea px-7 py-9 md:grid-cols-[minmax(0,1fr)_19rem] md:px-12 md:py-12'>
						<div className='flex flex-col gap-4'>
							<div className='flex flex-wrap items-baseline gap-x-4 gap-y-1'>
								<h1 className='m-0 text-4xl leading-none md:text-5xl'>{d.oficio.titulo}</h1>
								<span className='font-lapiz text-[22px] leading-none text-texto-medio'>
									{d.oficio.glosa}
								</span>
							</div>
							<p className='m-0 max-w-[54ch] font-nota text-xl leading-snug'>
								{d.oficio.bio}
							</p>
						</div>

						<dl className='m-0 self-end border-t border-linea/50'>
							{[
								[d.campos.formacion, d.oficio.autodidacta],
								[d.campos.trabajando, d.oficio.desdeAnio],
								[d.campos.empresas, String(empleos.length)],
								[d.campos.certificaciones, String(certs.length)],
							].map(([k, v]) => (
								<div
									key={k}
									className='grid grid-cols-[5.5rem_1fr] items-baseline gap-3 border-b border-linea/25 py-2'
								>
									<dt className='font-rotulo text-[9px] uppercase tracking-[.16em] text-texto-medio'>
										{k}
									</dt>
									<dd className='m-0 font-pieza text-xs text-linea'>{v}</dd>
								</div>
							))}
						</dl>
					</header>

					<section className='px-7 py-9 md:px-12 md:py-12'>
						<div className='mb-8 flex flex-wrap items-baseline gap-x-4 gap-y-1'>
							<h2 className='m-0 text-2xl md:text-3xl'>{d.oficio.trayectoria}</h2>
							<span className='font-lapiz text-[22px] leading-none text-texto-medio'>
								{d.oficio.trayectoriaGlosa}
							</span>
						</div>

						<div className='flex flex-col gap-10'>
							{empleos.map((empleo) => {
								const rec = recs.find(
									(r) => r.id === RECOMENDACION_POR_EMPRESA[empleo.company],
								);

								return (
									<div
										key={empleo.company}
										className='grid gap-x-9 gap-y-5 md:grid-cols-[220px_minmax(0,1fr)]'
									>
										<div className='flex flex-col gap-1'>
											<h3 className='m-0 text-lg md:text-xl'>{empleo.company}</h3>
											<span className='font-pieza text-xs tabular-nums text-linea'>
												{(empleo.totalTime ?? empleo.time ?? "").toLowerCase()}
											</span>
										</div>

										<div className='flex flex-col gap-6 border-l border-linea/40 pl-7'>
											{(
												empleo.roles ?? [
													{
														position: empleo.position ?? empleo.company,
														time: empleo.time ?? "",
														description: empleo.description ?? { es: "", en: "" },
													},
												]
											).map((rol) => (
												<div key={rol.position} className='flex flex-col gap-2'>
													<div className='flex flex-wrap items-baseline gap-3'>
														<h4 className='m-0 text-base md:text-lg'>
															{rol.position}
														</h4>
														<span className='font-pieza text-xs tabular-nums text-texto-medio'>
															{rol.time.toLowerCase()}
														</span>
													</div>
													<p className='m-0 max-w-[66ch] font-nota text-[17px] leading-relaxed'>
														{t(rol.description, lang)}
													</p>
												</div>
											))}

											{rec && <Cita rec={rec} lang={lang} />}
										</div>
									</div>
								);
							})}
						</div>
					</section>

					<section className='border-t border-linea/25 px-7 py-8 md:px-12'>
						<div className='mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1'>
							<h2 className='m-0 text-lg text-texto-medio md:text-xl'>
								{d.oficio.credenciales}
							</h2>
							<span className='font-lapiz text-[20px] leading-none text-texto-medio'>
								{d.oficio.credencialesGlosa(certs.length)}
							</span>
						</div>

						<ul className='m-0 grid list-none grid-cols-1 gap-x-9 gap-y-2 p-0 sm:grid-cols-2 lg:grid-cols-4'>
							{certs.map((c) => (
								<li
									key={c.id}
									className='flex justify-between gap-3 border-b border-linea/15 pb-1.5 font-pieza text-xs text-texto-medio'
								>
									<span>{c.name.replace(/ Course$/, "")}</span>
									<span className='shrink-0'>{c.platform}</span>
								</li>
							))}
						</ul>
					</section>

					<dl className='m-0 grid grid-cols-2 border-t-[1.5px] border-linea md:grid-cols-4'>
						{[
							[d.campos.documento, "OFI-01"],
							[d.campos.certificaciones, String(certs.length)],
							[d.campos.recomendaciones, String(recs.length)],
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
					</dl>
				</article>
			</div>
		</main>
	);
};

export default OficioPage;
