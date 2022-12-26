import React from "react";
import Main from "../Main/Main";
import Navbar from "../Navbar/Navbar";

const Home = () => {
	return (
		<div className='min-h-screen text-white max-w-screen bg-slate-800'>
			<Navbar />
			<Main />
		</div>
	);
};

export default Home;
