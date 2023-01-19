"use client"; // this is a client component
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaArrowLeft, FaDev } from "react-icons/fa";
import IconLink from "../../common/IconLink";

const CV = () => {
	const [shadow, setShadow] = useState(false);
	useEffect(() => {
		const handleShadow = () => {
			if (window.scrollY) {
				setShadow(true);
			} else {
				setShadow(false);
			}
		};
		window.addEventListener("scroll", handleShadow);
	}, []);
	return (
		<>
			<header
				className={
					shadow
						? "fixed w-full shadow-xl z-[100] ease-in-out duration-300 flex justify-between h-16 px-10 text-lg backdrop-blur-md bg-slate-800"
						: "fixed w-full z-[100] flex justify-between  h-16 px-10 text-lg backdrop-blur-md bg-slate-800"
				}>
				<motion.div
					className='flex md:justify-center md:w-full'
					initial={{ x: -2500, opacity: 0, scale: 0.5 }}
					animate={{
						x: 0,
						opacity: 1,
						scale: 1,
					}}
					transition={{ duration: 0.8 }}>
					<Link href='/' className='flex items-center gap-2 font-semibold'>
						<FaDev className='cursor-pointer' />
						Joaquín Mussi
					</Link>
				</motion.div>
				<motion.div
					className='flex items-center gap-2 md:hidden'
					initial={{ x: 3500, opacity: 0, scale: 0.5 }}
					animate={{
						x: 0,
						opacity: 1,
						scale: 1,
					}}
					transition={{ duration: 0.8 }}>
					<IconLink to='https://github.com/MussiDev' icon='github' />
					<IconLink
						to='https://www.linkedin.com/in/joaquinmussi/'
						icon='linkedin'
					/>
				</motion.div>
			</header>
			<section className='w-full h-screen text-center py-16'>
				<Link href='/'>
					<motion.p
						className='flex items-center gap-2 ml-6 mt-24'
						whileHover={{
							transition: { duration: 0.2 },
							color: "#c2410c",
						}}>
						<FaArrowLeft className='cursor-pointer' />
						Back to Home
					</motion.p>
				</Link>
				<div className='max-w-[1240px] w-full h-full mx-auto p-2 flex justify-center items-center'></div>
			</section>
		</>
	);
};

export default CV;
