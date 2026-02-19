import { FaArrowDown } from "react-icons/fa";
import Link from "next/link";
import React from "react";
import button from "../../../entities/button";
import { motion } from "framer-motion";

const variantClass = {
	primary:
		"bg-orange-700 text-white border border-orange-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-white hover:text-orange-700 transition-colors duration-200",
	secondary:
		"border border-orange-700 text-orange-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-orange-700 hover:text-white transition-colors duration-200",
	ghost: "text-gray-300 hover:text-orange-700 transition-colors duration-200",
};

const LinkItem = (props: button) => {
	const { title, icon, href, blank, variant = "ghost" } = props;

	return (
		<Link href={`${href}`} target={`${blank ? "_blank" : ""}`}>
			<motion.span
				className={`inline-flex items-center gap-2 text-sm md:text-base cursor-pointer ${variantClass[variant]}`}
				whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
				whileTap={{ scale: 0.96 }}
			>
				{title}
				{icon === "arrowDown" && (
					<motion.span
						animate={{ y: ["0.125rem", "-0.125rem", "0.125rem"] }}
						transition={{ duration: 1, repeat: Infinity }}
					>
						<FaArrowDown />
					</motion.span>
				)}
			</motion.span>
		</Link>
	);
};

export default LinkItem;
