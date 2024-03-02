"use client"; // this is a client component

import { FaCircle } from "react-icons/fa";
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
			viewport={{ once: true }}
		>
			<h1 className='text-orange-700 text-3xl'>{company}</h1>

			<>
				<div className='grid md:flex md:items-center gap-6 ml-2'>
					<h1 className='text-2xl flex flex-row gap-2 items-center'>
						<span>
							<FaCircle color='rgb(242 79 15)' size={18} />
						</span>

						{position}
					</h1>
					<div id='icons'>{icons}</div>
				</div>
				<p className='ml-8'>/ {time}</p>
				<p className='ml-8 flex flex-row gap-2 items-center'>{description}</p>
			</>
		</motion.section>
	);
};

export default Jobs;
