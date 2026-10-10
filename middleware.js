// Vercel Routing Middleware: picks the language for the bare address (`/`)
// from where the visitor connects, before the site loads. French-speaking
// places go to /fr, everywhere else to /en. Only `/` is affected, so shared
// and indexed links (/en/…, /fr/…) are never redirected.
//
// A reader who has chosen a language with the header's FR / EN switch keeps
// it: the switch stores it in the `lang` cookie, which wins over location.
//
// It doesn't run under `npm run dev`: there, and if Vercel can't tell the
// location, App.jsx's own redirect for `/` applies (the cookie, else /en).

export const config = { matcher: '/' }

// Countries where French is the main language.
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

// Bilingual countries: only their French-speaking regions (ISO 3166-2).
const FRENCH_REGIONS = {
  BE: new Set(['BRU', 'WAL']), // Brussels, Wallonia
  CH: new Set(['GE', 'VD', 'NE', 'JU', 'VS', 'FR']), // Romandy
  CA: new Set(['QC', 'NB']), // Quebec, New Brunswick
}

export default function middleware(request) {
  const url = new URL(request.url)
  // The Studio may be built from this repository's root too (see
  // scripts/vercel-build.mjs); its address must not be redirected.
  if (/studio|cms/i.test(url.hostname)) return

  const chosen = request.headers.get('cookie')?.match(/(?:^|;\s*)lang=(en|fr)\b/)?.[1]
  const country = request.headers.get('x-vercel-ip-country')
  const region = request.headers.get('x-vercel-ip-country-region')
  const french = FRENCH_COUNTRIES.has(country) || FRENCH_REGIONS[country]?.has(region)
  const lang = chosen ?? (french ? 'fr' : 'en')

  // Temporary (307), so browsers and search engines don't cache one answer
  // for everyone.
  return Response.redirect(new URL(`/${lang}`, url), 307)
}
