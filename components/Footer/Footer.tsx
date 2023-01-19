import React from "react";
import IconLink from "../../common/IconLink";

const Footer = () => {
	return (
		<footer className='max-w-[1240px] m-auto px-4 py-8 flex flex-col items-center gap-8 text-4xl'>
			<div className='flex'>
				<IconLink to='https://github.com/MussiDev' icon='github' />
				<IconLink
					to='https://www.linkedin.com/in/joaquinmussi/'
					icon='linkedin'
				/>
			</div>
			<p className='text-sm'>Joaquín Mussi &copy; 2023</p>
		</footer>
	);
};

export default Footer;
