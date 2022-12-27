import Link from "next/link";
import React from "react";
import navbarItem from "../interface/navbarItem";

const NavbarItem = (props: navbarItem) => {
	const { link, text } = props;
	return (
		<li className='hover:text-orange-600'>
			<Link href={link}>{text}</Link>
		</li>
	);
};

export default NavbarItem;
