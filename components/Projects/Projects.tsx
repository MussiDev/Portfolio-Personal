import React from "react";
import ProjectItem from "../../common/ProjectItem";
import Title from "../../common/Title";
import foto from "./foto.jpg";

const Projects = () => {
	return (
		<div id='projects' className='w-full'>
			<div className='max-w-[1240px] mx-auto px-2 py-16'>
				<Title title='Projects' color='orange-700' />
				<div className='grid gap-8 md:grid-cols-2'>
					<ProjectItem
						title='Property Finder'
						backgroundImg={foto}
						projectUrl='/property'
						tech='React JS'
					/>
					<ProjectItem
						title='Crypto App'
						backgroundImg={foto}
						projectUrl='/crypto'
						tech='React JS'
					/>
					<ProjectItem
						title='Netflix App'
						backgroundImg={foto}
						projectUrl='/netflix'
						tech='React JS'
					/>
					<ProjectItem
						title='Twitch UI'
						backgroundImg={foto}
						projectUrl='/twitch'
						tech='Next JS'
					/>
				</div>
			</div>
		</div>
	);
};

export default Projects;
