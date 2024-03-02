"use client"; // this is a client component

import { FaGithub, FaLinkedin } from "react-icons/fa";

import Link from "next/link";
import React from "react";
import iconLink from "../../../entities/iconLink";
import { motion } from "framer-motion";

const IconLink = (props: iconLink) => {
	const { to, icon } = props;
	return (
		<motion.span
			whileHover={{
				scale: 1.1,
				transition: { duration: 0.2 },
				color: "#F24F0F",
			}}
		>
			<Link href={to} target="_blank" aria-label="social">
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
