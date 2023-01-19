"use client"; // this is a client component
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AiOutlineArrowUp } from "react-icons/ai";
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
					id='top'
					animate={{ y: ["5px", "-5px", "5px"] }}
					transition={{ duration: 2, repeat: Infinity }}>
					<AiOutlineArrowUp size={20} />
				</motion.p>
			)}
		</>
	);
};

export default Arrow;
