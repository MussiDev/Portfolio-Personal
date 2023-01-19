import Link from "next/link";
import React, { useEffect, useState } from "react";
import Button from "../../common/Button";
import Title from "../../common/Title";

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
		<section
			className='flex items-center w-full px-4 h-screen py-16'
			id='about'>
			<div className='max-w-[1240px] m-auto md:flex flex-col gap-4'>
				<Title title='About Me' color='orange-700' />
				<p className='text-lg md:text-xl lg:text-2xl'>
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
				</p>

				<div className='flex justify-center gap-2 py-4 w-max'>
					<Button
						title='Ir a Linkedin'
						href='https://www.linkedin.com/in/joaquinmussi/'
						blank={true}
					/>
					<Button
						title='Ver CV'
						href='https://www.linkedin.com/in/joaquinmussi/overlay/1635496971541/single-media-viewer/?profileId=ACoAAC02pwQBbNVRGKzh4Vf6UOcbHMXkNtJkn8U'
						blank={true}
					/>
				</div>
			</div>
		</section>
	);
};

export default About;
