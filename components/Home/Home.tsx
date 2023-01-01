import React from "react";
import About from "../About/About";
import Main from "../Main/Main";
import Navbar from "../Navbar/Navbar";

const Home = () => {
	return (
		<div className='text-white bg-slate-800'>
			<Navbar />
			<Main />
			<About />
		</div>
	);
};

export default Home;
