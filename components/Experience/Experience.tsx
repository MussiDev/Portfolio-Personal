import React from "react";
import Jobs from "../../common/Jobs";
import Title from "../../common/Title";

const Experience = () => {
	return (
		<section
			className='max-w-[1240px] m-auto px-4 md:h-screen py-16'
			id='experience'>
			<Title title='Experience' color='orange-700' />
			<div className='flex flex-col gap-6 pt-6'>
				<Jobs
					position='Full Stack Developer'
					company='La Mutual de AMR'
					time='JUNE 2022 - NOW'
					description="I work with ChakraUI and SASS for styles, adapting the web to different devices, I'm charge of connecting the backend with the frontend. I'm participating in the backend by creating APIs.
				I use Postman for test endpoints. I modify old code made in CSHTML (HMTL IN C#) and then migrate it to NextJs. I test components with Jest and I always respect the principles of solid and clean code allowing its reuse. I apply SCRUM for agile and efficient work (JIRA), CI/CD and Gitlab."
				/>
				<Jobs
					position='Front End Developer'
					company='IT Tech Group'
					time='FEBRUARY 2022 - JULY 2022'
					description='I used ReactJS, I designed with Styled Components and TailwindCSS adapting the web to different devices I used Framer Motion and Development of web pages according to UX/UI design. Some projects in which I participated CRYPTGO, Reforce Infinity and Sniper Bot.'
				/>
				<Jobs
					position='Python Developer'
					company='Hotel Costa Azul'
					time='DECEMBER 2020 - JANUARY 2021'
					description='My job was to participate in the development of an application. Tasks performed: simple login, store in a dictionary 2 previously registered users, creation of two modules that can be accessed depending on the type of privilege either manager or reception.'
				/>
			</div>
		</section>
	);
};

export default Experience;
