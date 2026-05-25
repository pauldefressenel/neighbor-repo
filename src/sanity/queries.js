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
