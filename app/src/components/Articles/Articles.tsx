"use client";

import { FaArrowRight, FaCalendarAlt, FaLinkedin } from "react-icons/fa";

import Link from "next/link";
import React from "react";
import Title from "../../common/Title";
import articlesData from "../../../../api/articles.json";
import { motion } from "framer-motion";

interface Article {
	id: number;
	title: string;
	summary: string;
	date: string;
	href: string;
	tags: string[];
}

const Articles = () => {
	return (
		<motion.section
			className='max-w-[77.5rem] m-auto px-4 py-16'
			id='articles'
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			transition={{ duration: 0.8 }}
			viewport={{ once: true }}
		>
			<div className='flex items-center justify-between flex-wrap gap-4 mb-2'>
				<Title title='Articles' color='orange-700' />
				<Link
					href='https://www.linkedin.com/in/joaquinmussi/recent-activity/articles/'
					target='_blank'
					className='flex items-center gap-2 text-sm text-gray-400 hover:text-orange-700 transition-colors'
				>
					<FaLinkedin size={16} />
					View all on LinkedIn
				</Link>
			</div>

			<div className='grid md:grid-cols-2 gap-6 pt-4'>
				{articlesData.map((article: Article, index: number) => (
					<motion.article
						key={article.id}
						className='flex flex-col justify-between gap-4 border border-slate-700 rounded-xl p-6 hover:border-orange-700 transition-colors duration-300'
						initial={{ opacity: 0, y: 40 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: index * 0.1 }}
						viewport={{ once: true }}
					>
						<div className='flex flex-col gap-3'>
							<div className='flex items-center gap-2 text-gray-400 text-sm'>
								<FaCalendarAlt size={12} />
								<span>{article.date}</span>
							</div>

							<h3 className='text-base md:text-xl font-bold leading-snug hover:text-orange-700 transition-colors'>
								<Link href={article.href} target='_blank'>
									{article.title}
								</Link>
							</h3>

							<p className='text-gray-300 text-base leading-relaxed'>
								{article.summary}
							</p>
						</div>

						<div className='flex flex-col gap-4'>
							<div className='flex flex-wrap gap-2'>
								{article.tags.map((tag: string) => (
									<span
										key={tag}
										className='text-xs px-3 py-1 rounded-full border border-slate-600 text-gray-300'
									>
										{tag}
									</span>
								))}
							</div>

							<Link
								href={article.href}
								target='_blank'
								className='flex items-center gap-2 text-orange-700 hover:gap-3 transition-all duration-200 text-sm font-semibold w-fit'
							>
								<FaLinkedin size={16} />
								Read on LinkedIn
								<FaArrowRight size={12} />
							</Link>
						</div>
					</motion.article>
				))}
			</div>
		</motion.section>
	);
};

export default Articles;
