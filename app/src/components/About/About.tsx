"use client"; // this is a client component

import React, { useEffect, useState } from "react";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const Title = dynamic(() => import("../../common/Title"), { ssr: false });
const Button = dynamic(() => import("../../common/Button"), { ssr: false });

const highlights = [
	"Team Leadership",
	"Clean Architecture",
	"Performance Optimization",
	"Legacy Migrations",
	"SEO-Optimized Apps",
	"Agile SCRUM",
	"CI/CD",
];

const About = () => {
	const [ageToday, setAgeToday] = useState(0);

	useEffect(() => {
		const today = new Date();
		const dateOfBirth = new Date("2002/02/24");
		let age = today.getFullYear() - dateOfBirth.getFullYear();
		const months = today.getMonth() - dateOfBirth.getMonth();
		if (
			months < 0 ||
			(months === 0 && today.getDate() < dateOfBirth.getDate())
		) {
			age--;
		}
		setAgeToday(age);
	}, []);

	return (
		<motion.section
			className='max-w-[77.5rem] m-auto px-4 py-16 min-h-screen flex flex-col justify-center'
			id='about'
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			transition={{ duration: 0.8 }}
			viewport={{ once: true }}
		>
			<Title title='About Me' color='orange-700' />

			<motion.div
				className='border border-slate-700 rounded-xl p-6 md:p-8 hover:border-orange-700 transition-colors duration-300 flex flex-col gap-6'
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}
				viewport={{ once: true }}
			>
				<p className='text-gray-300 text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed'>
					I&apos;m {ageToday} years old, Software Engineer with{" "}
					<span className='text-white font-semibold'>
						3+ years of experience
					</span>{" "}
					designing, developing and deploying high-performance web applications
					from scratch. Currently at{" "}
					<Link
						href='https://www.mutualamr.org.ar/'
						target='_blank'
						className='text-orange-700 underline hover:opacity-80 transition-opacity'
					>
						La Mutual de AMR
					</Link>
					, where I lead junior developers, design scalable architectures and
					migrate legacy systems to modern frameworks (Angular → Next.js, CSHTML
					→ React/Next.js). Passionate about clean architecture, performance
					optimization and continuous learning — seeking an international
					challenge to deliver impactful solutions.
				</p>

				<div className='flex flex-col gap-2'>
					<p className='text-sm text-gray-400 uppercase tracking-widest'>
						Highlights
					</p>
					<div className='flex flex-wrap gap-2'>
						{highlights.map((item) => (
							<span
								key={item}
								className='text-xs px-3 py-1 rounded-full border border-slate-600 text-gray-300'
							>
								{item}
							</span>
						))}
					</div>
				</div>

				<div className='flex flex-wrap gap-3'>
					<Button
						title='Go to LinkedIn'
						href='https://www.linkedin.com/in/joaquinmussi/'
						blank={true}
						variant='primary'
					/>
					<Button
						title='View CV'
						href='pdf.pdf'
						blank={true}
						variant='secondary'
					/>
				</div>
			</motion.div>
		</motion.section>
	);
};

export default About;
