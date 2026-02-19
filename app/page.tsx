import React from "react";
import dynamic from "next/dynamic";
import Main from "./src/components/Main/Main";

const About = dynamic(() => import("./src/components/About/About"), {
	ssr: false,
});
const Experience = dynamic(
	() => import("./src/components/Experience/Experience"),
	{ ssr: false },
);
const Projects = dynamic(() => import("./src/components/Projects/Projects"), {
	ssr: false,
});
const Articles = dynamic(
	() => import("./src/components/Articles/Articles"),
	{ ssr: false },
);
const Certifications = dynamic(
	() => import("./src/components/Certifications/Certifications"),
	{ ssr: false },
);
const Recommendations = dynamic(
	() => import("./src/components/Recommendations/Recommendations"),
	{ ssr: false },
);
const Contact = dynamic(() => import("./src/components/Contact/Contact"), {
	ssr: false,
});

const Home = () => {
	return (
		<main>
			<Main />
			<About />
			<Experience />
			<Projects />
			<Articles />
			<Certifications />
			<Recommendations />
			<Contact />
		</main>
	);
};

export default Home;
