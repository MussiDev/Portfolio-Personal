import React, { use, useEffect, useState } from "react";
import Button from "../../common/Button";

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
		<section id='about' className='flex flex-col justify-center  gap-4 '>
			<div>
				<h1 className='text-3xl'>About Me</h1>
				<p className='h-2 bg-orange-800 rounded-full w-36' />
			</div>
			<p>
				I'm {ageToday} years old, I'm FullStack Developer and I'm Computer
				Security Student. I am a person that if there is something that he does
				not know, he learns it. My passion by the technology, It took me to be
				Computer Technician and I study web development self-taught, I studied
				Systems Engineering( from 2020 to 2021) but I decided don´t follow the
				carrer for to study on my own. Football lover and the programming. I
				stand out for being a proactive person.
			</p>
			<div className='flex justify-center gap-2'>
				<Button
					title='Ir a Linkedin'
					href='https://www.linkedin.com/in/joaquinmussi/'
					blank={true}
				/>
				<Button title='Ver CV' href='' />
			</div>
		</section>
	);
};

export default About;
