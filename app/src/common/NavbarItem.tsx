"use client";

import LinkNext from "next/link";
import React from "react";
import { Link as ScrollLink } from "react-scroll";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import navbarItem from "../../../entities/navbarItem";

const ScrollLinkComponent = ScrollLink as React.ElementType;

const NavbarItem = ({ link, text }: navbarItem) => {
	const pathname = usePathname();
	const isPageLink = link.startsWith("/");
	const isHome = pathname === "/";

	return (
		<motion.li
			className={isPageLink ? "" : "text-white hover:text-orange-700"}
			whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
		>
			{isPageLink ? (
				<LinkNext
					href={link}
					className='cursor-pointer px-4 py-1.5 rounded-full border border-orange-700 text-orange-400 hover:bg-orange-700 hover:text-white transition-colors text-sm font-medium'
				>
					{text}
				</LinkNext>
			) : isHome ? (
				<ScrollLinkComponent
					to={link}
					spy={true}
					smooth={true}
					offset={-70}
					duration={1000}
					className='cursor-pointer'
				>
					{text}
				</ScrollLinkComponent>
			) : (
				<LinkNext href={`/#${link}`} className='cursor-pointer'>
					{text}
				</LinkNext>
			)}
		</motion.li>
	);
};

export default NavbarItem;
