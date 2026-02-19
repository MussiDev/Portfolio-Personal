"use client";

import React from "react";
import dynamic from "next/dynamic";
import experienceItems from "../../../../api/experienceItems.json";
import { motion } from "framer-motion";
import Title from "../../common/Title";

const Jobs = dynamic(() => import("../../common/Jobs"), { ssr: false });
const JobGroup = dynamic(() => import("../../common/JobGroup"), { ssr: false });

const Experience = () => {
	return (
		<motion.section
			className="max-w-[77.5rem] m-auto px-4 py-16"
			id="experience"
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			transition={{ duration: 0.8 }}
			viewport={{ once: true }}
		>
			<Title title="Experience" color="orange-700" />
			<div className="flex flex-col gap-4 pt-4">
				{(experienceItems as any[]).map((item, index) =>
					item.roles ? (
						<JobGroup
							key={index}
							index={index}
							company={item.company}
							totalTime={item.totalTime}
							roles={item.roles}
						/>
					) : (
						<Jobs
							key={index}
							index={index}
							company={item.company}
							position={item.position}
							icons={item.icons}
							time={item.time}
							description={item.description}
						/>
					)
				)}
			</div>
		</motion.section>
	);
};

export default Experience;
