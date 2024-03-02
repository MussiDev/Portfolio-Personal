"use client";

const Main = dynamic(() => import("./src/components/Main/Main"), {
	ssr: false,
});
const About = dynamic(() => import("./src/components/About/About"), {
	ssr: false,
});
const Experience = dynamic(
	() => import("./src/components/Experience/Experience"),
	{ ssr: false }
);
const Contact = dynamic(() => import("./src/components/Contact/Contact"), {
	ssr: false,
});

import React from "react";
import dynamic from "next/dynamic";

const Home = () => {
	return (
		<main>
			<Main />
			<About />
			<Experience />
			<Contact />
		</main>
	);
};

export default Home;
