import React from "react";
import { FaArrowDown } from "react-icons/fa";
import { motion } from "framer-motion";

const Main = () => {
	return (
		<section className='flex flex-col justify-center h-screen gap-8 px-10'>
			<div className='flex flex-col gap-2 text-3xl font-light text-white '>
				Hi, I'm
				<h3 className='text-5xl font-normal text-orange-700'>Joaquín Mussi</h3>
			</div>
			<h3 className='text-2xl'>
				FullStack Developer at
				<span className='text-orange-700 '> @La Mutual De Socios de AMR</span>
			</h3>
			<h3 className='text-2xl'>
				Computer Security Student at
				<span className='text-orange-700 '> @EducacionIT</span>
			</h3>
			<button className='flex items-center gap-2 p-2 bg-orange-700 rounded-full text-md w-max'>
				More Information
				<motion.span
					animate={{ y: ["5px", "-5px", "5px"] }}
					transition={{ duration: 2, repeat: Infinity }}>
					<FaArrowDown />
				</motion.span>
			</button>
		</section>
	);
};

export default Main;
