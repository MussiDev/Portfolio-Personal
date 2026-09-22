/**
 * A post's title, without the emoji it carries from Sanity.
 *
 * One of the posts is called "🚀 SEO for devs: your code can make the
 * difference". The rocket belongs to another site: there isn't a single
 * other emoji here, not on the home, not on the case, not in the
 * navigation. Leaving it in the blog listing made that row speak a
 * different language than the other three.
 *
 * It's stripped on render and not in the CMS on purpose: the content
 * belongs to the author, the site's typography belongs to the site. If
 * the title changes tomorrow, there's nothing to re-edit by hand.
 *
 * It doesn't touch accents, ñ, or punctuation — only pictographs, their
 * variation selectors, and the ZWJs that glue sequences like 👨‍💻.
 */

const PICTOGRAPHS = /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{FE0F}\u{200D}\u{20E3}]/gu;

export const cleanTitle = (title: string): string =>
	title.replace(PICTOGRAPHS, "").replace(/\s+/g, " ").trim();
