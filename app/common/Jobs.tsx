"use client"; // this is a client component
import React from "react";
import jobsItem from "../../entities/jobsItem";
import { motion } from "framer-motion";

const Jobs = (props: jobsItem) => {
	const { position, company, time, description, icons } = props;
	return (
		<motion.section
			className='flex gap-2 flex-col md:flex '
			initial={{ opacity: 0, y: -100 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 1.5 }}
			viewport={{ once: true }}>
			<div className='grid md:flex md:items-center gap-6'>
				<h1 className='text-3xl'>{position}</h1>
				<div id='icons'>{icons}</div>
			</div>
			<div>
				<h1 className='text-orange-700 text-2xl'>{company}</h1>
				<span>/ {time}</span>
				<p>{description}</p>
			</div>
		</motion.section>
	);
};

export default Jobs;
