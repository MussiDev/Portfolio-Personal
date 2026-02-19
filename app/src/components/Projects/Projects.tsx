"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";

import ProjectData from "../../../../entities/projects";
import Title from "../../common/Title";
import WorkProjectsList from "../../../../api/workProjects.json";
import dynamic from "next/dynamic";

const ProjectItem = dynamic(() => import("../../common/ProjectItem"), {
	ssr: false,
});
const WorkProjectItem = dynamic(() => import("../../common/WorkProjectItem"), {
	ssr: false,
});

const TABS = ["Work"] as const;
type Tab = (typeof TABS)[number];

const Projects = () => {
	const [activeTab, setActiveTab] = useState<Tab>("Work");

	return (
		<motion.section
			className='max-w-[77.5rem] m-auto px-4 md:min-h-screen py-16'
			id='projects'
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			transition={{ duration: 0.8 }}
			viewport={{ once: true }}
		>
			<Title title='Projects' color='orange-700' />

			<div className='flex gap-2 pb-6'>
				{TABS.map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`px-5 py-2 rounded-full text-sm font-semibold border transition-colors duration-200 ${
							activeTab === tab
								? "border-orange-700 text-white "
								: "border-slate-600 text-gray-400 hover:border-slate-400"
						}`}
					>
						{tab}
					</button>
				))}
			</div>

			<AnimatePresence mode='wait'>
				{activeTab === "Work" && (
					<motion.div
						key='work'
						className='grid md:grid-cols-2 gap-6'
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -12 }}
						transition={{ duration: 0.3 }}
					>
						{WorkProjectsList.map((project, index) => (
							<WorkProjectItem
								key={project.id}
								index={index}
								name={project.name}
								company={project.company}
								period={project.period}
								description={project.description}
								skills={project.skills}
							/>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</motion.section>
	);
};

export default Projects;
