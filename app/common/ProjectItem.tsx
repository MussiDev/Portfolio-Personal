"use client"; // this is a client component
import React from "react";
import projectItem from "../../entities/projectItem";
import Button from "./Button";
import { motion } from "framer-motion";

const ProjectItem = (props: projectItem) => {
	const { src, github, page, paragraph, icon } = props;
	return (
		<section className='shadow-orange-700 p-4 rounded-xl shadow-3xl'>
			<motion.div
				className='div'
				initial={{ x: -200, opacity: 0 }}
				whileInView={{
					x: 0,
					opacity: 1,
				}}
				transition={{ duration: 1.2 }}>
				<motion.img
					src={src}
					id='img'
					alt='project'
					initial={{ objectPosition: "top" }}
					whileHover={{
						objectPosition: "bottom",
					}}
				/>
			</motion.div>
			<p className='py-4 h-24 max-h-24 text-justify text-lg'>{paragraph}</p>
			<p className='flex justify-center items-center gap-4'>{icon}</p>
			<div className='flex items-center justify-center gap-4 py-4'>
				<Button title='Demo' href={page} blank={true} />
				<Button title='Code' href={github} blank={true} />
			</div>
		</section>
	);
};

export default ProjectItem;
