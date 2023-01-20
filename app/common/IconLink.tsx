"use client"; // this is a client component
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import iconLink from "../../entities/iconLink";
const IconLink = (props: iconLink) => {
	const { to, icon } = props;
	return (
		<motion.span
			whileHover={{
				scale: 1.1,
				transition: { duration: 0.2 },
				color: "#F24F0F",
			}}>
			<Link href={to} target='_blank'>
				{icon === "github" ? (
					<FaGithub />
				) : (
					icon === "linkedin" && <FaLinkedin />
				)}
			</Link>
		</motion.span>
	);
};

export default IconLink;
