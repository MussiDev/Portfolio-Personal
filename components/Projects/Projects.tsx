import React from "react";
import ProjectItem from "../../common/ProjectItem";
import Title from "../../common/Title";
import monolandia from "../../image/monolandia.png";
import petinder from "../../image/petinder.png";
import weather from "../../image/weather.png";

const Projects = () => {
	return (
		<section className='max-w-[1240px] mx-auto py-16 h-screen' id='projects'>
			<Title title='Projects' color='orange-700' />
			<div className='grid gap-8 md:grid-cols-2'>
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
		</section>
	);
};

export default Projects;
