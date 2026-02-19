import { MetadataRoute } from "next";
import { client } from "../sanity/lib/client";

const BASE_URL = "https://joaquinmussi.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const posts: { slug: string; publishedAt: string }[] = await client.fetch(
		`*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
			"slug": slug.current,
			publishedAt
		}`,
	);

	const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
		url: `${BASE_URL}/blog/${post.slug}`,
		lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
		changeFrequency: "weekly",
		priority: 0.7,
	}));

	return [
		{
			url: BASE_URL,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 1,
		},
		{
			url: `${BASE_URL}/blog`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.8,
		},
		...postUrls,
	];
}
