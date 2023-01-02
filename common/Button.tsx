import React from "react";
import { motion } from "framer-motion";
import button from "../entities/button";
import { FaArrowDown } from "react-icons/fa";
import Link from "next/link";

const Button = (props: button) => {
	const { title, icon, href, blank } = props;
	return blank ? (
		<Link href={`${href}`} target='_blank'>
			<motion.button
				className='flex items-center gap-2 text-md '
				whileHover={{ scale: 1.1, transition: { duration: 0.4 } }}>
				<p className='text-md md:text-2xl'>{title}</p>
				{icon === "arrowDown" && (
					<motion.span
						animate={{ y: ["2px", "-2px", "2px"] }}
						transition={{ duration: 1, repeat: Infinity }}>
						<FaArrowDown />
					</motion.span>
				)}
			</motion.button>
		</Link>
	) : (
		<Link href={`${href}`}>
			<motion.button
				className='flex items-center gap-2 text-md'
				whileHover={{ scale: 1.1, transition: { duration: 0.4 } }}>
				<p className='text-md md:text-2xl'>{title}</p>
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

export default Button;
