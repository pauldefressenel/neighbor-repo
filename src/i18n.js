import { i18n as shared } from '../shared/i18n.js'
import { RUBRIQUES } from '../shared/sections.js'

// The strings shared with the app (shared/i18n.js), plus the site's own.
// `sections` is the nav: the three rubriques (shared/sections.js). The
// Neighborhood is drawn by the site rather than sourced from Sanity, and joins
// the nav only once NEIGHBORHOOD_OPEN (sections.js) is true.
const nav = (lang) => RUBRIQUES.map((r) => ({ label: r.label[lang], value: r.slug.en }))

export const i18n = {
  en: {
    ...shared.en,
    sections: nav('en'),
    neighborhood: 'The Neighborhood',
    about: 'About',
    // The phone menu drops the article: "Neighborhood", not "The Neighborhood".
    menuNeighborhood: 'Neighborhood',
    footer: {
      submit: 'Submit a piece:',
      email: 'paul@theneighborr.com',
    },
  },
  fr: {
    ...shared.fr,
    sections: nav('fr'),
    neighborhood: 'Le Voisinage',
    about: 'A Propos',
    menuNeighborhood: 'Voisinage',
    footer: {
      submit: 'Propose un texte :',
      email: 'paul@theneighborr.com',
    },
  },
}
