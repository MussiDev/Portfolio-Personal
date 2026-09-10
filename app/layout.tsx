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
const lapiz = Caveat({
	subsets: ["latin"],
	weight: ["400", "500"],
	variable: "--font-lapiz",
	display: "swap",
});

const pieza = IBM_Plex_Mono({
	subsets: ["latin"],
	weight: ["400", "500", "600"],
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

const RootLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<html
			lang='en'
			className={`${rotulo.variable} ${nota.variable} ${pieza.variable} ${lapiz.variable}`}
		>
			<body className='text-white bg-slate-800'>
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
