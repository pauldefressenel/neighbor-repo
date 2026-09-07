import { client } from './client'

export const getArticlesBySection = (language, section) =>
  client.fetch(
    `*[_type == "article" && language == $language && section == $section] | order(publishedAt desc) {
      _id,
      title,
      slug,
      section,
      language,
      category,
      author,
      excerpt,
      mainImage,
      publishedAt
    }`,
    { language, section }
  )

// The homepage strip is editorially chosen, not simply the newest articles:
// an article appears here when its `featured` field names this language.
const FEATURED_FLAG = { en: 'English', fr: 'French' }

export const getLatestArticles = (language) =>
  client.fetch(
    `*[_type == "article" && language == $language && featured == $featured]
      | order(publishedAt desc) [0...4] {
      _id,
      title,
      slug,
      section,
      language,
      category,
      author,
      excerpt,
      mainImage,
      publishedAt
    }`,
    { language, featured: FEATURED_FLAG[language] ?? FEATURED_FLAG.en }
  )

export const getArticleBySlug = (slug) =>
  client.fetch(
    `*[_type == "article" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      section,
      language,
      category,
      author,
      excerpt,
      mainImage,
      body,
      poems,
      publishedAt
    }`,
    { slug }
  )

export const getAboutPage = (language) =>
  client.fetch(
    `*[_type == "aboutPage" && _id == $id][0] {
      title,
      body,
      founders[] { _key, name, image }
    }`,
    { id: `about-${language}` }
  )
