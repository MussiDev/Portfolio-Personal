"use client";

import {
	FaBootstrap,
	FaCss3,
	FaHtml5,
	FaJs,
	FaReact,
} from "react-icons/fa";

import Button from "./Button";
import React from "react";
import { SiChakraui } from "react-icons/si";
import { motion } from "framer-motion";
import projectItem from "../../../entities/projectItem";

interface ProjectIconData {
	type: string;
	size?: number;
	className?: string;
	src?: string;
	key?: string;
}

const iconMap: Record<string, React.ElementType> = {
	FaReact,
	FaHtml5,
	FaCss3,
	FaJs,
	FaBootstrap,
	SiChakraui,
};

const renderIcons = (icons: ProjectIconData[]) =>
	icons.map((icon, k) => {
		if (icon.type === "img") {
			return (
				// eslint-disable-next-line @next/next/no-img-element
				<img
					key={k}
					src={icon.src}
					className={icon.className}
					alt="tech icon"
					loading="lazy"
				/>
			);
		}
		const IconComponent = iconMap[icon.type];
		if (!IconComponent) return null;
		return (
			<IconComponent key={k} size={icon.size} className={icon.className} />
		);
	});

const ProjectItem = (props: projectItem) => {
	const { src, github, page, paragraph, icon } = props;
	const icons = icon as unknown as ProjectIconData[];

	return (
		<section className="shadow-orange-700 p-4 rounded-xl shadow-3xl">
			<motion.div
				className="div"
				initial={{ x: -60, opacity: 0 }}
				whileInView={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.6 }}
				viewport={{ once: true }}
			>
				<motion.img
					src={src}
					id="img"
					sizes="(min-width: 82.5rem) 34.75rem, (min-width: 48.75rem) calc(44.23vw - 1.1875rem), calc(97.39vw - 2.75rem)"
					alt="project screenshot"
					loading="lazy"
					initial={{ objectPosition: "top" }}
					whileHover={{ objectPosition: "bottom" }}
				/>
			</motion.div>
			<p className="py-4 h-24 max-h-24 text-sm md:text-base">{paragraph}</p>
			<div className="flex justify-center items-center gap-4 py-4" id="icons">
				{renderIcons(icons)}
			</div>
			<div className="flex items-center justify-center gap-4 py-4">
				<Button title="Demo" href={page} blank={true} variant="primary" />
				<Button title="Code" href={github} blank={true} variant="secondary" />
			</div>
		</section>
	);
};

export default ProjectItem;
