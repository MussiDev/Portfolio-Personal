"use client"; // this is a client component
import { Link } from "react-scroll";
import React from "react";
import navbarItem from "../../entities/navbarItem";
import { motion } from "framer-motion";
const NavbarItem = (props: navbarItem) => {
	const { link, text } = props;
	return (
		<motion.li
			whileHover={{
				scale: 1.1,
				transition: { duration: 0.2 },
				color: "#F24F0F",
			}}>
			<Link
				href={link}
				to={link}
				spy={true}
				smooth={true}
				offset={-70}
				duration={1000}
				className='cursor-pointer'>
				{text}
			</Link>
		</motion.li>
	);
};

export default NavbarItem;
