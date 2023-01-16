import React from "react";
import Title from "../../common/Title";
import weather from "../../image/weather.png";
import monolandia from "../../image/monolandia.png";
import petinder from "../../image/petinder.png";
import ProjectItem from "../../common/ProjectItem";
import { FaBootstrap, FaCss3, FaHtml5, FaJs, FaReact } from "react-icons/fa";
import { SiChakraui } from "react-icons/si";
import { DiMaterializecss } from "react-icons/di";

const Projects = () => {
	return (
		<section
			className='max-w-[1240px] m-auto pt-16 px-4 md:h-screen'
			id='projects'>
			<Title title='Projects' color='orange-700' />
			<div className='grid md:grid-cols-2 gap-8 py-4'>
				<ProjectItem
					src={weather}
					github='https://github.com/MussiDev/ClimaReactAPI'
					page='https://reactappweather-7c1cb.web.app/'
					paragraph='Weather Web App consuming the Open Weather App API.'
					icon={[
						<FaReact
							size={50}
							className='text-cyan-500 hover:scale-125 duration-700'
						/>,
						<DiMaterializecss
							size={50}
							className='text-fuchsia-300 hover:scale-125 duration-700'
						/>,
					]}
				/>
				<ProjectItem
					src={monolandia}
					github='https://github.com/MussiDev/MonoLandia'
					page='https://monolandia-7816e.web.app/'
					paragraph='Website created in order to inform about the life and history of the Monkeys.'
					icon={[
						<FaHtml5
							size={50}
							className='text-red-500 hover:scale-125 duration-700'
						/>,
						<FaCss3
							size={50}
							className='text-blue-500 hover:scale-125 duration-700'
						/>,
						<FaJs
							size={50}
							className='text-yellow-500 hover:scale-125 duration-700'
						/>,
						<FaBootstrap
							size={50}
							className='text-purple-500 hover:scale-125 duration-700'
						/>,
					]}
				/>
				<ProjectItem
					src={petinder}
					github='https://github.com/joakom24/Petinder'
					page='https://petinder-75b0e.web.app/'
					paragraph='Web application to manage shifts with LocalStorage.'
					icon={[
						<FaReact
							size={50}
							className='text-cyan-500 hover:scale-125 duration-700'
						/>,
						<SiChakraui
							size={50}
							className='text-cyan-300 hover:scale-125 duration-700'
						/>,
					]}
				/>
			</div>
		</section>
	);
};

export default Projects;
