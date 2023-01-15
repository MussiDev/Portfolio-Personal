import React from "react";
import ProjectItem from "../../common/ProjectItem";
import Title from "../../common/Title";
import foto from "./foto.jpg";

const Projects = () => {
	return (
		<section className='max-w-[1240px] mx-auto py-16 h-screen' id='projects'>
			<Title title='Projects' color='orange-700' />
			<div className='grid gap-8 md:grid-cols-3 h-[60vh]'>
				<ProjectItem
					title='Property Finder'
					backgroundImg={monolandia}
					projectUrl='/property'
					tech='React JS'
				/>
				<ProjectItem
					title='Crypto App'
					backgroundImg={petinder}
					projectUrl='/crypto'
					tech='React JS'
				/>
				<ProjectItem
					title='Netflix App'
					backgroundImg={weather}
					projectUrl='/netflix'
					tech='React JS'
				/>
			</div>
		</div>
	);
};

export default Projects;
