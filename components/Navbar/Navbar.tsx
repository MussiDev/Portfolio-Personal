import React from "react";
import navbarItem from "../../common/navbarItem";
import NavbarItem from "./NavbarItem";
import items from "../../api/navbarItems.json";
const Navbar = () => {
	return (
		<div>
			{items &&
				items.map((item: navbarItem, k: number) => (
					<ul key={k}>
						<NavbarItem link={item.link} text={item.text} />
					</ul>
				))}
		</div>
	);
};

export default Navbar;
