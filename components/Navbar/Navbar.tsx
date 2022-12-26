import React, { useState } from "react";
import navbarItem from "../../common/navbarItem";
import NavbarItem from "./NavbarItem";
import items from "../../api/navbarItems.json";
import { FaDev } from "react-icons/fa";
import Link from "next/link";
const Navbar = () => {
	return (
		<header className='fixed z-20 w-full p-2 text-lg backdrop-blur-md'>
			<div className='max-w-3xl mx-auto'>
				<nav className='flex items-center gap-3'>
					<Link
						href='/'
						className='flex items-center gap-2 p-2 text-lg font-semibold tracking-tighter'>
						<FaDev className='' />
						Joaquín Mussi
					</Link>
					<ul className='items-center hidden gap-6 lg:flex'>
						{items &&
							items.map((item: navbarItem, k: number) => (
								<NavbarItem key={k} link={item.link} text={item.text} />
							))}
					</ul>
				</nav>
			</div>
		</header>
	);
};

export default Navbar;
