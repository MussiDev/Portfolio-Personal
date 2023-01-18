import React from "react";
import projectItem from "../entities/projectItem";
import Button from "./Button";
import { motion } from "framer-motion";

const ProjectItem = (props: projectItem) => {
	const { src, github, page, paragraph, icon } = props;
	return (
		<section className='shadow-sky-900 p-4 shadow-xl'>
			<div className='div'>
				<motion.img
					src={src}
					id='img'
					alt='project'
					initial={{ objectPosition: "top" }}
					whileHover={{
						objectPosition: "bottom",
					}}
				/>
			</div>
			<p className='py-4 h-24 max-h-24 text-justify text-lg'>{paragraph}</p>
			<span className='flex justify-center items-center gap-4'>{icon}</span>
			<div className='flex items-center justify-center gap-4 py-4'>
				<Button title='Demo' href={page} />
				<Button title='Code' href={github} />
			</div>
		</section>
	);
};

export default ProjectItem;
