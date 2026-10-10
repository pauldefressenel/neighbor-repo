// The site's three rubriques, as in the app (mobile/src/sections.js) and the
// Studio sidebar (studio/structure.js); keep the three in step. Sanity still
// has four `section` values, so Essays & Criticism gathers the literature
// reviews and the arts. `value` is the URL segment; labels are in i18n.js.
export const RUBRIQUES = [
  { value: 'essays-criticism', sanity: ['literature-review', 'the-arts'] },
  { value: 'prose-poetry', sanity: ['fiction-poetry'] },
  { value: 'portraits', sanity: ['portraits'] },
]

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
