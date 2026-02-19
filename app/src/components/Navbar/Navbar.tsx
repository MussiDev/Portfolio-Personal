"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FaBars, FaDev, FaTimes } from "react-icons/fa";
import React, { useEffect, useState } from "react";

import NextLink from "next/link";
import { Link as ScrollLink } from "react-scroll";
import dynamic from "next/dynamic";
import items from "../../../../api/navbarItems.json";
import navbarItem from "../../../../entities/navbarItem";
import { usePathname } from "next/navigation";

const Link = ScrollLink as React.ElementType;

const NavbarItem = dynamic(() => import("../../common/NavbarItem"), {
	ssr: false,
});

const scrollItems = items.filter(
	(item: navbarItem) => !item.link.startsWith("/"),
);
const pageItems = items.filter((item: navbarItem) => item.link.startsWith("/"));

const Navbar = () => {
	const [shadow, setShadow] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const pathname = usePathname();
	const isHome = pathname === "/";

	useEffect(() => {
		const handleShadow = () => {
			setShadow(window.scrollY > 0);
		};
		window.addEventListener("scroll", handleShadow);
		return () => window.removeEventListener("scroll", handleShadow);
	}, []);

	return (
		<>
			<header
				className={
					shadow
						? "fixed w-full shadow-xl z-[100] ease-in-out duration-300 flex justify-between h-16 px-10 text-sm backdrop-blur-md bg-slate-800"
						: "fixed w-full z-[100] flex justify-between h-16 px-10 text-sm backdrop-blur-md bg-slate-800"
				}
			>
				<motion.div
					className='flex'
					initial={{ x: -100, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ duration: 0.5 }}
				>
					<Link
						href='home'
						to='home'
						spy={true}
						smooth={true}
						offset={-70}
						duration={1000}
						className='flex items-center gap-2 text-base font-semibold cursor-pointer'
						onClick={() => setIsMenuOpen(false)}
					>
						<FaDev size={25} />
						Joaquín Mussi
					</Link>
				</motion.div>

				<motion.ul
					className='items-center hidden gap-4 lg:flex'
					initial={{ x: 100, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ duration: 0.5 }}
				>
					{items &&
						items.map((item: navbarItem, k: number) => (
							<NavbarItem key={k} link={item.link} text={item.text} />
						))}
				</motion.ul>

				<motion.div
					className='flex items-center gap-4 lg:hidden'
					initial={{ x: 100, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ duration: 0.5 }}
				>
					<button
						onClick={() => setIsMenuOpen((prev) => !prev)}
						aria-label={isMenuOpen ? "Close menu" : "Open menu"}
						className='text-white  transition-colors'
					>
						{isMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
					</button>
				</motion.div>
			</header>

			<AnimatePresence>
				{isMenuOpen && (
					<motion.nav
						className='fixed top-16 left-0 right-0 z-[99] bg-slate-800 border-t border-slate-700 lg:hidden'
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
					>
						<ul className='flex flex-col py-2'>
							{scrollItems.map((item: navbarItem, k: number) => (
								<li key={k}>
									{isHome ? (
										<Link
											href={item.link}
											to={item.link}
											spy={true}
											smooth={true}
											offset={-70}
											duration={1000}
											className='block px-10 py-3 cursor-pointer text-white hover:text-orange-700 hover:bg-slate-700 transition-colors'
											onClick={() => setIsMenuOpen(false)}
										>
											{item.text}
										</Link>
									) : (
										<NextLink
											href={`/#${item.link}`}
											className='block px-10 py-3 cursor-pointer text-white hover:text-orange-700 hover:bg-slate-700 transition-colors'
											onClick={() => setIsMenuOpen(false)}
										>
											{item.text}
										</NextLink>
									)}
								</li>
							))}
							{pageItems.length > 0 && (
								<>
									<li>
										<hr className='my-2 border-slate-700 mx-10' />
									</li>
									{pageItems.map((item: navbarItem, k: number) => (
										<li key={`page-${k}`} className='px-10 py-2'>
											<NextLink
												href={item.link}
												className='inline-block px-4 py-1.5 rounded-full border border-orange-700 text-orange-400 hover:bg-orange-700 hover:text-white transition-colors text-sm font-medium'
												onClick={() => setIsMenuOpen(false)}
											>
												{item.text}
											</NextLink>
										</li>
									))}
								</>
							)}
						</ul>
					</motion.nav>
				)}
			</AnimatePresence>
		</>
	);
};

export default Navbar;
