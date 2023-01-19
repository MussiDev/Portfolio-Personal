"use client"; // this is a client component
import React from "react";
import "../styles/globals.css";
import About from "./components/About/About";
import Main from "./components/Main/Main";
import Projects from "./components/Projects/Projects";
import Experience from "./components/Experience/Experience";
import Contact from "./components/Contact/Contact";
import Arrow from "./common/Arrow";
import Navbar from "./components/Navbar/Navbar";

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
