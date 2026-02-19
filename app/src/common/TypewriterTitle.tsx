"use client";

import React from "react";
import { useTypewriter } from "react-simple-typewriter";
import Title from "./Title";

const words = ["Software Engineer", "Full Stack Developer", "Next.js · React · .NET"];

const TypewriterTitle = () => {
	const [text] = useTypewriter({
		words,
		loop: true,
		delaySpeed: 2000,
	});
	return <Title title={text} />;
};

export default TypewriterTitle;
