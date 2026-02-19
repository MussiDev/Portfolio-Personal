"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaLinkedin, FaQuoteLeft } from "react-icons/fa";
import Link from "next/link";
import Title from "../../common/Title";
import recommendationsData from "../../../../api/recommendations.json";

interface Recommendation {
	id: number;
	name: string;
	role: string;
	relation: string;
	date: string;
	text: string;
}

const Recommendations = () => {
	return (
		<motion.section
			className="max-w-[77.5rem] m-auto px-4 py-16"
			id="recommendations"
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			transition={{ duration: 0.8 }}
			viewport={{ once: true }}
		>
			<div className="flex items-center justify-between flex-wrap gap-4 mb-2">
				<Title title="Recommendations" color="orange-700" />
				<Link
					href="https://www.linkedin.com/in/joaquinmussi/details/recommendations/"
					target="_blank"
					className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-700 transition-colors"
				>
					<FaLinkedin size={16} />
					View on LinkedIn
				</Link>
			</div>

			<div className="grid md:grid-cols-2 gap-6 pt-4">
				{(recommendationsData as Recommendation[]).map((rec, index) => (
					<motion.article
						key={rec.id}
						className="border border-slate-700 rounded-xl p-6 hover:border-orange-700 transition-colors duration-300 flex flex-col gap-4"
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: index * 0.1 }}
						viewport={{ once: true }}
					>
						<FaQuoteLeft size={20} className="text-orange-700 opacity-70" />

						<p className="text-gray-300 text-sm md:text-base leading-relaxed italic">
							{rec.text}
						</p>

						<div className="flex flex-col gap-1 pt-2 border-t border-slate-700">
							<p className="font-semibold text-sm">{rec.name}</p>
							<p className="text-xs text-gray-400">{rec.role}</p>
							<p className="text-xs text-gray-500">
								{rec.relation} · {rec.date}
							</p>
						</div>
					</motion.article>
				))}
			</div>
		</motion.section>
	);
};

export default Recommendations;
