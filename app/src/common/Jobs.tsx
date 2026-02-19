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
import jobsItem from "../../../entities/jobsItem";
import { motion } from "framer-motion";

const Jobs = (props: jobsItem & { index?: number }) => {
	const { position, company, time, description, icons, index = 0 } = props;

	const renderIcons = () => {
		return icons.map(({ name, classname }: any, key) => {
			let IconComponent;
			switch (name) {
				case "FaSass":
					IconComponent = FaSass;
					classname = "text-pink-500 hover:scale-125 duration-300";
					break;
				case "FaPython":
					IconComponent = FaPython;
					classname = "hover:scale-125 duration-300";
					break;
				case "DiDotnet":
					IconComponent = DiDotnet;
					classname = "hover:scale-125 duration-300 text-blue-400";
					break;
				case "TbBrandCSharp":
					IconComponent = TbBrandCSharp;
					classname =
						"hover:scale-125 duration-300 text-white bg-purple-800 rounded-full";
					break;
				case "SiNextdotjs":
					IconComponent = SiNextdotjs;
					classname =
						"text-black rounded-full hover:scale-125 duration-300 bg-white";
					break;
				case "SiRedux":
					IconComponent = SiRedux;
					classname = "text-purple-500 hover:scale-125 duration-300";
					break;
				case "SiChakraui":
					IconComponent = SiChakraui;
					classname =
						"text-cyan-500 rounded-full hover:scale-125 duration-300 bg-white";
					break;
				case "SiTailwindcss":
					IconComponent = SiTailwindcss;
					classname = "text-cyan-500 hover:scale-125 duration-300";
					break;
				case "SiTypescript":
					IconComponent = SiTypescript;
					classname = "text-blue-500 hover:scale-125 duration-300";
					break;
				case "SiFramer":
					IconComponent = SiFramer;
					classname = "rounded-full hover:scale-125 duration-300";
					break;
				case "SiStyledcomponents":
					IconComponent = SiStyledcomponents;
					classname = "text-purple-500 hover:scale-125 duration-300";
					break;
				case "BiLogoReact":
					IconComponent = BiLogoReact;
					classname = "text-cyan-500 rounded-full hover:scale-125 duration-300";
					break;
				default:
					IconComponent = FaCircle;
					break;
			}
			return (
				<IconComponent
					key={key}
					size={32}
					className={`${classname} ${
						IconComponent === FaPython &&
						"bg-gradient-to-b from-blue-500 to-yellow-500"
					}`}
				/>
			);
		});
	};

	return (
		<motion.article
			className='border border-slate-700 rounded-xl p-6 hover:border-orange-700 transition-colors duration-300 flex flex-col gap-3'
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: index * 0.08 }}
			viewport={{ once: true }}
		>
			<div className='flex items-start justify-between flex-wrap gap-2'>
				<h3 className='text-orange-700 text-base md:text-xl font-bold'>
					{company}
				</h3>
				<span className='text-xs text-gray-400 border border-slate-600 rounded-full px-3 py-1 '>
					{time}
				</span>
			</div>

			<h4 className='text-sm md:text-lg font-semibold'>{position}</h4>

			<p className='text-gray-300 text-sm md:text-base leading-relaxed'>
				{description}
			</p>

			<div className='flex flex-wrap gap-3 pt-1'>{renderIcons()}</div>
		</motion.article>
	);
};

export default Jobs;
