import React, { useState } from "react";
import NavbarItem from "../../common/NavbarItem";
import items from "../../api/navbarItems.json";
import { FaDev } from "react-icons/fa";
import Link from "next/link";
import IconLink from "../../common/IconLink";
import navbarItem from "../../entities/navbarItem";

const Navbar = () => {
	return (
		<header className='fixed z-[100] shadow-xl flex justify-between w-full h-16 px-10 text-lg backdrop-blur-md bg-slate-800'>
			<Link href='/' className='flex items-center gap-2 font-semibold'>
				<FaDev className='cursor-pointer' />
				Joaquín Mussi
			</Link>
			<ul className='items-center hidden gap-6 md:flex'>
				{items &&
					items.map((item: navbarItem, k: number) => (
						<NavbarItem key={k} link={item.link} text={item.text} />
					))}
			</ul>
			<div className='flex items-center gap-2 md:hidden'>
				<IconLink to='https://github.com/MussiDev' icon='github' />
				<IconLink
					to='https://www.linkedin.com/in/joaquinmussi/'
					icon='linkedin'
				/>
			</div>
		</header>
	);
};

export default Navbar;
