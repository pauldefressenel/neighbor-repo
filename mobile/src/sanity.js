import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

// Same project and dataset as the website (src/sanity/client.js). Native apps
// aren't browsers, so Sanity's CORS origins don't apply here.
export const client = createClient({
  projectId: '9hw8z0gm',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = createImageUrlBuilder(client)
export const urlFor = (source) => builder.image(source)

// Mirrors getLatestArticles in src/sanity/queries.js: the homepage strip is
// editorially chosen through each article's `featured` field.
const FEATURED_FLAG = { en: 'English', fr: 'French' }

export const getLatestArticles = (language) =>
  client.fetch(
    `*[_type == "article" && language == $language && featured == $featured]
      | order(publishedAt desc) [0...4] {
      _id,
      title,
      slug,
      section,
      category,
      author,
      excerpt,
      mainImage
    }`,
    { language, featured: FEATURED_FLAG[language] ?? FEATURED_FLAG.en }
  )

// Every article in one of the app's rubriques (see sections.js), newest first.
export const getSectionArticles = (language, sections) =>
  client.fetch(
    `*[_type == "article" && language == $language && section in $sections]
      | order(publishedAt desc) {
      _id,
      title,
      slug,
      section,
      category,
      author,
      excerpt,
      mainImage
    }`,
    { language, sections }
  )
