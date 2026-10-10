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
    // An article card's byline: "by <author>".
    by: 'by',
    // Under the Portraits title, on wider screens (beside the arrows).
    portraitsSubtitle: 'Explore the portraits with the arrows',
    // A Propos is set like an article; its heading is fixed, as in the app.
    aboutHeading: {
      category: 'About',
      byline: 'The editors, October 5, 2026.',
      title: 'The Neighbor Manifesto.',
    },
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
    latest: 'En Couverture',
    switchTo: 'en',
    by: 'de',
    portraitsSubtitle: 'Découvrez les portraits avec les flèches',
    aboutHeading: {
      category: 'A propos',
      byline: "L'équipe de rédaction, 5 octobre 2026.",
      title: 'Manifeste Neighbor.',
    },
    menuNeighborhood: 'Voisinage',
    footer: {
      submit: 'Propose un texte :',
      email: 'paul@theneighborr.com',
    },
  },
}
