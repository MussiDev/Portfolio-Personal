"use client"; // this is a client component

import { FaArrowDown } from "react-icons/fa";
import { Link } from "react-scroll";
import LinkItem from "./LinkItem";
import React from "react";
import { button } from "../../../entities";
import { motion } from "framer-motion";

const Button = (props: button) => {
	const { title, icon, href, blank, more } = props;
	return (
		<>
			{more ? (
				<Link
					href={href}
					to={href}
					spy={true}
					smooth={true}
					offset={-70}
					duration={1000}
					className="cursor-pointer"
				>
					<motion.button
						className="flex items-center gap-2 text-md"
						whileHover={{
							scale: 1.1,
							transition: { duration: 0.4 },
							color: "orange-700",
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
			) : (
				<LinkItem title={title} icon={icon} href={href} blank={blank} />
			)}
		</>
	);
};

export default Button;
