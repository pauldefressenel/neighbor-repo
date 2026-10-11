// The strings the website and the app both print. Each adds its own on top
// (src/i18n.js, mobile/src/i18n.js). The rubriques' names are in sections.js.
export const i18n = {
  en: {
    language: 'English',
    switchTo: 'fr',
    latest: 'Latest',
    // An article card's byline: "by <author>".
    by: 'by',
    // A Propos is set like an article, with a fixed heading.
    aboutHeading: {
      category: 'About',
      byline: 'The editors, October 5, 2026.',
      title: 'The Neighbor Manifesto.',
      readingTime: '4 min.',
    },
  },
  fr: {
    language: 'Français',
    switchTo: 'en',
    latest: 'A La Une',
    by: 'de',
    aboutHeading: {
      category: 'A propos',
      byline: "L'équipe de rédaction, 5 octobre 2026.",
      title: 'Manifeste Neighbor.',
      readingTime: '4 min.',
    },
  },
}
