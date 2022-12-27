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
			<motion.button
				whileHover={{ scale: 1.1, transition: { duration: 0.4 } }}
				className='flex items-center gap-2 p-2 bg-orange-700 rounded-full text-md w-max hover:bg-white hover:text-orange-700'>
				More Information
				<motion.span
					animate={{ y: ["2px", "-2px", "2px"] }}
					transition={{ duration: 1, repeat: Infinity }}>
					<FaArrowDown />
				</motion.span>
			</motion.button>
		</section>
	);
};

export default Main;
