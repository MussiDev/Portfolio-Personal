import {
	About,
	Contact,
	Experience,
	Footer,
	Main,
	Navbar,
} from "./src/components";

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
