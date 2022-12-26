import React, { useState } from "react";
import navbarItem from "../../common/navbarItem";
import NavbarItem from "./NavbarItem";
import items from "../../api/navbarItems.json";
import { FaDev, FaGithub, FaLinkedin } from "react-icons/fa";
import Link from "next/link";
const Navbar = () => {
	return (
		<header className='fixed z-20 flex items-center justify-between w-full gap-10 p-2 text-lg backdrop-blur-md bg-slate-800'>
			<Link
				href='/'
				className='flex items-center gap-2 text-lg font-semibold tracking-tighter'>
				<FaDev className='cursor-pointer' />
				Joaquín Mussi
			</Link>
			<ul className='items-center hidden gap-6 p-2 mx-auto lg:flex'>
				{items &&
					items.map((item: navbarItem, k: number) => (
						<NavbarItem key={k} link={item.link} text={item.text} />
					))}
			</ul>
			<div className='flex gap-2 cursor-pointer lg:hidden'>
				<Link href='https://github.com/MussiDev' target='_blank'>
					<FaGithub />
				</Link>
				<Link href='https://www.linkedin.com/in/joaquinmussi/' target='_blank'>
					<FaLinkedin />
				</Link>
			</div>
		</header>
	);
};

export default Navbar;
