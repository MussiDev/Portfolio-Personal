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
			className='flex items-center gap-2 font-mono text-xs'
		>
			{LANGUAGES.map((lang, i) => (
				<span key={lang} className='flex items-center gap-2'>
					{i > 0 && <span className='text-synapse/40'>/</span>}
					{/* The tap target lives on the <a> (min-h-11 = 44px) and the
					underline on a <span> inside it: if the padding were on the
					link, the bottom border would detach from the text. These
					links used to measure 19px, and they're the only way to
					change language. */}
					<Link
						href={pathFor(pathname, lang)}
						hrefLang={lang}
						aria-current={lang === current ? "true" : undefined}
						className='inline-flex min-h-11 items-center px-1'
					>
						<span
							className={
								lang === current
									? "border-b border-impulse pb-0.5 text-impulse"
									: "text-myelin hover:text-synapse"
							}
						>
							{lang.toUpperCase()}
						</span>
					</Link>
				</span>
			))}
		</nav>
	);
};

export default LanguageSwitch;
