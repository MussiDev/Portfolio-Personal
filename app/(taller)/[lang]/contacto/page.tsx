import type { Metadata } from "next";
import Link from "next/link";

import FormularioContacto from "../../../src/components/Taller/FormularioContacto";
import { getDict } from "../../../src/i18n/dict";
import { alternativas } from "../../../src/i18n/meta";
import { ruta, type Idioma } from "../../../../entities/i18n";

const COPY = {
	es: {
		titulo: "Contacto",
		glosa: "la puerta está abierta",
		bajada:
			"Si algo de lo que hay sobre la mesa te sirve, o querés que mire un sistema que no termina de cerrar, escribime. Respondo todo.",
		descripcion:
			"Escribile a Joaquín Mussi: arquitectura, migraciones y performance en aplicaciones web.",
		otros: "También estoy en",
	},
	en: {
		titulo: "Contact",
		glosa: "the door is open",
		bajada:
			"If something on the bench is useful to you, or you want me to look at a system that does not quite add up, write to me. I answer everything.",
		descripcion:
			"Write to Joaquín Mussi: architecture, migrations and performance in web applications.",
		otros: "You can also find me on",
	},
};

export const generateMetadata = async ({
	params,
}: {
	params: Promise<{ lang: Idioma }>;
}): Promise<Metadata> => {
	const { lang } = await params;
	const c = COPY[lang];

	return {
		title: `${c.titulo} — Joaquín Mussi`,
		description: c.descripcion,
		alternates: alternativas(lang, "/contacto"),
	};
};

const ContactoPage = async ({
	params,
}: {
	params: Promise<{ lang: Idioma }>;
}) => {
	const { lang } = await params;
	const d = getDict(lang);
	const c = COPY[lang];

	return (
		<main className='taller min-h-screen px-5 py-12 md:px-16 md:py-16'>
			<div className='mx-auto flex max-w-[880px] flex-col gap-8'>
				<Link
					href={ruta(lang)}
					className='w-fit font-rotulo text-xs font-semibold uppercase tracking-[.12em] text-linea hover:text-marca'
				>
					← {d.volverMesa}
				</Link>

				<article className='hoja marcas relative px-7 py-9 md:px-14 md:py-14'>
					<div className='mb-8 flex flex-col gap-4'>
						<div className='flex flex-wrap items-baseline gap-x-4 gap-y-1'>
							<h1 className='m-0 text-4xl leading-none md:text-5xl'>{c.titulo}</h1>
							<span className='font-lapiz text-[22px] leading-none text-texto-medio'>
								{c.glosa}
							</span>
						</div>
						<p className='m-0 max-w-[54ch] font-nota text-xl leading-snug'>
							{c.bajada}
						</p>
					</div>

					<FormularioContacto lang={lang} />

					<p className='mt-8 flex flex-wrap items-baseline gap-x-5 gap-y-2 font-pieza text-xs text-texto-medio'>
						<span>{c.otros}</span>
						<a
							href='https://www.linkedin.com/in/joaquinmussi/'
							target='_blank'
							rel='noreferrer'
							className='underline decoration-linea/40 underline-offset-4 hover:text-linea'
						>
							LinkedIn
						</a>
						<a
							href='https://github.com/MussiDev'
							target='_blank'
							rel='noreferrer'
							className='underline decoration-linea/40 underline-offset-4 hover:text-linea'
						>
							GitHub
						</a>
					</p>
				</article>
			</div>
		</main>
	);
};

export default ContactoPage;
