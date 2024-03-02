import { FaArrowDown } from "react-icons/fa";
import Link from "next/link";
import React from "react";
import button from "../../../entities/button";
import { motion } from "framer-motion";

const LinkItem = (props: button) => {
	const { title, icon, href, blank } = props;

	return (
		<Link href={`${href}`} target={`${blank ? "_blank" : ""}`}>
			<motion.button
				className="flex items-center gap-2 text-md hover:text-orange-700 hover:bg-white"
				whileHover={{
					scale: 1.1,
					transition: { duration: 0.4 },
				}}
				whileTap={{ scale: 0.9, x: "-0.3125rem", y: "0.3125rem" }}
			>
				<p className="text-md md:text-xl ">{title}</p>
				{icon === "arrowDown" && (
					<motion.span
						animate={{ y: ["0.125rem", "-0.125rem", "0.125rem"] }}
						transition={{ duration: 1, repeat: Infinity }}
					>
						<FaArrowDown />
					</motion.span>
				)}
			</motion.button>
		</Link>
	);
};

export default LinkItem;
