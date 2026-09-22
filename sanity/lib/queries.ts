import { groq } from "next-sanity";

// No coverImage: no listing uses it (not the home, not /blog, not
// navigation between posts), and a Sanity image is several metadata
// fields per post that would travel on every render of the home for nothing.
export const postsQuery = groq`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    tags
  }
`;

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    _updatedAt,
    title,
    "slug": slug.current,
    publishedAt,
    tags,
    body,
    markdownBody
  }
`;

// The parameter is called $tagName, not $tag: @sanity/client's
// QueryParams reserves the "tag" key for its own request-tagging feature
// — a params { tag: "..." } collides with that and won't even compile.
export const postsByTagQuery = groq`
  *[_type == "post" && $tagName in tags] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    tags
  }
`;

export const allTagsQuery = groq`
  array::unique(*[_type == "post" && defined(tags)].tags[])
`;
