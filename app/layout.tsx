import "../styles/globals.css";

import type { Metadata } from "next";
import React from "react";
import {
	Caveat,
	IBM_Plex_Mono,
	IBM_Plex_Sans_Condensed,
	IBM_Plex_Serif,
} from "next/font/google";

const rotulo = IBM_Plex_Sans_Condensed({
	subsets: ["latin"],
	weight: ["500", "600", "700"],
	variable: "--font-rotulo",
	display: "swap",
});

const nota = IBM_Plex_Serif({
	subsets: ["latin"],
	weight: ["400", "500"],
	style: ["normal", "italic"],
	variable: "--font-nota",
	display: "swap",
});

// Lápiz: solo para lo anotado a mano sobre el dibujo, nunca para el dibujo.
// Un solo peso: nada en el código pide "medium" de esta familia, y Next
// precarga cada peso declarado exista o no un elemento que lo use.
const lapiz = Caveat({
	subsets: ["latin"],
	weight: ["400"],
	variable: "--font-lapiz",
	display: "swap",
});

// Ídem: nada pide semibold ni medium de la mono. Un peso menos precargado.
const pieza = IBM_Plex_Mono({
	subsets: ["latin"],
	weight: ["400"],
	variable: "--font-pieza",
	display: "swap",
});

const BASE_URL = "https://joaquinmussi.vercel.app";

export const metadata: Metadata = {
	metadataBase: new URL(BASE_URL),
	title: "Joaquín Mussi - Software Engineer | Full Stack Developer",
	description:
		"Joaquín Mussi — Software Engineer with 3+ years of experience building high-performance web applications. Next.js, React, TypeScript, .NET, C#, Clean Architecture, Team Leadership.",
	keywords: [
		"joaquin mussi",
		"software engineer",
		"full stack developer",
		"next.js",
		"react",
		"typescript",
		"tailwind css",
		"asp.net",
		"c#",
		".net",
		"clean architecture",
		"ux performance optimization",
		"team leadership",
		"argentina",
		"portfolio",
	],
	authors: [{ name: "Joaquín Mussi", url: BASE_URL }],
	robots: { index: true, follow: true },
	manifest: "/manifest.json",
	icons: {
		icon: "/favicon.ico",
		apple: "/favicon.ico",
	},
	alternates: {
		canonical: BASE_URL,
	},
	openGraph: {
		type: "website",
		url: BASE_URL,
		title: "Joaquín Mussi - Software Engineer | Full Stack Developer",
		description:
			"Software Engineer with 3+ years of experience. Next.js · React · TypeScript · .NET · C# · Clean Architecture · Team Leadership.",
		siteName: "Joaquín Mussi Portfolio",
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: "Joaquín Mussi - Software Engineer | Full Stack Developer",
		description:
			"Software Engineer with 3+ years of experience. Next.js · React · TypeScript · .NET · C# · Clean Architecture.",
	},
	appleWebApp: {
		capable: true,
		title: "Joaquín Mussi - Dev",
		statusBarStyle: "black",
	},
	other: {
		"msapplication-TileColor": "#F24F0F",
		"msapplication-navbutton-color": "#F24F0F",
		copyright: "Joaquín Mussi",
	},
};

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "Person",
	name: "Joaquín Mussi",
	url: BASE_URL,
	jobTitle: "Software Engineer | Full Stack Developer",
	sameAs: [
		"https://github.com/MussiDev",
		"https://www.linkedin.com/in/joaquinmussi/",
	],
	knowsAbout: [
		"Next.js",
		"React",
		"TypeScript",
		"Tailwind CSS",
		"Sass",
		"ChakraUI",
		"Styled Components",
		"Framer Motion",
		"C#",
		"ASP.NET Web API",
		"SQL Server",
		"REST APIs",
		"Clean Architecture",
		"Agile SCRUM",
		"CI/CD",
	],
};

// Corrige `<html lang>` según la ruta ("/en" o "/en/...") sin volver
// dinámico todo el sitio: leerlo en el servidor exigiría `headers()` en
// el layout raíz, y eso saca cada página del prerender estático — un
// costo que este sitio no puede pagar (regla 4 del concepto: el medio
// no puede desmentir al mensaje de performance).
const FIJAR_LANG = `document.documentElement.lang=location.pathname.match(/^\\/en(\\/|$)/)?"en":"es"`;

const RootLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<html
			lang='es'
			className={`${rotulo.variable} ${nota.variable} ${pieza.variable} ${lapiz.variable}`}
		>
			{/* El taller es la base: mesa y texto por defecto viven en :root
			    (globals.css). El sitio anterior trae los suyos propios con la
			    clase .anterior. */}
			<body className='bg-mesa text-texto'>
				<script dangerouslySetInnerHTML={{ __html: FIJAR_LANG }} />
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
				{children}
			</body>
		</html>
	);
};

export default RootLayout;
