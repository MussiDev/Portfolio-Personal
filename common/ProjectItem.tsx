import Image from "next/image";
import React from "react";
import projectItem from "../entities/projectItem";
import Button from "./Button";

const ProjectItem = (props: projectItem) => {
	const { src, github, page, paragraph, icon } = props;
	return (
		<section className='shadow-sky-900 p-4 shadow-xl'>
			<div className='overflow-hidden h-40'>
				<Image
					src={src}
					alt=''
					className='rounded-md hover:object-bottom h-full w-full object-cover object-top transition-all ease-in-out duration-[1400ms]'
				/>
			</div>
			<p className='py-4 h-24 max-h-24 text-justify text-lg'>{paragraph}</p>
			<span className='flex justify-center gap-4'>{icon}</span>
			<div className='flex items-center justify-center gap-4 py-6'>
				<Button title='Demo' href={page} />
				<Button title='Code' href={github} />
			</div>
		</section>
	);
};

export default ProjectItem;
