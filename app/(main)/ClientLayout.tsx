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
		// El sitio anterior es la excepción, no la base: sus reglas globales
		// (botones naranjas, scrollbar, etc.) viven solo bajo esta clase.
		<div className='anterior'>
			<Navbar />
			{children}
			<Footer />
		</div>
	);
};

export default ClientLayout;
