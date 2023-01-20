"use client"; // this is a client component
import React, { useState, useEffect } from "react";
import NavbarItem from "../../common/NavbarItem";
import items from "../../../api/navbarItems.json";
import { FaDev } from "react-icons/fa";
import { Link } from "react-scroll";
import IconLink from "../../common/IconLink";
import navbarItem from "../../../entities/navbarItem";
import { motion } from "framer-motion";

const Navbar = () => {
	const [shadow, setShadow] = useState(false);
	const [showIcons, setShowIcons] = useState(false);

	useEffect(() => {
		window.innerWidth > 768 ? setShowIcons(true) : setShowIcons(false);
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
		<header
			className={
				shadow
					? "fixed w-full shadow-xl z-[100] ease-in-out duration-300 flex justify-between h-16 px-10 text-lg backdrop-blur-md bg-slate-800"
					: "fixed w-full z-[100] flex justify-between  h-16 px-10 text-lg backdrop-blur-md bg-slate-800"
			}>
			<motion.div
				className='flex'
				initial={{ x: -2500, opacity: 0, scale: 0.5 }}
				animate={{
					x: 0,
					opacity: 1,
					scale: 1,
				}}
				transition={{ duration: 0.8 }}>
				<Link
					to='home'
					spy={true}
					smooth={true}
					offset={-70}
					duration={1000}
					className='flex items-center gap-2 font-semibold cursor-pointer'>
					<FaDev size={25} />
					Joaquín Mussi
				</Link>
			</motion.div>
			<motion.ul
				className='items-center hidden gap-6 md:flex'
				initial={{ x: 2500, opacity: 0, scale: 0.5 }}
				animate={{
					x: 0,
					opacity: 1,
					scale: 1,
				}}
				transition={{ duration: 0.8 }}>
				{items &&
					items.map((item: navbarItem, k: number) => (
						<NavbarItem key={k} link={item.link} text={item.text} />
					))}
			</motion.ul>
			{showIcons && (
				<motion.div
					className='flex items-center gap-2'
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
			)}
		</header>
	);
};

export default Navbar;
