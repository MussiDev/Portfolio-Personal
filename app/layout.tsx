import React from "react";
import dynamic from "next/dynamic";
const Footer = dynamic(() => import("./components/Footer/Footer"), {
	ssr: false,
});

const RootLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<html lang='en'>
			<head>
				<title>Joaquín Mussi - Dev</title>
				<meta charSet='utf-8' />
				<meta content='width=device-width, initial-scale=1.0' name='viewport' />
				<meta content='en' httpEquiv='Content-Language' />
				<meta
					name='description'
					content='Portfolio personal de Joaquín Mussi'
				/>
				<meta name='robots' content='index, follow' />
				<meta name='author' content='Joaquín Mussi' />
				<meta name='copyright' content='Joaquín Mussi' />
				<meta
					name='keywords'
					content='portfolio, joaquin, mussi, joaquin mussi'
				/>
				<meta name='theme-color' content='#3367D6' />
				<meta name='msapplication-TileColor' content='#3367D6' />
				<meta name='msapplication-navbutton-color' content='#3367D6' />
				<meta name='apple-mobile-web-app-status-bar-style' content='black' />
				<meta name='apple-mobile-web-app-title' content='Joaquín Mussi - Dev' />
				<meta name='apple-mobile-web-app-capable' content='yes' />
				<link rel='manifest' href='/manifest.json' />
				<link rel='icon' href='/favicon.ico' />
				<link rel='apple-touch-icon' href='/favicon.ico' />
			</head>
			<body className='text-white bg-slate-800 '>
				{children}
				<Footer />
			</body>
		</html>
	);
};

export default RootLayout;
