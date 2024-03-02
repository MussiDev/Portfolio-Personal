import { FaCircle, FaPython, FaReact, FaSass } from "react-icons/fa";
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

const Jobs = (props: jobsItem) => {
	const { position, company, time, description, icons } = props;

	const renderIcons = () => {
		return icons.map(({ name, classname }: any, key) => {
			let IconComponent;
			switch (name) {
				case "FaSass":
					IconComponent = FaSass;
					break;
				case "FaPython":
					IconComponent = FaPython;
					break;
				case "FaReact":
					IconComponent = FaReact;
					break;
				case "DiDotnet":
					IconComponent = DiDotnet;
					break;
				case "TbBrandCSharp":
					IconComponent = TbBrandCSharp;
					break;
				case "SiNextdotjs":
					IconComponent = SiNextdotjs;
					break;
				case "SiRedux":
					IconComponent = SiRedux;
					break;
				case "SiChakraui":
					IconComponent = SiChakraui;
					break;
				case "SiTailwindcss":
					IconComponent = SiTailwindcss;
					break;
				case "SiTypescript":
					IconComponent = SiTypescript;
					break;
				case "SiFramer":
					IconComponent = SiFramer;
					break;
				case "SiStyledcomponents":
					IconComponent = SiStyledcomponents;
					break;
				case "BiLogoReact":
					IconComponent = BiLogoReact;
					break;
				default:
					IconComponent = FaCircle;
					break;
			}
			return (
				<IconComponent
					key={key}
					size={50}
					className={`${classname} ${
						IconComponent === FaPython &&
						"bg-gradient-to-b from-blue-500 to-yellow-500"
					}`}
				/>
			);
		});
	};

	return (
		<motion.section
			className="flex gap-2 flex-col md:flex"
			initial={{ opacity: 0, y: -100 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 1.5 }}
			viewport={{ once: true }}
		>
			<h1 className="text-orange-700 text-3xl">{company}</h1>
			<>
				<div className="grid md:flex md:items-center gap-6 ml-2">
					<h1 className="text-2xl flex flex-row gap-2 items-center">
						<span>
							<FaCircle className="text-orange-700" size={18} />
						</span>
						{position}
					</h1>
					<div id="icons">{renderIcons()}</div>
				</div>
				<p className="ml-8">/ {time}</p>
				<p className="ml-8 flex flex-row gap-2 items-center">{description}</p>
			</>
		</motion.section>
	);
};

export default Jobs;
