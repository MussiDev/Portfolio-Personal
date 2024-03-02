"use client";

import React, { useEffect, useState } from "react";

import { AiOutlineArrowUp } from "react-icons/ai";
import { motion } from "framer-motion";

const Arrow = () => {
	const [showButton, setShowButton] = useState(false);
	const handleScrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};
	useEffect(() => {
		const handleScrollButtonVisibily = () => {
			window.scrollY > 100 ? setShowButton(true) : setShowButton(false);
		};
		window.addEventListener("scroll", handleScrollButtonVisibily);
		return () => {
			window.removeEventListener("scroll", handleScrollButtonVisibily);
		};
	}, []);

	return (
		<>
			{showButton && (
				<motion.p
					onClick={handleScrollToTop}
					id="top"
					animate={{ y: ["0.3125rem", "-0.3125rem", "0.3125rem"] }}
					transition={{ duration: 2, repeat: Infinity }}
				>
					<AiOutlineArrowUp size={20} />
				</motion.p>
			)}
		</>
	);
};

export default Arrow;
