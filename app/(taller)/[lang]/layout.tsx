import { notFound } from "next/navigation";
import React from "react";

import { IDIOMAS, esIdioma } from "../../../entities/i18n";

export const generateStaticParams = () => IDIOMAS.map((lang) => ({ lang }));

/**
 * Las páginas del taller no llevan el navbar ni el footer del sitio
 * anterior: cada una se abre desde la mesa y vuelve a ella.
 */
const TallerLayout = async ({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ lang: string }>;
}) => {
	const { lang } = await params;
	if (!esIdioma(lang)) notFound();

	return <>{children}</>;
};

export default TallerLayout;
