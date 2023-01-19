import React from "react";
import projectItem from "../entities/projectItem";
import Button from "./Button";
import { motion } from "framer-motion";

const ProjectItem = (props: projectItem) => {
	const { src, github, page, paragraph, icon } = props;
	return (
		<section className='shadow-sky-900 p-4 shadow-xl'>
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
			<span className='flex justify-center items-center gap-4'>{icon}</span>
			<div className='flex items-center justify-center gap-4 py-4'>
				<Button title='Demo' href={page} blank={true} />
				<Button title='Code' href={github} blank={true} />
			</div>
		</section>
	);
};

export default ProjectItem;
