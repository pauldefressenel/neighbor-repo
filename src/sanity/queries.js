import { client } from './client'
import { fetchAboutPage, fetchArticle, fetchLatestArticles, fetchSectionArticles } from '../../shared/sanity.js'

// The queries are shared with the app (shared/sanity.js).

// Every article in one rubrique: `sections` is its Sanity sections (sections.js).
export const getArticlesBySection = (language, sections) => fetchSectionArticles(client, language, sections)

export const getLatestArticles = (language) => fetchLatestArticles(client, language)

export const getArticleBySlug = (slug) => fetchArticle(client, slug)

export const getAboutPage = (language) => fetchAboutPage(client, language)
