import ProjectData from "../../../../entities/projects";
import ProjectList from "../../../../api/projectsList.json";
import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const Title = dynamic(() => import("../../common/Title"), { ssr: false });
const ProjectItem = dynamic(() => import("../../common/ProjectItem"), {
	ssr: false,
});

const Projects = () => {
	return (
		<motion.section
			className="max-w-[77.5rem] m-auto  px-4 md:min-h-screen py-16"
			id="projects"
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			transition={{ duration: 2 }}
		>
			<Title title="Projects" color="orange-700" />
			<div className="grid md:grid-cols-2 lg:cols-3 gap-8 py-4">
				{ProjectList.map((project: ProjectData) => {
					return (
						<ProjectItem
							src={project.image}
							github={project.github}
							page={project.page}
							paragraph={project.paragraph}
							icon={project.icons}
							key={project.id}
						/>
					);
				})}
			</div>
		</motion.section>
	);
};

export default Projects;
