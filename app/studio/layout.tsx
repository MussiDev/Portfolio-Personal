import type { Metadata } from "next";
import type React from "react";

import { SITE_URL } from "../../entities/site";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: "Studio",
	robots: { index: false, follow: false },
};

const StudioLayout = ({ children }: { children: React.ReactNode }) => (
	<html lang='es'>
		<body>{children}</body>
	</html>
);

export default StudioLayout;
