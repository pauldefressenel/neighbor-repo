// Article dates, as the website and the app print them: "9 mai 2026" /
// "May 9, 2026". Spelled out by hand rather than through Intl, whose French
// data isn't guaranteed in the app's JavaScript engine. Dates are stored at
// UTC midnight, so they are read in UTC, or a westward timezone would print
// the previous day.

export const MONTHS = {
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
}

export const longDate = (iso, lang) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const day = d.getUTCDate()
  const month = (MONTHS[lang] ?? MONTHS.en)[d.getUTCMonth()]
  const year = d.getUTCFullYear()
  return lang === 'fr' ? `${day} ${month} ${year}` : `${month} ${day}, ${year}`
}

// The same, the month cut short: "18 nov. 2026" / "Nov. 18, 2026" (the
// website's article heading). Months of four letters or fewer stay whole.
export const SHORT_MONTHS = {
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  en: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'],
}

export const shortDate = (iso, lang) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const day = d.getUTCDate()
  const month = (SHORT_MONTHS[lang] ?? SHORT_MONTHS.en)[d.getUTCMonth()]
  const year = d.getUTCFullYear()
  return lang === 'fr' ? `${day} ${month} ${year}` : `${month} ${day}, ${year}`
}
