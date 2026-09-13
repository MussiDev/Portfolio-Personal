import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
	metadataBase: new URL("https://joaquinmussi.vercel.app"),
	title: "Studio",
	robots: { index: false, follow: false },
};

const StudioLayout = ({ children }: { children: React.ReactNode }) => (
	<html lang='es'>
		<body>{children}</body>
	</html>
);

export default StudioLayout;
