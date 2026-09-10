import type { Metadata } from "next";
import ClientSections from "../ClientSections";

export const metadata: Metadata = {
	title: "Versión anterior — Joaquín Mussi",
	// El sitio anterior queda accesible mientras el taller se completa,
	// pero fuera del índice: la versión canónica es la mesa.
	robots: { index: false, follow: true },
	alternates: { canonical: "/" },
};

const Anterior = () => {
	return <ClientSections />;
};

export default Anterior;
