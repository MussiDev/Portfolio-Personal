"use client"; // this is a client component
import React from "react";
import "../styles/globals.css";
import dynamic from "next/dynamic";
const About = dynamic(() => import("./components/About/About"));
const Main = dynamic(() => import("./components/Main/Main"));
const Projects = dynamic(() => import("./components/Projects/Projects"));
const Experience = dynamic(() => import("./components/Experience/Experience"));
const Contact = dynamic(() => import("./components/Contact/Contact"));
const Arrow = dynamic(() => import("./common/Arrow"));
const Navbar = dynamic(() => import("./components/Navbar/Navbar"));

const Home = () => {
	return (
		<main>
			<Navbar />
			<Main />
			<About />
			<Projects />
			<Experience />
			<Contact />
			<Arrow />
		</main>
	);
};

export default Home;
