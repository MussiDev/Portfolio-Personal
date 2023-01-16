import Head from "next/head";
import About from "../components/About/About";
import Main from "../components/Main/Main";
import Navbar from "../components/Navbar/Navbar";
import Projects from "../components/Projects/Projects";
import Experience from "../components/Experience/Experience";

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
				<Main />
				<About />
				<Projects />
				<Experience />
			</main>
		</>
	);
};

export default Index;
