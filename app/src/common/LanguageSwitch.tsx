"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LANGUAGES, localizedPath, type Language } from "../../../entities/i18n";

const pathFor = (pathname: string, lang: Language) => {
	const withoutPrefix = LANGUAGES.reduce(
		(p, l) => (p === `/${l}` ? "/" : p.startsWith(`/${l}/`) ? p.slice(l.length + 1) : p),
		pathname,
	);
	return localizedPath(lang, withoutPrefix);
};

const LanguageSwitch = ({ current }: { current: Language }) => {
	const pathname = usePathname() ?? "/";

	return (
		<nav
			aria-label='Idioma'
			className='flex items-center gap-2 font-pieza text-xs'
		>
			{LANGUAGES.map((lang, i) => (
				<span key={lang} className='flex items-center gap-2'>
					{i > 0 && <span className='text-sinapsis/40'>/</span>}
					<Link
						href={pathFor(pathname, lang)}
						hrefLang={lang}
						aria-current={lang === current ? "true" : undefined}
						className={
							lang === current
								? "border-b border-impulso pb-0.5 text-impulso"
								: "text-mielina hover:text-sinapsis"
						}
					>
						{lang.toUpperCase()}
					</Link>
				</span>
			))}
		</nav>
	);
};

export default LanguageSwitch;
