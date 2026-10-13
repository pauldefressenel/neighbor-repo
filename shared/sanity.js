// The Sanity project and the queries the website and the app both run. Each
// side makes its own client (their @sanity/client versions differ) and
// passes it in, so nothing here imports a package.

export const SANITY = {
  projectId: '9hw8z0gm',
  dataset: 'production',
  apiVersion: '2024-01-01',
}

// What a card shows.
const CARD = `
  _id,
  title,
  slug,
  section,
  language,
  category,
  author,
  excerpt,
  mainImage,
  illustrationScale,
  publishedAt
`

// The home page (Latest / A La Une) is editorially chosen: the articles in
// the language's À la Une document (studio/schemas/frontPage.js), in its
// order, leaving out any since deleted or unpublished.
export const fetchLatestArticles = (client, language) =>
  client.fetch(
    `*[_id == $id][0].articles[]-> { ${CARD} }`,
    { id: `front-${language === 'fr' ? 'fr' : 'en'}` }
  ).then((articles) => (articles ?? []).filter((a) => a?._id))

// Every article in one rubrique, newest first: `sections` is its Sanity
// sections (sections.js).
export const fetchSectionArticles = (client, language, sections) =>
  client.fetch(
    `*[_type == "article" && language == $language && section in $sections]
      | order(publishedAt desc) { ${CARD} }`,
    { language, sections }
  )

// One article in full, by slug alone.
export const fetchArticle = (client, slug) =>
  client.fetch(
    `*[_type == "article" && slug.current == $slug][0] {
      ${CARD},
      body,
      poems
    }`,
    { slug }
  )

// The About page's text: one `aboutPage` document per language, with a fixed
// id (studio/schemas/aboutPage.js).
export const fetchAboutPage = (client, language) =>
  client.fetch(
    `*[_type == "aboutPage" && _id == $id][0] {
      title,
      body,
      founders[] { _key, name, image }
    }`,
    { id: `about-${language}` }
  )
