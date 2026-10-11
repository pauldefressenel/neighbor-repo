import { i18n as shared } from '../../shared/i18n'

// The strings shared with the website (shared/i18n.js), plus the app's own.
// `tabs` are the tab bar's labels, keyed by route name (app/[lang]/_layout.js).
export const i18n = {
  en: {
    ...shared.en,
    error: 'Could not load articles.',
    pageError: 'Could not load the page.',
    retry: 'Try again',
    tabs: { '(couverture)': 'Latest', rubriques: 'Sections', voisinage: 'Neighborhood', 'a-propos': 'About' },
    rubriques: 'Sections',
    neighborhood: 'The Neighborhood',
    signUp: 'Sign up',
    // The back arrow, for VoiceOver.
    back: 'Back',
    backToRubriques: 'Back to the sections',
  },
  fr: {
    ...shared.fr,
    error: 'Impossible de charger les articles.',
    pageError: 'Impossible de charger la page.',
    retry: 'Réessayer',
    tabs: { '(couverture)': 'A La Une', rubriques: 'Rubriques', voisinage: 'Voisinage', 'a-propos': 'A Propos' },
    rubriques: 'Rubriques',
    neighborhood: 'Voisinage',
    signUp: 'S’inscrire',
    back: 'Retour',
    backToRubriques: 'Retour aux rubriques',
  },
}
