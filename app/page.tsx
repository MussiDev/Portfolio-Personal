"use client"; // this is a client component

import "../styles/globals.css";

import React from "react";
import dynamic from "next/dynamic";

const About = dynamic(() => import("./src/components/About/About"), {
	ssr: false,
});
const Main = dynamic(() => import("./src/components/Main/Main"), {
	ssr: false,
});
const Projects = dynamic(() => import("./src/components/Projects/Projects"), {
	ssr: false,
});
const Experience = dynamic(
	() => import("./src/components/Experience/Experience"),
	{
		ssr: false,
	}
);
const Contact = dynamic(() => import("./src/components/Contact/Contact"), {
	ssr: false,
});
const Arrow = dynamic(() => import("./src/common/Arrow"), { ssr: false });
const Navbar = dynamic(() => import("./src/components/Navbar/Navbar"), {
	ssr: false,
});
const Footer = dynamic(() => import("./src/components/Footer/Footer"), {
	ssr: false,
});

const Home = () => {
	return (
		<main>
			<Navbar />
			<Main />
			<About />
			{/*<Projects />*/}
			<Experience />
			<Contact />
			<Arrow />
			<Footer />
		</main>
	);
};

export default Home;
