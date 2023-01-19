"use client"; // this is a client component
import Link from "next/link";
import React from "react";
import button from "../../entities/button";
import { motion } from "framer-motion";
import { FaArrowDown } from "react-icons/fa";

const LinkItem = (props: button) => {
	const { title, icon, href, blank } = props;

	return (
		<Link href={`${href}`} target={`${blank ? "_blank" : ""}`}>
			<motion.button
				className='flex items-center gap-2 text-md'
				whileHover={{
					scale: 1.1,
					transition: { duration: 0.4 },
					color: "#c2410c",
					backgroundColor: "#fff",
				}}
				whileTap={{ scale: 0.9, x: "-5px", y: "5px" }}>
				<p className='text-md md:text-xl '>{title}</p>
				{icon === "arrowDown" && (
					<motion.span
						animate={{ y: ["2px", "-2px", "2px"] }}
						transition={{ duration: 1, repeat: Infinity }}>
						<FaArrowDown />
					</motion.span>
				)}
			</motion.button>
		</Link>
	);
};

export default LinkItem;
