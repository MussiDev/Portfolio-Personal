import Link from "next/link";
import React from "react";
import navbarItem from "../entities/navbarItem";
import { motion } from "framer-motion";
const NavbarItem = (props: navbarItem) => {
	const { link, text } = props;
	return (
		<motion.li
			whileHover={{
				scale: 1.1,
				transition: { duration: 0.2 },
				color: "#c2410c",
			}}>
			<Link href={link}>{text}</Link>
		</motion.li>
	);
};

export default NavbarItem;
