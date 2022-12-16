import Head from "next/head";
import Home from "../components/Home/Home";

const Index = () => {
	return (
		<>
			<Head>
				<title>Joaquín Mussi - Dev</title>
				<meta name='description' content='' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main>
				<Home />
			</main>
		</>
	);
};

export default Index;
