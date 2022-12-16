import React, { useState } from "react";
import navbarItem from "../../common/navbarItem";
import NavbarItem from "./NavbarItem";
import items from "../../api/navbarItems.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
const Navbar = () => {
	const [open, setOpen] = useState(false);

	const viewIcon = () => setOpen(!open);
	return (
		<nav className='flex  h-screen w-6/6 gap-2 cursor-pointer text-white transition-transform'>
			<FontAwesomeIcon
				icon={!open ? faBars : faXmark}
				onClick={viewIcon}
				className={`m-4 ${open ? "text-2xl" : "text-xl"} `}
			/>
			{open && (
				<ul className=' list-none gap-8  flex flex-col items-center w-screen  justify-center'>
					{items &&
						items.map((item: navbarItem, k: number) => (
							<NavbarItem key={k} link={item.link} text={item.text} />
						))}
				</ul>
			)}
		</nav>
	);
};

export default Navbar;
