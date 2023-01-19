"use client"; // this is a client component
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Button from "../../common/Button";
import Title from "../../common/Title";
import { motion } from "framer-motion";
const About = () => {
	const [ageToday, setAgeToday] = useState(0);

	const getAge = () => {
		let today = new Date();
		let dateOfBirth = new Date("2002/02/24");
		let age = today.getFullYear() - dateOfBirth.getFullYear();
		let months = today.getMonth() - dateOfBirth.getMonth();
		if (
			months < 0 ||
			(months === 0 && today.getDate() < dateOfBirth.getDate())
		) {
			age--;
		}
		return setAgeToday(age);
	};

	useEffect(() => {
		getAge();
	}, []);

	return (
		<motion.section
			className='flex items-center w-full px-4 h-screen py-16'
			id='about'
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			transition={{ duration: 2 }}>
			<div className='max-w-[1240px] m-auto md:flex flex-col gap-4'>
				<Title title='About Me' color='orange-700' />
				<motion.p
					className='text-lg md:text-xl lg:text-2xl'
					initial={{ x: -200, opacity: 0 }}
					whileInView={{ opacity: 1, x: 0 }}
					transition={{ duration: 1.2 }}
					viewport={{ once: true }}>
					I'm {ageToday} years old, I'm FullStack Developer at &nbsp;
					<Link
						href='https://www.mutualamr.org.ar/'
						target='_blank'
						className='text-orange-700 underline'>
						La Mutual De Socios de AMR
					</Link>
					&nbsp; and I'm Computer Security Student at &nbsp;
					<Link
						href='https://www.educacionit.com/'
						target='_blank'
						className='text-orange-700 underline'>
						Educacion IT
					</Link>
					&nbsp;. I am a person that if there is something that he does not
					know, he learns it. My passion by the technology, It took me to be
					Computer Technician and I study web development self-taught, I studied
					Systems Engineering( from 2020 to 2021 ) but I decided don´t follow
					the carrer for to study on my own. Football lover and the programming.
					I stand out for being a proactive person who tries to improve his way
					of writing code on a daily basis.
				</motion.p>

				<div className='flex justify-center gap-2 py-4 w-max'>
					<Button
						title='Ir a Linkedin'
						href='https://www.linkedin.com/in/joaquinmussi/'
						blank={true}
					/>
					<Button title='Ver CV' href='/CV' />
				</div>
			</div>
		</motion.section>
	);
};

export default About;
