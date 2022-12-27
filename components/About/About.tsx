import React, { use, useEffect, useState } from "react";

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
		<section className='px-10 '>
			<h1 className='text-3xl'>About Me</h1>
			<div className='h-1 bg-orange-800 w-36'></div>
			<p>
				I'm {ageToday} years old and I'm FullStack Developer self-taught. I am a
				person that if there is something that he does not know, he learns it.
				My passion by the technology, It took me to be Computer Technician and I
				study web development self-taught, I studied Systems Engineering( from
				2020 to 2021) but I decided don´t follow the carrer for to study on my
				own. Football lover and the programming. I stand out for being a
				proactive person.
			</p>
		</section>
	);
};

export default About;
