import Head from "next/head";
import Home from "../components/Home/Home";

const Index = () => {
	return (
		<>
			<Head>
				<title>Joaquín Mussi - Dev</title>
				<meta name='description' content='' />
				<link rel='icon' href='/favicon.ico' />
				<link rel='preconnect' href='https://fonts.googleapis.com' />
				<link rel='preconnect' href='https://fonts.gstatic.com' />
				<link
					href='https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap'
					rel='stylesheet'
				/>
			</Head>

			<main className='text-white bg-slate-800'>
				<Home />
			</main>
		</>
	);
};

export default Index;
