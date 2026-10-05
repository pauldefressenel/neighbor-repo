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
      mainImage,
      "imageAspect": mainImage.asset->metadata.dimensions.aspectRatio,
      publishedAt
    }`,
    { language, featured: FEATURED_FLAG[language] ?? FEATURED_FLAG.en }
  )

// Every article in one of the app's rubriques (see sections.js), newest first.
const fetchSectionArticles = (language, sections) =>
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
      mainImage,
      "imageAspect": mainImage.asset->metadata.dimensions.aspectRatio,
      publishedAt
    }`,
    { language, sections }
  )

// The Rubriques list prefetches each rubrique so its articles are ready by
// the time the page opens. A prefetch is used once, by the next
// getSectionArticles for that rubrique; pull to refresh fetches anew.
const prefetched = new Map()
const prefetchKey = (language, sections) => `${language}:${sections.join(',')}`

export const prefetchSectionArticles = (language, sections) => {
  const key = prefetchKey(language, sections)
  if (!prefetched.has(key)) prefetched.set(key, fetchSectionArticles(language, sections).catch(() => null))
}

export const getSectionArticles = async (language, sections) => {
  const key = prefetchKey(language, sections)
  const early = prefetched.get(key)
  prefetched.delete(key)
  return (await early) ?? fetchSectionArticles(language, sections)
}
