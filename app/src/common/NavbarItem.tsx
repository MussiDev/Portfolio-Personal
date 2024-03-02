import { Link } from "react-scroll";
import React from "react";
import { motion } from "framer-motion";
import navbarItem from "../../../entities/navbarItem";

const NavbarItem = (props: navbarItem) => {
	const { link, text } = props;
	return (
		<motion.li
			className="text-white hover:text-orange-700"
			whileHover={{
				scale: 1.1,
				transition: { duration: 0.2 },
			}}
		>
			<Link
				href={link}
				to={link}
				spy={true}
				smooth={true}
				offset={-70}
				duration={1000}
				className="cursor-pointer"
			>
				{text}
			</Link>
		</motion.li>
	);
};

export default NavbarItem;
