import { groq } from "next-sanity";

// Sin coverImage: ningún listado la usa (ni la home, ni /blog, ni la
// navegación entre notas), y una imagen de Sanity son varios campos de
// metadata por post que viajan en cada render de la home para nada.
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
    tags
  }
`;

export const allTagsQuery = groq`
  array::unique(*[_type == "post" && defined(tags)].tags[])
`;
