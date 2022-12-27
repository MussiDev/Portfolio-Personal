import React from "react";
import { FaArrowDown } from "react-icons/fa";
import { motion } from "framer-motion";
import Title from "../../common/Title";
import Button from "../../common/Button";

const Main = () => {
	return (
		<section className='flex flex-col justify-center h-screen gap-8 px-10'>
			<div className='flex flex-col gap-2 text-3xl font-light text-white '>
				Hi, I'm
				<h3 className='text-5xl font-normal text-orange-700'>Joaquín Mussi</h3>
			</div>
			<Title
				title='FullStack Developer at'
				text='@La Mutual De Socios de AMR'
			/>
			<Title title='Computer Security Student at' text='@EducacionIT' />
			<Button title='More Information' icon='arrowDown' />
		</section>
	);
};

export default Main;
