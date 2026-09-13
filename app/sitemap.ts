import { MetadataRoute } from "next";

import { client } from "../sanity/lib/client";
import { LANGUAGES, DEFAULT_LANGUAGE, localizedPath } from "../entities/i18n";

const BASE_URL = "https://joaquinmussi.vercel.app";

type Entry = {
	path: string;
	lastModified?: Date;
	changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
	priority?: number;
};

const entries = (paths: Entry[]): MetadataRoute.Sitemap =>
	paths.flatMap(({ path, lastModified, changeFrequency, priority }) =>
		LANGUAGES.map((lang) => ({
			url: `${BASE_URL}${localizedPath(lang, path)}`,
			lastModified: lastModified ?? new Date(),
			changeFrequency,
			priority,
			alternates: {
				languages: {
					es: `${BASE_URL}${localizedPath("es", path)}`,
					en: `${BASE_URL}${localizedPath("en", path)}`,
					"x-default": `${BASE_URL}${localizedPath(DEFAULT_LANGUAGE, path)}`,
				},
			},
		})),
	);

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
		})),
	]);
}
