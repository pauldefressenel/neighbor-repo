// The app's three rubriques, as on the site (src/sections.js) and in the
// Studio. Sanity still has four sections, so Essais & Critiques gathers both
// the literature reviews and the arts.
// The order here is the order of the Rubriques list; `subtitle` is the small
// line under each name there. It is set in capitals, so it has no accents.
export const SECTIONS = [
  { slug: 'essais-critiques', label: 'Essais & Critiques', subtitle: 'Livres, Cinema, Arts Croises', sanity: ['literature-review', 'the-arts'] },
  { slug: 'prose-poesie', label: 'Prose & Poésie', subtitle: 'Courtes Nouvelles, Poemes', sanity: ['fiction-poetry'] },
  { slug: 'portraits', label: 'Portraits', subtitle: 'Artistes, Amis', sanity: ['portraits'] },
]

export const findSection = (slug) => SECTIONS.find((s) => s.slug === slug)
