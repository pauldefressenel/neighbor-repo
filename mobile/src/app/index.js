import { Redirect } from 'expo-router'
import { getLocales } from 'expo-localization'

// Countries where French is the main language: the website's list
// (middleware.js, which goes by where a reader connects from). Change both
// together.
const FRENCH_COUNTRIES = new Set([
  'FR', 'MC', 'LU',
  // Overseas France with their own country codes.
  'GP', 'MQ', 'GF', 'RE', 'YT', 'PM', 'BL', 'MF', 'NC', 'PF', 'WF',
  // French-speaking Africa, the Caribbean and the Indian Ocean.
  'SN', 'CI', 'ML', 'BF', 'NE', 'TG', 'BJ', 'GN', 'CM', 'GA', 'CG', 'CD',
  'CF', 'TD', 'MG', 'DJ', 'KM', 'HT',
  // The Maghreb, where French is widely read.
  'MA', 'DZ', 'TN',
])

// The app opens in French for a phone set to French, or set to a
// French-speaking country, and in English otherwise. It reads the phone's
// Language & Region settings rather than its location, which would ask for
// permission. The phone gives no province or canton, so in Belgium,
// Switzerland and Canada the phone's language decides, where the website
// goes by region.
function startingLanguage() {
  const [locale] = getLocales()
  if (locale?.languageCode === 'fr') return 'fr'
  if (FRENCH_COUNTRIES.has(locale?.regionCode)) return 'fr'
  return 'en'
}

export default function Index() {
  return <Redirect href={`/${startingLanguage()}`} />
}
