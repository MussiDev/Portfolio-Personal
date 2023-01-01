import Head from "next/head";
import About from "../components/About/About";
import Main from "../components/Main/Main";
import Navbar from "../components/Navbar/Navbar";
import Projects from "../components/Projects/Projects";

const Index = () => {
	return (
		<>
			<Head>
				<title>Joaquín Mussi - Dev</title>
				<meta name='description' content='' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main className='text-white bg-slate-800 '>
				<Navbar />
				<section className='px-10 flex flex-col gap-32'>
					<Main />
					<About />
					<Projects />
				</section>
			</main>
		</>
	);
};

export default Index;
