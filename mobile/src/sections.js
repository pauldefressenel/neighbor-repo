// The app's three rubriques. Sanity still has the website's four sections,
// so Essais & Critiques gathers both the literature reviews and the arts.
// The order here is the order of the Rubriques list; `subtitle` is the red
// line under each name there.
export const SECTIONS = [
  { slug: 'essais-critiques', label: 'Essais & Critiques', subtitle: 'Littérature, cinéma, peinture', sanity: ['literature-review', 'the-arts'] },
  { slug: 'prose-poesie', label: 'Prose & Poésie', subtitle: 'Récits courts, poèmes', sanity: ['fiction-poetry'] },
  { slug: 'portraits', label: 'Portraits', subtitle: 'Écrivains, musiciens, savants', sanity: ['portraits'] },
]

export const findSection = (slug) => SECTIONS.find((s) => s.slug === slug)
