// `sections` is the nav: the three rubriques (sections.js). The Neighborhood
// is drawn by the site rather than sourced from Sanity, and joins the nav
// only once NEIGHBORHOOD_OPEN (sections.js) is true.
export const i18n = {
  en: {
    sections: [
      { label: 'Essays & Criticism', value: 'essays-criticism' },
      { label: 'Prose & Poetry', value: 'prose-poetry' },
      { label: 'Portraits', value: 'portraits' },
    ],
    neighborhood: 'The Neighborhood',
    about: 'About',
    language: 'English',
    latest: 'Latest',
    switchTo: 'fr',
    // The phone menu drops the article: "Neighborhood", not "The Neighborhood".
    menuNeighborhood: 'Neighborhood',
    footer: {
      submit: 'Submit a piece:',
      email: 'paul@theneighborr.com',
    },
  },
  fr: {
    sections: [
      { label: 'Essais & Critiques', value: 'essays-criticism' },
      { label: 'Prose & Poésie', value: 'prose-poetry' },
      { label: 'Portraits', value: 'portraits' },
    ],
    neighborhood: 'Le Voisinage',
    about: 'A Propos',
    language: 'Français',
    latest: 'Récents',
    switchTo: 'en',
    menuNeighborhood: 'Voisinage',
    footer: {
      submit: 'Propose un texte :',
      email: 'paul@theneighborr.com',
    },
  },
}
