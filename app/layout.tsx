import React from "react";
import Footer from "./components/Footer/Footer";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<html lang='en'>
			<head>
				<title>Joaquín Mussi - Dev</title>
				<meta charSet='utf-8' />
				<meta content='width=device-width, initial-scale=1.0' name='viewport' />
				<meta content='en' http-equiv='Content-Language' />
				<meta
					name='description'
					content='Portfolio personal de Joaquín Mussi'
				/>
				<meta name='robots' content='index, follow' />
				<meta name='author' content='Joaquín Mussi' />
				<link rel='icon' href='/favicon.ico' />

				<meta name='copyright' content='Joaquín Mussi' />
				<meta
					name='keywords'
					content='portfolio, joaquin, mussi, joaquin mussi'
				/>
				<meta name='theme-color' content="'rgb(30 41 59)" />
			</head>
			<body className='text-white bg-slate-800 '>
				{children}
				<Footer />
			</body>
		</html>
	);
};

export default RootLayout;
