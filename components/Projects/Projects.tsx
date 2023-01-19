import React from "react";
import Title from "../../common/Title";
import ProjectItem from "../../common/ProjectItem";
import { FaBootstrap, FaCss3, FaHtml5, FaJs, FaReact } from "react-icons/fa";
import { SiChakraui } from "react-icons/si";

const Projects = () => {
	return (
		<section
			className='max-w-[1240px] m-auto  px-4 md:h-screen py-16'
			id='projects'>
			<Title title='Projects' color='orange-700' />
			<div className='grid md:grid-cols-2 gap-8 py-4'>
				<ProjectItem
					src='image/weather.png'
					github='https://github.com/MussiDev/ClimaReactAPI'
					page='https://reactappweather-7c1cb.web.app/'
					paragraph='Weather Web App consuming the Open Weather App API.'
					icon={[
						<FaReact
							key='key'
							size={50}
							className='text-cyan-500 hover:scale-125 duration-700'
						/>,
						<img
							key='key3'
							src='image/materialize.png'
							className=' w-16 h-8 hover:scale-125 duration-700'
						/>,
					]}
				/>
				<ProjectItem
					src='image/monolandia.png'
					github='https://github.com/MussiDev/MonoLandia'
					page='https://monolandia-7816e.web.app/'
					paragraph='Website created in order to inform about the life and history of the Monkeys.'
					icon={[
						<FaHtml5
							key='key'
							size={50}
							className='text-red-500 hover:scale-125 duration-700'
						/>,
						<FaCss3
							key='key2'
							size={50}
							className='text-blue-500 hover:scale-125 duration-700'
						/>,
						<FaJs
							key='key3'
							size={50}
							className='text-yellow-500 hover:scale-125 duration-700'
						/>,
						<FaBootstrap
							key='key4'
							size={50}
							className='text-purple-500 hover:scale-125 duration-700'
						/>,
					]}
				/>
				<ProjectItem
					src='image/petinder.png'
					github='https://github.com/joakom24/Petinder'
					page='https://petinder-75b0e.web.app/'
					paragraph='Web application to manage shifts with LocalStorage.'
					icon={[
						<FaReact
							key='key1'
							size={50}
							className='text-cyan-500 hover:scale-125 duration-700'
						/>,
						<SiChakraui
							key='key2'
							size={50}
							className='text-cyan-500 bg-white rounded-full hover:scale-125 duration-700'
						/>,
					]}
				/>
			</div>
		</section>
	);
};

export default Projects;
