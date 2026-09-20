import "../../../styles/globals.css";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
import { Archivo, Instrument_Serif, JetBrains_Mono } from "next/font/google";

import Cursor from "../../src/common/Cursor";
import Sistema from "../../src/common/Sistema";
import { getSiteData } from "../../src/common/siteData";
import WebVitals from "../../src/common/WebVitals";
import { getDict } from "../../src/i18n/dict";
import { LANGUAGES, isLanguage, type Language } from "../../../entities/i18n";
import { PERSON_ID, SITE_URL } from "../../../entities/site";
import { toJsonLdScript } from "../../../entities/jsonLd";

const label = Archivo({
	subsets: ["latin"],
	axes: ["wdth"],
	variable: "--font-rotulo",
	display: "swap",
});

const display = Instrument_Serif({
	subsets: ["latin"],
	weight: ["400"],
	style: ["normal", "italic"],
	variable: "--font-glosa",
	display: "swap",
});

const mono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-pieza",
	display: "swap",
});

const BASE_URL = SITE_URL;
const OG_LOCALE: Record<Language, string> = { es: "es_AR", en: "en_US" };

export const generateStaticParams = () => LANGUAGES.map((lang) => ({ lang }));

export const generateMetadata = async ({
	params,
}: {
	params: Promise<{ lang: string }>;
}): Promise<Metadata> => {
	const { lang } = await params;
	const l: Language = isLanguage(lang) ? lang : "es";
	const d = getDict(l);
	const title = "Joaquín Mussi — Frontend Engineer";

	return {
		metadataBase: new URL(BASE_URL),
		keywords: [
			"joaquin mussi",
			"frontend engineer",
			"frontend architect",
			"frontend architecture",
			"web performance",
			"next.js",
			"react",
			"typescript",
			"tailwind css",
			"three.js",
			"asp.net",
			"c#",
			".net",
			"clean architecture",
			"argentina",
			"portfolio",
		],
		authors: [{ name: "Joaquín Mussi", url: BASE_URL }],
		robots: { index: true, follow: true },
		manifest: "/manifest.json",
		icons: {
			icon: "/favicon.ico",
			// iOS usa este PNG para el ícono en la pantalla de inicio; un .ico lo
			// ignora y hace una captura de la página en su lugar.
			apple: "/icons/apple-touch-icon.png",
		},
		// No `url`: a child page that doesn't define openGraph (home, /en, the
		// blog index) inherited the root URL. Without og:url, scrapers use the
		// URL they fetched, which is right everywhere. Pages with their own
		// openGraph (posts, cases) still set theirs.
		openGraph: {
			type: "website",
			title,
			description: d.presentacion,
			siteName: "Joaquín Mussi Portfolio",
			locale: OG_LOCALE[l],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description: d.presentacion,
		},
		appleWebApp: {
			capable: true,
			title: "Joaquín Mussi",
			statusBarStyle: "black",
		},
		other: {
			"msapplication-TileColor": "#FF6A3A",
			"msapplication-navbutton-color": "#FF6A3A",
			copyright: "Joaquín Mussi",
		},
	};
};

// Solo datos ya públicos en el sitio (el mailto: del paso de contacto, el
// nombre del empleador que ya aparece en la tabla de Contacto). Sin
// address: no está declarada en ningún lado del sitio y no hay una fuente
// real para ella. Sin image: no hay una foto/headshot en el repo, y el
// opengraph-image de Next lleva un hash de build que no es una URL
// estable para citar acá — un schema inventado es peor que uno incompleto.
const jsonLd = (lang: Language) => ({
	"@context": "https://schema.org",
	"@type": "Person",
	// Referenced by the home's ProfilePage (page.tsx) as its mainEntity.
	"@id": PERSON_ID,
	name: "Joaquín Mussi",
	url: BASE_URL,
	email: "joakoomussi@gmail.com",
	jobTitle: "Frontend Engineer",
	inLanguage: lang,
	sameAs: ["https://github.com/MussiDev", "https://www.linkedin.com/in/joaquinmussi/"],
	worksFor: {
		"@type": "Organization",
		name: "La Mutual de AMR",
	},
	knowsAbout: [
		"Next.js",
		"React",
		"TypeScript",
		"Tailwind CSS",
		"Three.js",
		"Sanity CMS",
		"C#",
		"ASP.NET Web API",
		"SQL Server",
		"REST APIs",
		"Clean Architecture",
		"Agile SCRUM",
		"CI/CD",
	],
});

const websiteJsonLd = {
	"@context": "https://schema.org",
	"@type": "WebSite",
	name: "Joaquín Mussi Portfolio",
	url: BASE_URL,
};

// Runs while the HTML is still parsing: marks that there is JS, which the
// entrance animations in globals.css depend on. The tissue preload used to
// live here too; it now sits in the pages that actually show the brain
// (see TissuePreload.tsx), so the blog doesn't pay for it.
const BOOTSTRAP_SCRIPT = `document.documentElement.dataset.js="si";`;

const NervousSystemLayout = async ({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ lang: string }>;
}) => {
	const { lang } = await params;
	if (!isLanguage(lang)) notFound();
	const d = getDict(lang);
	// The index of the six regions: the brain lives here now, so the layout
	// is what knows them. `cache` keeps this from costing a second request
	// when the home asks for the same data.
	const { sections } = await getSiteData(lang);

	return (
		<html
			lang={lang}
			suppressHydrationWarning
			className={`${label.variable} ${display.variable} ${mono.variable}`}
		>
			<body className='bg-tejido text-senal'>
				<a
					href='#paso-1'
					className='sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-impulso focus:px-4 focus:py-2 focus:font-rotulo focus:text-xs focus:font-bold focus:uppercase focus:tracking-[.12em] focus:text-tejido'
				>
					{d.irAlContenido}
				</a>
				<script dangerouslySetInnerHTML={{ __html: BOOTSTRAP_SCRIPT }} />
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{ __html: toJsonLdScript(jsonLd(lang)) }}
				/>
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{ __html: toJsonLdScript(websiteJsonLd) }}
				/>
				<Sistema
					sections={sections}
					loadingText={d.hero.cargando}
					activityText={d.hero.evidencia}
					openText={d.hero.abrir}
					backText={d.hero.volver}
					stepsLabel={d.hero.pasos}
					scrollHintText={d.hero.bajar}
					navLabel={d.hero.navegacion}
					connectedLabel={d.hero.conectadoCon}
				>
					{children}
				</Sistema>
				<Cursor />
				<WebVitals />
			</body>
		</html>
	);
};

export default NervousSystemLayout;
