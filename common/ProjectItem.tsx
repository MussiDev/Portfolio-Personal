import Image from "next/image";
import Link from "next/link";
import React from "react";
import projectItem from "../entities/projectItem";

const ProjectItem = (props: projectItem) => {
	const { title, backgroundImg, tech, projectUrl } = props;
	return (
		<div className='flex flex-col items-center gap-2 w-80 h-80 overflow-hidden'>
			<Image
				src={backgroundImg}
				alt=''
				className='h-[100%] w-[100%] object-cover object-top'
			/>
			<h3>{title}</h3>
			<p>{tech}</p>
			<button>
				<Link href={projectUrl}>More info</Link>
			</button>
		</div>
	);
};

export default ProjectItem;
