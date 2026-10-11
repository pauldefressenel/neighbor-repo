// The one list of rubriques, read by the website (src/sections.js), the app
// (mobile/src/sections.js) and the Studio (studio/structure.js,
// studio/schemas/article.js). Sanity has four `section` values; the three
// rubriques group them, Essays & Criticism taking two.
//
// The website uses `slug.en` in both languages; the app uses `slug.fr`. The
// order here is the order of the nav and of the app's Rubriques list.

// Each Sanity section's own name, shown in the Studio.
export const SANITY_SECTIONS = {
  'literature-review': { en: 'Literature Review', fr: 'La Revue Littéraire' },
  'the-arts': { en: 'The Arts', fr: 'Les Arts' },
  'fiction-poetry': { en: 'Fiction & Poetry', fr: 'Fiction & Poésie' },
  portraits: { en: 'Portraits', fr: 'Portraits' },
}

// `subtitle` is the small line under each name in the app's Rubriques list.
// It is set in capitals, so it has no accents.
export const RUBRIQUES = [
  {
    slug: { en: 'essays-criticism', fr: 'essais-critiques' },
    label: { en: 'Essays & Criticism', fr: 'Essais & Critiques' },
    subtitle: { fr: 'Livres, Cinema, Arts Croises' },
    sanity: ['literature-review', 'the-arts'],
  },
  {
    slug: { en: 'prose-poetry', fr: 'prose-poesie' },
    label: { en: 'Prose & Poetry', fr: 'Prose & Poésie' },
    subtitle: { fr: 'Nouvelles, Récits, Poèmes' },
    sanity: ['fiction-poetry'],
  },
  {
    slug: { en: 'portraits', fr: 'portraits' },
    label: { en: 'Portraits', fr: 'Portraits' },
    subtitle: { fr: 'Artistes, Amis' },
    sanity: ['portraits'],
  },
]
