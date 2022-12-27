import React from "react";
import { motion } from "framer-motion";
import button from "../interface/button";
import { FaArrowDown } from "react-icons/fa";

const Button = (props: button) => {
	const { title, icon } = props;
	return (
		<motion.button
			whileHover={{ scale: 1.1, transition: { duration: 0.4 } }}
			className='flex items-center gap-2 p-2 bg-orange-700 rounded-full text-md w-max hover:bg-white hover:text-orange-700'>
			{title}
			{icon === "arrowDown" && (
				<motion.span
					animate={{ y: ["2px", "-2px", "2px"] }}
					transition={{ duration: 1, repeat: Infinity }}>
					<FaArrowDown />
				</motion.span>
			)}
		</motion.button>
	);
};

export default Button;
