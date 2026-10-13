import { i18n as shared } from '../../shared/i18n'

// The strings shared with the website (shared/i18n.js), plus the app's own.
// `tabs` are the tab bar's labels, keyed by route name (app/[lang]/_layout.js).
export const i18n = {
  en: {
    ...shared.en,
    error: 'Could not load articles.',
    pageError: 'Could not load the page.',
    retry: 'Try again',
    tabs: { '(couverture)': 'Articles', voisinage: 'Neighborhood', 'a-propos': 'About' },
    neighborhood: 'The Neighborhood',
    signUp: 'Sign up',
    // The back arrow, for VoiceOver.
    back: 'Back',
  },
  fr: {
    ...shared.fr,
    error: 'Impossible de charger les articles.',
    pageError: 'Impossible de charger la page.',
    retry: 'Réessayer',
    tabs: { '(couverture)': 'Articles', voisinage: 'Voisinage', 'a-propos': 'A Propos' },
    neighborhood: 'Voisinage',
    signUp: 'S’inscrire',
    back: 'Retour',
  },
}
