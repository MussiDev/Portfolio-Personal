import Link from "next/link";
import React from "react";
import navbarItem from "../entities/navbarItem";

const NavbarItem = (props: navbarItem) => {
	const { link, text } = props;
	return (
		<li>
			<Link href={link}>{text}</Link>
		</li>
	);
};

export default NavbarItem;
