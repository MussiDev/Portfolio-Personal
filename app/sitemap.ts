import { MetadataRoute } from "next";

import { client } from "../sanity/lib/client";
import { LANGUAGES, DEFAULT_LANGUAGE, localizedPath } from "../entities/i18n";
import { SITE_URL } from "../entities/site";

const BASE_URL = SITE_URL;

type Entry = {
	path: string;
	lastModified?: Date;
	changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
	priority?: number;
	/** false para contenido que solo existe en DEFAULT_LANGUAGE (p. ej. el
	 * blog, que vive en Sanity sin traducción): emite una sola entrada, sin
	 * hreflang a idiomas que no existen. */
	translated?: boolean;
};

const entries = (paths: Entry[]): MetadataRoute.Sitemap =>
	paths.flatMap(({ path, lastModified, changeFrequency, priority, translated = true }) => {
		const langs = translated ? LANGUAGES : [DEFAULT_LANGUAGE];
		return langs.map((lang) => ({
			url: `${BASE_URL}${localizedPath(lang, path)}`,
			lastModified: lastModified ?? new Date(),
			changeFrequency,
			priority,
			alternates: {
				languages: translated
					? {
							es: `${BASE_URL}${localizedPath("es", path)}`,
							en: `${BASE_URL}${localizedPath("en", path)}`,
							"x-default": `${BASE_URL}${localizedPath(DEFAULT_LANGUAGE, path)}`,
						}
					: {
							es: `${BASE_URL}${localizedPath(DEFAULT_LANGUAGE, path)}`,
							"x-default": `${BASE_URL}${localizedPath(DEFAULT_LANGUAGE, path)}`,
						},
			},
		}));
	});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	let posts: { slug: string; publishedAt: string }[] = [];
	try {
		posts = await client.fetch(
			`*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
				"slug": slug.current,
				publishedAt
			}`,
			{},
			{ next: { revalidate: 3600 } },
		);
	} catch {
		posts = [];
	}

	return entries([
		{ path: "/", changeFrequency: "weekly", priority: 1 },

		...posts.map((post) => ({
			path: `/blog/${post.slug}`,
			lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.7,
			translated: false,
		})),
	]);
}
