"use client";

import { FaCircle, FaPython, FaSass } from "react-icons/fa";
import {
	SiChakraui,
	SiFramer,
	SiNextdotjs,
	SiRedux,
	SiStyledcomponents,
	SiTailwindcss,
	SiTypescript,
} from "react-icons/si";

import { BiLogoReact } from "react-icons/bi";
import { DiDotnet } from "react-icons/di";
import React from "react";
import { TbBrandCSharp } from "react-icons/tb";
import { motion } from "framer-motion";

interface RoleIcon {
	name: string;
	classname?: string;
}

interface Role {
	position: string;
	time: string;
	description: string;
	icons: RoleIcon[];
}

interface JobGroupProps {
	company: string;
	totalTime: string;
	roles: Role[];
	index?: number;
}

const resolveIcon = ({ name, classname }: RoleIcon) => {
	let IconComponent: React.ElementType;
	let cls = classname ?? "";

	switch (name) {
		case "FaSass":
			IconComponent = FaSass;
			cls = "text-pink-500 hover:scale-125 duration-300";
			break;
		case "FaPython":
			IconComponent = FaPython;
			cls =
				"hover:scale-125 duration-300 bg-gradient-to-b from-blue-500 to-yellow-500";
			break;
		case "DiDotnet":
			IconComponent = DiDotnet;
			cls = "hover:scale-125 duration-300 text-blue-400";
			break;
		case "TbBrandCSharp":
			IconComponent = TbBrandCSharp;
			cls =
				"hover:scale-125 duration-300 text-white bg-purple-800 rounded-full";
			break;
		case "SiNextdotjs":
			IconComponent = SiNextdotjs;
			cls = "text-black rounded-full hover:scale-125 duration-300 bg-white";
			break;
		case "SiRedux":
			IconComponent = SiRedux;
			cls = "text-purple-500 hover:scale-125 duration-300";
			break;
		case "SiChakraui":
			IconComponent = SiChakraui;
			cls = "text-cyan-500 rounded-full hover:scale-125 duration-300 bg-white";
			break;
		case "SiTailwindcss":
			IconComponent = SiTailwindcss;
			cls = "text-cyan-500 hover:scale-125 duration-300";
			break;
		case "SiTypescript":
			IconComponent = SiTypescript;
			cls = "text-blue-500 hover:scale-125 duration-300";
			break;
		case "SiFramer":
			IconComponent = SiFramer;
			cls = "rounded-full hover:scale-125 duration-300";
			break;
		case "SiStyledcomponents":
			IconComponent = SiStyledcomponents;
			cls = "text-purple-500 hover:scale-125 duration-300";
			break;
		case "BiLogoReact":
			IconComponent = BiLogoReact;
			cls = "text-cyan-500 rounded-full hover:scale-125 duration-300";
			break;
		default:
			IconComponent = FaCircle;
			break;
	}

	return { IconComponent, cls };
};

const JobGroup = ({ company, totalTime, roles, index = 0 }: JobGroupProps) => {
	return (
		<motion.article
			className='border border-slate-700 rounded-xl p-6 hover:border-orange-700 transition-colors duration-300'
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: index * 0.08 }}
			viewport={{ once: true }}
		>
			<div className='flex items-start justify-between flex-wrap gap-2 mb-6'>
				<h3 className='text-orange-700 text-base md:text-xl font-bold'>
					{company}
				</h3>
				<span className='text-xs text-gray-400 border border-slate-600 rounded-full px-3 py-1 whitespace-nowrap'>
					{totalTime}
				</span>
			</div>

			<div className='flex flex-col gap-0'>
				{roles.map((role, i) => (
					<div key={i} className='flex gap-4'>
						<div className='flex flex-col items-center'>
							<div className='w-2.5 h-2.5 rounded-full bg-orange-700 mt-1 shrink-0' />
							{i < roles.length - 1 && (
								<div className='w-px flex-1 bg-slate-700 my-1' />
							)}
						</div>

						<div
							className={`flex flex-col gap-2 ${i < roles.length - 1 ? "pb-6" : ""}`}
						>
							<div className='flex items-center flex-wrap gap-2'>
								<h4 className='text-sm md:text-base font-semibold'>
									{role.position}
								</h4>
								<span className='text-xs text-gray-400 border border-slate-600 rounded-full px-2 py-0.5'>
									{role.time}
								</span>
							</div>
							<p className='text-gray-300 text-sm leading-relaxed'>
								{role.description}
							</p>
							{role.icons.length > 0 && (
								<div className='flex flex-wrap gap-2 pt-1'>
									{role.icons.map((icon, k) => {
										const { IconComponent, cls } = resolveIcon(icon);
										return <IconComponent key={k} size={28} className={cls} />;
									})}
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</motion.article>
	);
};

export default JobGroup;
