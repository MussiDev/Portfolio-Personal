import Head from "next/head";
import Navbar from "../components/Navbar/Navbar";

const Index = () => {
	return (
		<div>
			<Head>
				<title>Joaquín Mussi - Dev</title>
				<meta name='description' content='' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main>
				<Navbar />
			</main>
		</div>
	);
};

export default Index;
