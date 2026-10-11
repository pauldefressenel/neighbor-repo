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
