import { RUBRIQUES as SHARED } from '../shared/sections.js'

// The site's three rubriques, from the list the app and the Studio share
// (shared/sections.js). `value` is the URL segment, English in both
// languages; labels are in i18n.js.
export const RUBRIQUES = SHARED.map((r) => ({ value: r.slug.en, sanity: r.sanity }))

export const findRubrique = (value) => RUBRIQUES.find((r) => r.value === value)

// The rubrique an article is listed under, from its Sanity `section`.
export const rubriqueOf = (section) =>
  RUBRIQUES.find((r) => r.sanity.includes(section))?.value ?? section

// The Neighborhood (the app's Voisinage: a sign-up mock-up). While this is
// false it is left out of the nav, the phone menu and the sitemap, and its URL
// goes to the homepage.
export const NEIGHBORHOOD_OPEN = true

// The website's old section URLs, before the rubriques. vercel.json redirects
// them in production; Layout does the same in development.
export const LEGACY_SECTIONS = {
  'fiction-poetry': 'prose-poetry',
  'literature-review': 'essays-criticism',
  'the-arts': 'essays-criticism',
}
