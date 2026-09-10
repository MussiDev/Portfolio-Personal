"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { IDIOMAS, ruta, type Idioma } from "../../../entities/i18n";

/**
 * El cambio de idioma conserva la página en la que estás.
 *
 * El español no lleva prefijo, así que la misma ruta se escribe distinto en
 * cada idioma: `/maquinas` y `/en/maquinas`. Acá se traduce la URL actual,
 * no se vuelve al inicio — perder el lugar al cambiar de idioma es la forma
 * más rápida de que nadie lo use dos veces.
 */
const rutaEn = (pathname: string, lang: Idioma) => {
	// `/en` y `/en/algo` pierden el prefijo; el español nunca lo tuvo.
	const sinPrefijo = IDIOMAS.reduce(
		(p, l) => (p === `/${l}` ? "/" : p.startsWith(`/${l}/`) ? p.slice(l.length + 1) : p),
		pathname,
	);
	return ruta(lang, sinPrefijo);
};

const Idiomas = ({ actual }: { actual: Idioma }) => {
	const pathname = usePathname() ?? "/";

	return (
		<nav
			aria-label='Idioma'
			className='flex items-center gap-2 font-pieza text-xs'
		>
			{IDIOMAS.map((lang, i) => (
				<span key={lang} className='flex items-center gap-2'>
					{i > 0 && <span className='text-linea/40'>/</span>}
					<Link
						href={rutaEn(pathname, lang)}
						hrefLang={lang}
						aria-current={lang === actual ? "true" : undefined}
						className={
							lang === actual
								? "border-b border-marca pb-0.5 text-marca"
								: "text-texto-medio hover:text-linea"
						}
					>
						{lang.toUpperCase()}
					</Link>
				</span>
			))}
		</nav>
	);
};

export default Idiomas;
