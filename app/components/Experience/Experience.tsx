import { FaReact, FaSass } from "react-icons/fa";
import {
	SiChakraui,
	SiFramer,
	SiNextdotjs,
	SiRedux,
	SiTailwindcss,
	SiTypescript,
} from "react-icons/si";

import { DiDotnet } from "react-icons/di";
import React from "react";
import { TbCSharp } from "react-icons/tb";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const Jobs = dynamic(() => import("../../common/Jobs"), { ssr: false });
const Title = dynamic(() => import("../../common/Title"), { ssr: false });

const Experience = () => {
	return (
		<motion.section
			className='max-w-[1240px] m-auto px-4 md:min-h-screen py-16'
			id='experience'
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			transition={{ duration: 2 }}
		>
			<Title title='Experience' color='orange-700' />
			<div className='flex flex-col gap-6 pt-6'>
				<Jobs
					company='UnWrap'
					position='Frontend Developer'
					icons={[
						<SiNextdotjs
							key='key'
							size={50}
							className='text-black rounded-full hover:scale-125 duration-700 bg-white'
						/>,
						<SiTailwindcss
							key='key2'
							size={50}
							className='text-cyan-500 hover:scale-125 duration-700'
						/>,
						<SiTypescript
							key='key3'
							size={40}
							className='text-blue-500 hover:scale-125 duration-700'
						/>,
						<SiRedux
							key='key4'
							size={50}
							className='text-purple-500 hover:scale-125 duration-700'
						/>,
					]}
					time='NOVEMBER 2023 - NOW'
					description='We build your own app or website with modern design, accessible, efficient, trend tecnologies and SEO-friendly. Satisfying your clients with a modern app that includes everyone will help you increase your sales and be better indexed by web search engines in terms of accessibility principles and guidelines as per WCAG.'
				/>
				<Jobs
					company='La Mutual de AMR'
					position='Software Engineer'
					icons={[
						<SiNextdotjs
							key='key'
							size={50}
							className='text-black rounded-full hover:scale-125 duration-700 bg-white'
						/>,
						<SiTypescript
							key='key3'
							size={40}
							className='text-blue-500 hover:scale-125 duration-700'
						/>,
						<SiChakraui
							key='key2'
							size={50}
							className='text-cyan-500  rounded-full hover:scale-125 duration-700 bg-white'
						/>,
						<FaSass
							key='key3'
							size={50}
							className='text-pink-500 hover:scale-125 duration-700'
						/>,
						<DiDotnet
							key='key4'
							size={50}
							className=' hover:scale-125 duration-700 text-blue-400'
						/>,
						<TbCSharp
							key='key5'
							size={50}
							className=' hover:scale-125 duration-700 text-white bg-purple-800 rounded-full p-2'
						/>,
					]}
					time='NOVEMBER 2023 - NOW'
					description=''
				/>
				<Jobs
					position='FullStack Developer'
					icons={[
						<SiNextdotjs
							key='key'
							size={50}
							className='text-black rounded-full hover:scale-125 duration-700 bg-white'
						/>,
						<SiTypescript
							key='key3'
							size={40}
							className='text-blue-500 hover:scale-125 duration-700'
						/>,
						<DiDotnet
							key='key2'
							size={50}
							className=' hover:scale-125 duration-700 text-blue-400'
						/>,
						<TbCSharp
							key='key3'
							size={50}
							className=' hover:scale-125 duration-700 text-white bg-purple-800 rounded-full p-2'
						/>,
					]}
					time='AUGUST 2022 - NOVEMBER 2023'
					description='I use ReactJS with NextJS - TypeScript - ChakraUI and SASS for styles. We apply SCRUM for agile and efficient work, CI/CD and Gitlab. We use JIRA for organized work. I participate in this projects: WSLaMedica ( Ecommerce ), MisInversiones ( Web to make investments ) and MutualData ( Web of massive data processing and visualization).'
				/>
				<Jobs
					position='Frontend Developer'
					icons={[
						<SiNextdotjs
							key='key'
							size={50}
							className='text-black rounded-full hover:scale-125 duration-700 bg-white'
						/>,
						<SiChakraui
							key='key2'
							size={50}
							className='text-cyan-500  rounded-full hover:scale-125 duration-700 bg-white'
						/>,
						<FaSass
							key='key3'
							size={50}
							className='text-pink-500 hover:scale-125 duration-700'
						/>,
					]}
					time='JUNE 2022 - AUGUST 2022'
					description="I work with ChakraUI and SASS for styles, adapting the web to different devices, I'm charge of connecting the backend with the frontend. I'm participating in the backend by creating APIs.
				I use Postman for test endpoints. I modify old code made in CSHTML (HMTL IN C#) and then migrate it to NextJs. I test components with Jest and I always respect the principles of solid and clean code allowing its reuse. I apply SCRUM for agile and efficient work (JIRA), CI/CD and Gitlab."
				/>
				<Jobs
					position='Front End Developer'
					icons={[
						<FaReact
							key='key'
							size={50}
							className='text-cyan-500 hover:scale-125 duration-700'
						/>,
						<SiTailwindcss
							key='key2'
							size={50}
							className='text-cyan-500 hover:scale-125 duration-700'
						/>,
						<img
							alt='styled'
							key='key3'
							src='image/styled.png'
							className='h-16 w-16 hover:scale-125 duration-700'
						/>,
						<SiFramer
							key='key4'
							size={35}
							className='text-white hover:scale-125 duration-700'
						/>,
					]}
					company='IT Tech Group'
					time='FEBRUARY 2022 - JULY 2022'
					description='I used ReactJS, I designed with Styled Components and TailwindCSS adapting the web to different devices I used Framer Motion and Development of web pages according to UX/UI design. Some projects in which I participated CRYPTGO, Reforce Infinity and Sniper Bot.'
				/>
				<Jobs
					position='Python Developer'
					icons={[
						<img
							alt='python'
							key='key'
							src='image/python.png'
							className='h-12 w-12 hover:scale-125 duration-700'
						/>,
					]}
					company='Hotel Costa Azul'
					time='DECEMBER 2020 - JANUARY 2021'
					description='My job was to participate in the development of an application. Tasks performed: simple login, store in a dictionary 2 previously registered users, creation of two modules that can be accessed depending on the type of privilege either manager or reception.'
				/>
			</div>
		</motion.section>
	);
};

export default Experience;
