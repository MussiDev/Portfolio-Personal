import { notFound } from "next/navigation";
import React from "react";

import { LANGUAGES, isLanguage } from "../../../entities/i18n";

export const generateStaticParams = () => LANGUAGES.map((lang) => ({ lang }));

const WorkshopLayout = async ({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ lang: string }>;
}) => {
	const { lang } = await params;
	if (!isLanguage(lang)) notFound();

	return <>{children}</>;
};

export default WorkshopLayout;
