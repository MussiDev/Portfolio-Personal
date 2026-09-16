import { groq } from "next-sanity";

export const postsQuery = groq`
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    coverImage,
    tags
  }
`;

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    coverImage,
    tags,
    body,
    markdownBody
  }
`;

// El parámetro se llama $tagName, no $tag: QueryParams de @sanity/client
// reserva la clave "tag" para su propia feature de request tagging — un
// params { tag: "..." } colisiona con eso y ni compila.
export const postsByTagQuery = groq`
  *[_type == "post" && $tagName in tags] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    coverImage,
    tags
  }
`;

export const allTagsQuery = groq`
  array::unique(*[_type == "post" && defined(tags)].tags[])
`;
