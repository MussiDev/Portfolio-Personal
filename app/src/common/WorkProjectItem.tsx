"use client";

import React from "react";
import { motion } from "framer-motion";

interface WorkProjectItemProps {
	name: string;
	company: string;
	period: string;
	description: string;
	skills: string[];
	index?: number;
}

const WorkProjectItem = ({
	name,
	company,
	period,
	description,
	skills,
	index = 0,
}: WorkProjectItemProps) => {
	return (
		<motion.article
			className="border border-slate-700 rounded-xl p-6 hover:border-orange-700 transition-colors duration-300 flex flex-col gap-3"
			initial={{ opacity: 0, y: 40 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: index * 0.08 }}
			viewport={{ once: true }}
		>
			<div className="flex items-start justify-between flex-wrap gap-2">
				<h3 className="text-orange-700 text-base md:text-xl font-bold">{name}</h3>
				{period && (
					<span className="text-xs text-gray-400 border border-slate-600 rounded-full px-3 py-1 whitespace-nowrap">
						{period}
					</span>
				)}
			</div>

			<p className="text-sm text-gray-400">{company}</p>

			<p className="text-gray-300 text-sm md:text-base leading-relaxed">{description}</p>

			<div className="flex flex-wrap gap-2 pt-1">
				{skills.map((skill) => (
					<span
						key={skill}
						className="text-xs px-3 py-1 rounded-full border border-slate-600 text-gray-300"
					>
						{skill}
					</span>
				))}
			</div>
		</motion.article>
	);
};

export default WorkProjectItem;
