import Head from "next/head";
import About from "../components/About/About";
import Main from "../components/Main/Main";
import Navbar from "../components/Navbar/Navbar";
import Projects from "../components/Projects/Projects";
import Experience from "../components/Experience/Experience";
import Contact from "../components/Contact/Contact";
import Arrow from "../common/Arrow";
import Footer from "../components/Footer/Footer";

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
				<Contact />
				<Arrow />
				<Footer />
			</main>
		</>
	);
};

export default Index;
