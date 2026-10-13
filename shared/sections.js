// The one list of rubriques, read by the website (src/sections.js), the app
// (mobile/src/sections.js) and the Studio (studio/structure.js,
// studio/schemas/article.js). An article's Sanity `section` names its
// rubrique: the first value of the rubrique's `sanity`. Essays & Criticism
// also lists `the-arts`, an old section merged into `literature-review`
// (import/merge-sections.mjs), so an article still holding it is found
// wherever it is looked for.
//
// The website uses `slug.en` in both languages; the app uses `slug.fr`. The
// order here is the order of the nav and of the app's Rubriques list.

// `subtitle` is the small line under each name in the app's Rubriques list.
// It is set in capitals, so it has no accents.
//
// `categories`, where a rubrique has them, are the only categories its
// articles may take (the red word above a card's title), per language: the
// Studio offers them as a list (studio/categoryInput.jsx). They are stored
// in capitals, as written here. Elsewhere the category is free (a short
// story's form, a portrait's trade).
export const RUBRIQUES = [
  {
    slug: { en: 'essays-criticism', fr: 'essais-critiques' },
    label: { en: 'Essays & Criticism', fr: 'Essais & Critiques' },
    subtitle: { en: 'Books, Film, Music, Crossroads', fr: 'Livres, Cinema, Musique, Arts Croises' },
    sanity: ['literature-review', 'the-arts'],
    // What the piece is about, chosen after reading them all (2026-10-13);
    // they replaced labels mixing subject and form (CRITIQUE, ESSAI COURT,
    // CHRONIQUES, MUSIQUE…).
    categories: [
      { fr: 'LIVRES', en: 'BOOKS' },
      { fr: 'CINÉMA', en: 'FILM' },
      { fr: 'MUSIQUE', en: 'MUSIC' },
      { fr: 'ARTS CROISÉS', en: 'CROSSROADS' },
    ],
  },
  {
    slug: { en: 'prose-poetry', fr: 'prose-poesie' },
    label: { en: 'Prose & Poetry', fr: 'Prose & Poésie' },
    subtitle: { en: 'Short Stories, Prose, Poems', fr: 'Nouvelles, Récits, Poèmes' },
    sanity: ['fiction-poetry'],
  },
  {
    slug: { en: 'portraits', fr: 'portraits' },
    label: { en: 'Portraits', fr: 'Portraits' },
    subtitle: { en: 'Artists, Friends', fr: 'Artistes, Amis' },
    sanity: ['portraits'],
  },
]
