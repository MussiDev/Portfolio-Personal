import "../../../styles/globals.css";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
import { Archivo, Instrument_Serif, JetBrains_Mono } from "next/font/google";

import { BRAIN2D_PATH } from "../../src/common/brain2dAsset";
import { BRAIN_BIN_PATH } from "../../src/common/brainAsset";
import Cursor from "../../src/common/Cursor";
import WebVitals from "../../src/common/WebVitals";
import { getDict } from "../../src/i18n/dict";
import { LANGUAGES, isLanguage, type Language } from "../../../entities/i18n";
import { SITE_URL } from "../../../entities/site";
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
		openGraph: {
			type: "website",
			url: BASE_URL,
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

/**
 * Corre durante el parseo del HTML, antes de cualquier hidratación.
 *
 * Además de marcar que hay JS (de lo que dependen las animaciones de
 * entrada en globals.css), arranca la descarga del tejido del cerebro.
 *
 * El .bin pesa 466 KB y se pedía recién al final de una cascada de siete
 * pasos en serie: HTML → bundle → hidratación → efecto de useIsDesktop →
 * import dinámico de Brain3D → chunk de three.js → fetch. Medido: el
 * documento queda interactivo a los ~32ms y el .bin no arrancaba hasta los
 * ~487ms.
 *
 * ¿Por qué acá y no un <link rel="preload"> en el JSX? Porque React lo
 * descarta silenciosamente (no llega al HTML), y su API soportada,
 * ReactDOM.preload(), no acepta `media` — sin eso, mobile se bajaría los
 * 466 KB que d3d9cb0 decidió no descargar. El matchMedia de acá mantiene
 * esa decisión intacta.
 *
 * `crossOrigin` no es decorativo: sin él el preload queda en modo no-cors,
 * no matchea el fetch() de Brain3D, y el archivo se descarga dos veces.
 */
// Cada viewport precarga SU cerebro: el 3D (466 KB) en desktop, la
// proyección 2D (~27 KB) en mobile. Nunca los dos.
const BOOTSTRAP_SCRIPT = `document.documentElement.dataset.js="si";
var l=document.createElement("link");
l.rel="preload";l.as="fetch";l.crossOrigin="anonymous";
l.href=matchMedia("(min-width: 768px)").matches?${JSON.stringify(BRAIN_BIN_PATH)}:${JSON.stringify(BRAIN2D_PATH)};
document.head.appendChild(l);`;

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
				{children}
				<Cursor />
				<WebVitals />
			</body>
		</html>
	);
};

export default NervousSystemLayout;
