"use client"; // this is a client component
import React from "react";
import jobsItem from "../../entities/jobsItem";
import { motion } from "framer-motion";

const Jobs = (props: jobsItem) => {
	const { position, company, time, description, icons } = props;
	return (
		<motion.section
			className='flex gap-6 flex-col md:flex md:items-center'
			initial={{ opacity: 0, y: -100 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 1.5 }}
			viewport={{ once: true }}>
			<div className='grid md:flex gap-6'>
				<h4>{position}</h4>
				<div id='icons'>{icons}</div>
			</div>
			<div>
				<h5 className='text-orange-700'>{company}</h5>
				<span>/ {time}</span>
				<p>{description}</p>
			</div>
		</motion.section>
	);
};

export default Jobs;
