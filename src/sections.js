import { RUBRIQUES as SHARED } from '../shared/sections.js'

// The site's three rubriques, from the list the app and the Studio share
// (shared/sections.js). `value` is the URL segment, English in both
// languages; labels are in i18n.js.
export const RUBRIQUES = SHARED.map((r) => ({ value: r.slug.en, sanity: r.sanity }))

export const findRubrique = (value) => RUBRIQUES.find((r) => r.value === value)

// The rubrique an article is listed under, from its Sanity `section`.
export const rubriqueOf = (section) =>
  RUBRIQUES.find((r) => r.sanity.includes(section))?.value ?? section

// The Neighborhood (the app's Voisinage: a sign-up mock-up) and About. While
// these are false they are left out of the nav, the footer and the sitemap,
// and their URLs go to the homepage. Both are closed for now (2026-10-13).
export const NEIGHBORHOOD_OPEN = false
export const ABOUT_OPEN = false

// The website's old section URLs, before the rubriques. vercel.json redirects
// them in production; Layout does the same in development.
export const LEGACY_SECTIONS = {
  'fiction-poetry': 'prose-poetry',
  'literature-review': 'essays-critiques',
  'the-arts': 'essays-critiques',
  // Essays & Critiques was Essays & Criticism until 2026-10-13.
  'essays-criticism': 'essays-critiques',
}
