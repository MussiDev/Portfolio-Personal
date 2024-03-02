"use client"; // this is a client component

import "../styles/globals.css";

import React from "react";
import dynamic from "next/dynamic";

const About = dynamic(() => import("./components/About/About"), { ssr: false });
const Main = dynamic(() => import("./components/Main/Main"), { ssr: false });
const Projects = dynamic(() => import("./components/Projects/Projects"), {
	ssr: false,
});
const Experience = dynamic(() => import("./components/Experience/Experience"), {
	ssr: false,
});
const Contact = dynamic(() => import("./components/Contact/Contact"), {
	ssr: false,
});
const Arrow = dynamic(() => import("./common/Arrow"), { ssr: false });
const Navbar = dynamic(() => import("./components/Navbar/Navbar"), {
	ssr: false,
});
const Footer = dynamic(() => import("./components/Footer/Footer"), {
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
