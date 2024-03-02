import React from "react";
import dynamic from "next/dynamic";
import experienceItems from "../../../../api/experienceItems.json";
import { motion } from "framer-motion";

const Jobs = dynamic(() => import("../../common/Jobs"), { ssr: false });
const Title = dynamic(() => import("../../common/Title"), { ssr: false });

const Experience = () => {
	return (
		<motion.section
			className="max-w-[1240px] m-auto px-4 md:min-h-screen py-16"
			id="experience"
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			transition={{ duration: 2 }}
		>
			<Title title="Experience" color="orange-700" />
			<div className="flex flex-col gap-6 pt-6">
				{experienceItems.map((job, index) => (
					<Jobs
						key={index}
						company={job.company}
						position={job.position}
						icons={job.icons}
						time={job.time}
						description={job.description}
					/>
				))}
			</div>
		</motion.section>
	);
};

export default Experience;
