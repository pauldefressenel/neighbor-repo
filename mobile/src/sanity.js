import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'
import { fetchAboutPage, fetchArticle as fetchFullArticle, fetchLatestArticles, fetchSectionArticles as fetchRubrique, SANITY } from '../../shared/sanity'

// Same project and queries as the website (shared/sanity.js). Native apps
// aren't browsers, so Sanity's CORS origins don't apply here.
export const client = createClient({ ...SANITY, useCdn: true })

const builder = createImageUrlBuilder(client)
export const urlFor = (source) => builder.image(source)

export const getLatestArticles = (language) => fetchLatestArticles(client, language)

const fetchSectionArticles = (language, sections) => fetchRubrique(client, language, sections)

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

const fetchArticle = (slug) => fetchFullArticle(client, slug)

// Opening an article from a card hands over what the card already has, so
// the article's title and byline show at once, and starts loading the rest
// while the page slides in. As with prefetched rubriques, a load is used
// once, by the next getArticle for that slug.
const cards = new Map()
const loading = new Map()

export const openArticle = (article) => {
  const slug = article.slug?.current
  if (!slug) return
  cards.set(slug, article)
  if (!loading.has(slug)) loading.set(slug, fetchArticle(slug).catch(() => null))
}

export const articleCard = (slug) => cards.get(slug) ?? null

export const getArticle = async (slug) => {
  const early = loading.get(slug)
  loading.delete(slug)
  return (await early) ?? fetchArticle(slug)
}

export const getAboutPage = (language) => fetchAboutPage(client, language)
