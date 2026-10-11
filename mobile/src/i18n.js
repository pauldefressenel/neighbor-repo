import { i18n as shared } from '../../shared/i18n'

// The strings shared with the website (shared/i18n.js), plus the app's own.
export const i18n = {
  en: { ...shared.en, error: 'Could not load articles.', pageError: 'Could not load the page.', retry: 'Try again' },
  fr: { ...shared.fr, error: 'Impossible de charger les articles.', pageError: 'Impossible de charger la page.', retry: 'Réessayer' },
}
