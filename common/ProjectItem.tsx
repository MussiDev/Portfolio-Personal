import Image from "next/image";
import Link from "next/link";
import React from "react";
import projectItem from "../entities/projectItem";

const ProjectItem = (props: projectItem) => {
	const { title, backgroundImg, tech, projectUrl } = props;
	return (
<<<<<<< HEAD
		<div className='flex flex-col items-center gap-2 relative overflow-hidden'>
			<Image
				className='rounded-xl group-hover:opacity-10'
				src={backgroundImg}
				alt='Picture of the author'
				className='hover:object-bottom cursor-pointer'
=======
		<div className='relative flex items-center justify-center h-auto w-full shadow-xl shadow-gray-400 rounded-xl group hover:bg-gradient-to-r from-[#5651e5] to-[#709dff]'>
			<Image
				className='rounded-xl group-hover:opacity-10'
				src={backgroundImg}
				alt='/'
>>>>>>> parent of 1e39e6c (add projects items)
			/>
			<div className='hidden hover:block absolute top-[20%] left-[20%] translate-x-[-20%] translate-y-[-20%]'>
				<h3 className='text-2xl tracking-wider text-center text-white'>
					{title}
				</h3>
				<p className='pt-2 pb-4 text-center text-white'>{tech}</p>
				<Link href={projectUrl}>
					<p className='py-3 text-lg font-bold text-center text-gray-700 bg-white rounded-lg cursor-pointer'>
						More Info
					</p>
				</Link>
			</div>
		</div>
	);
};

export default ProjectItem;
