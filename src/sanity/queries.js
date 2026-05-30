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

export const getLatestArticles = (language) =>
  client.fetch(
    `*[_type == "article" && language == $language] | order(publishedAt desc) [0...4] {
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
    { language }
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
