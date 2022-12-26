import React from "react";
import { FaArrowDown } from "react-icons/fa";

const Main = () => {
	return (
		<section className='flex flex-col h-screen gap-6 px-10 pt-40'>
			<span className='flex flex-col gap-4 text-3xl font-light text-orange-700 '>
				Hi, I'm
				<h3 className='text-5xl font-normal text-white'>Joaquín Mussi</h3>
			</span>
			<h3 className='text-2xl'>
				FullStack Developer
				<span className='text-orange-700 '> at</span> La Mutual De Socios de AMR
			</h3>
			<button className='flex items-center gap-2 p-2 bg-orange-700 rounded-full text-md w-max'>
				More Information
				<FaArrowDown />
			</button>
		</section>
	);
};

export default Main;
