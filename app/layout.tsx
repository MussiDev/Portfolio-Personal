import "../styles/globals.css";

import type { Metadata } from "next";
import React from "react";

import Cursor from "./src/common/Cursor";
import { Archivo, Instrument_Serif, JetBrains_Mono } from "next/font/google";

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

const BASE_URL = "https://joaquinmussi.vercel.app";

export const metadata: Metadata = {
	metadataBase: new URL(BASE_URL),
	title: "Joaquín Mussi - Frontend Engineer | Frontend Architecture & Web Performance",
	description:
		"Joaquín Mussi — Frontend Engineer with 4+ years of experience. Frontend architecture and web performance for internal platforms used by thousands. Next.js, React, TypeScript, .NET APIs, Clean Architecture.",
	keywords: [
		"joaquin mussi",
		"software engineer",
		"frontend engineer",
		"frontend architect",
		"frontend architecture",
		"web performance",
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
		title: "Joaquín Mussi - Frontend Engineer | Frontend Architecture & Web Performance",
		description:
			"Frontend Engineer with 4+ years of experience. Frontend architecture · Web performance · Next.js · React · TypeScript · .NET APIs.",
		siteName: "Joaquín Mussi Portfolio",
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: "Joaquín Mussi - Frontend Engineer | Frontend Architecture & Web Performance",
		description:
			"Frontend Engineer with 4+ years of experience. Frontend architecture · Web performance · Next.js · React · TypeScript.",
	},
	appleWebApp: {
		capable: true,
		title: "Joaquín Mussi - Frontend",
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
	jobTitle: "Frontend Engineer | Frontend Architecture & Web Performance",
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

const BOOTSTRAP_SCRIPT = `document.documentElement.lang=location.pathname.match(/^\\/en(\\/|$)/)?"en":"es";document.documentElement.dataset.js="si"`;

const RootLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<html
			lang='es'
			suppressHydrationWarning
			className={`${label.variable} ${display.variable} ${mono.variable}`}
		>
			<body className='bg-tejido text-senal'>
				<script dangerouslySetInnerHTML={{ __html: BOOTSTRAP_SCRIPT }} />
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
				{children}
				<Cursor />
			</body>
		</html>
	);
};

export default RootLayout;
