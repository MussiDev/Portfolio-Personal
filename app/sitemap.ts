import { MetadataRoute } from "next";

import { client } from "../sanity/lib/client";
import { IDIOMAS, IDIOMA_POR_DEFECTO, ruta } from "../entities/i18n";
import { getMachines } from "./src/common/taller";

const BASE_URL = "https://joaquinmussi.vercel.app";

type Entrada = {
	path: string;
	lastModified?: Date;
	changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
	priority?: number;
};

/**
 * Una entrada por ruta y por idioma, cada una declarando dónde vive su
 * traducción. Google necesita las dos direcciones y el vínculo entre ellas;
 * con una sola trata a la otra como contenido duplicado.
 */
const entradas = (rutas: Entrada[]): MetadataRoute.Sitemap =>
	rutas.flatMap(({ path, lastModified, changeFrequency, priority }) =>
		IDIOMAS.map((lang) => ({
			url: `${BASE_URL}${ruta(lang, path)}`,
			lastModified: lastModified ?? new Date(),
			changeFrequency,
			priority,
			alternates: {
				languages: {
					es: `${BASE_URL}${ruta("es", path)}`,
					en: `${BASE_URL}${ruta("en", path)}`,
					"x-default": `${BASE_URL}${ruta(IDIOMA_POR_DEFECTO, path)}`,
				},
			},
		})),
	);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const posts: { slug: string; publishedAt: string }[] = await client.fetch(
		`*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
			"slug": slug.current,
			publishedAt
		}`,
	);

	return entradas([
		{ path: "/", changeFrequency: "monthly", priority: 1 },
		{ path: "/maquinas", changeFrequency: "monthly", priority: 0.9 },

		// Solo las máquinas que se pueden abrir: una ficha sin ningún tiempo
		// escrito no aporta nada a un buscador, y el registro ya la lista.
		...getMachines()
			.filter((m) => Object.values(m.tiempos).some((t) => t.parrafos.es?.length))
			.map((m) => ({
				path: `/maquinas/${m.slug}`,
				changeFrequency: "monthly" as const,
				priority: 0.8,
			})),

		{ path: "/oficio", changeFrequency: "monthly", priority: 0.8 },
		{ path: "/contacto", changeFrequency: "yearly", priority: 0.6 },
		{ path: "/blog", changeFrequency: "weekly", priority: 0.8 },

		...posts.map((post) => ({
			path: `/blog/${post.slug}`,
			lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.7,
		})),
	]);
}
