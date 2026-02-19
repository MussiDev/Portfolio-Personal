"use client";

import React, { useEffect } from "react";

import Main from "../src/components/Main/Main";
import dynamic from "next/dynamic";
import { scroller } from "react-scroll";

const About = dynamic(() => import("../src/components/About/About"), {
	ssr: false,
});
const Experience = dynamic(
	() => import("../src/components/Experience/Experience"),
	{ ssr: false },
);
const Projects = dynamic(() => import("../src/components/Projects/Projects"), {
	ssr: false,
});
const Certifications = dynamic(
	() => import("../src/components/Certifications/Certifications"),
	{ ssr: false },
);
const Recommendations = dynamic(
	() => import("../src/components/Recommendations/Recommendations"),
	{ ssr: false },
);
const Contact = dynamic(() => import("../src/components/Contact/Contact"), {
	ssr: false,
});

const ClientSections = () => {
	useEffect(() => {
		const hash = window.location.hash;
		if (hash) {
			const target = hash.slice(1);
			setTimeout(() => {
				scroller.scrollTo(target, {
					smooth: true,
					offset: -70,
					duration: 800,
				});
				window.history.replaceState(null, "", "/");
			}, 100);
		}
	}, []);

	return (
		<main>
			<Main />
			<About />
			<Experience />
			<Projects />
			<Certifications />
			<Recommendations />
			<Contact />
		</main>
	);
};

export default ClientSections;
