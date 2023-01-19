import React from "react";
import Title from "../../common/Title";
import Button from "../../common/Button";
import { useTypewriter } from "react-simple-typewriter";

const Main = () => {
	const [text, count] = useTypewriter({
		words: ["NextJS + .NET", "FullStack Developer"],
		loop: true,
		delaySpeed: 2000,
	});
	return (
		<section className='w-full h-screen text-center py-16' id='home'>
			<div className='max-w-[1240px] w-full h-full mx-auto p-2 flex justify-center items-center'>
				<div className='flex flex-col items-center'>
					<p className='uppercase text-lg tracking-widest text-gray-300'>
						Hi, I'm
					</p>
					<Title title='Joaquín Mussi' color='orange-700' />
					<Title title={text} />
					<p className='py-4 text-gray-300 sm:max-w-[70%] m-auto text-xl'>
						I’m dedicated on building responsive applications focusing in the
						<b> scalability, clean architecture and good practises. </b>
					</p>
					<Button title='More Information' icon='arrowDown' href='#about' />
				</div>
			</div>
		</section>
	);
};

export default Main;
