"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Title from "../../common/Title";

const TypewriterTitle = dynamic(() => import("../../common/TypewriterTitle"), {
	ssr: false,
	loading: () => <Title title="Software Engineer" />,
});

const Button = dynamic(() => import("../../common/Button"), { ssr: false });

const skills = [
	"Next.js",
	"React",
	"TypeScript",
	".NET",
	"C#",
	"Tailwind CSS",
	"Clean Architecture",
];

const Main = () => {
	return (
		<motion.section
			className='w-full h-screen text-center py-16'
			id='home'
			initial={{ opacity: 0, y: 40 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
		>
			<div className='max-w-[1240px] w-full h-full mx-auto px-4 flex justify-center items-center'>
				<div className='flex flex-col items-center gap-4'>
					<p className='uppercase text-sm tracking-widest text-gray-400'>
						Hi, I&apos;m
					</p>

					<Title title='Joaquín Mussi' color='orange-700' tag='h1' />
					<TypewriterTitle />

					<p className='text-gray-300 sm:max-w-[60%] text-sm md:text-base lg:text-lg leading-relaxed'>
						Software Engineer · Full Stack Developer focused on{" "}
						<span className='text-white font-semibold'>
							performance, clean architecture and scalable solutions.
						</span>
					</p>

					<motion.div
						className='flex flex-wrap justify-center gap-2 py-2'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.4 }}
					>
						{skills.map((skill) => (
							<span
								key={skill}
								className='text-xs px-3 py-1 rounded-full border border-slate-600 text-gray-300 hover:border-orange-700 hover:text-orange-700 transition-colors duration-200'
							>
								{skill}
							</span>
						))}
					</motion.div>

					<Button
						title='About Me'
						icon='arrowDown'
						href='about'
						more={true}
						variant='primary'
					/>
				</div>
			</div>
		</motion.section>
	);
};

export default Main;
