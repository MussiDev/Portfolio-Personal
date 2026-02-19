"use client";

import dynamic from "next/dynamic";
import React from "react";

const Navbar = dynamic(() => import("../src/components/Navbar/Navbar"), {
	ssr: false,
});
const Footer = dynamic(() => import("../src/components/Footer/Footer"), {
	ssr: false,
});

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<Navbar />
			{children}
			<Footer />
		</>
	);
};

export default ClientLayout;
