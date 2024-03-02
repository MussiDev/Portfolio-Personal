"use client";

import { About, Contact, Experience, Main } from "./src/components";

import React from "react";

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
