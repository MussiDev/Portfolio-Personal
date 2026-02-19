"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";

import { FaLinkedin } from "react-icons/fa";
import Link from "next/link";
import Title from "../../common/Title";
import certificationsData from "../../../../api/certifications.json";

interface Certification {
	id: number;
	platform: string;
	name: string;
	date: string;
	credentialId: string;
	institution?: string;
}

const PLATFORMS = [
	"Platzi",
	"EducaciónIT",
	"LinkedIn Learning",
	"CodeaRock",
	"Otros",
] as const;
type Platform = (typeof PLATFORMS)[number];

const Certifications = () => {
	const [activeTab, setActiveTab] = useState<Platform>("Platzi");

	const filtered = (certificationsData as Certification[]).filter(
		(c) => c.platform === activeTab,
	);

	return (
		<motion.section
			className='max-w-[77.5rem] m-auto px-4 py-16'
			id='certifications'
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			transition={{ duration: 0.8 }}
			viewport={{ once: true }}
		>
			<div className='flex items-center justify-between flex-wrap gap-4 mb-2'>
				<Title title='Certifications' color='orange-700' />
				<Link
					href='https://www.linkedin.com/in/joaquinmussi/details/certifications/'
					target='_blank'
					className='flex items-center gap-2 text-sm text-gray-400 hover:text-orange-700 transition-colors'
				>
					<FaLinkedin size={16} />
					View all on LinkedIn
				</Link>
			</div>

			<div className='flex flex-wrap gap-2 pb-6'>
				{PLATFORMS.map((platform) => (
					<button
						key={platform}
						onClick={() => setActiveTab(platform)}
						className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors duration-200 ${
							activeTab === platform
								? "border-orange-700 text-white"
								: "border-slate-600 text-gray-400 hover:border-slate-400"
						}`}
					>
						{platform}
					</button>
				))}
			</div>

			<AnimatePresence mode='wait'>
				<motion.div
					key={activeTab}
					className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -12 }}
					transition={{ duration: 0.3 }}
				>
					{filtered.map((cert, index) => (
						<motion.article
							key={cert.id}
							className='border border-slate-700 rounded-xl p-5 hover:border-orange-700 transition-colors duration-300 flex flex-col gap-2'
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: index * 0.06 }}
						>
							<p className='text-xs text-orange-700 font-semibold uppercase tracking-wide'>
								{cert.institution ?? cert.platform}
							</p>
							<h3 className='text-base font-semibold leading-snug'>
								{cert.name}
							</h3>
							<p className='text-xs text-gray-400'>{cert.date}</p>
							{cert.credentialId && (
								<p className='text-xs text-gray-500 truncate'>
									ID: {cert.credentialId}
								</p>
							)}
						</motion.article>
					))}
				</motion.div>
			</AnimatePresence>
		</motion.section>
	);
};

export default Certifications;
