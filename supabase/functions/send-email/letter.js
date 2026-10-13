// The letter that carries the sign-in code, laid out like an article of the
// app: the wordmark, the red category, the date, the title, then the text
// with a drop cap and the code inside it, in red. Used by index.ts (the Send
// Email Hook) and by preview.mjs. Plain JavaScript with no imports, so Node
// can load it as it is for the preview.
//
// E-mail apps that load web fonts (Apple Mail, iOS) show NeighborFont, EB
// Garamond and Averia Libre; Gmail falls back to Georgia.

const FONT = 'https://www.theneighborr.com/NeighborFont-Regular.otf'

const NEIGHBOR = "font-family:NeighborFont,Georgia,'Times New Roman',serif"
const SERIF = "font-family:'EB Garamond',Georgia,'Times New Roman',serif"
const AVERIA = "font-family:'Averia Libre',Georgia,serif;text-transform:uppercase;letter-spacing:-0.05em"

// `signup`: a new address. `back`: a known one signing in. `code`: any other
// e-mail that carries a code (changing the address, and so on), which the
// app doesn't use yet but Supabase could send.
const WORDS = {
  fr: {
    subject: 'Code · The Neighbor',
    category: 'Courrier des voisins',
    title: 'Cher voisin',
    sign: 'Bien à vous,<br>L’équipe The Neighbor',
    end: 'Il reste valable une heure. Si vous n’avez rien demandé, ne faites rien&nbsp;: personne n’entrera à votre place.',
    signup: ['V', 'oici le code&nbsp;: {code}.<br>Recopiez-le dans l’app, et vous voilà des nôtres.'],
    back: ['V', 'ous revoilà&nbsp;! Voici le code&nbsp;: {code}.<br>Recopiez-le dans l’app, vos voisins vous ont gardé une place.'],
    code: ['V', 'oici le code&nbsp;: {code}.<br>Recopiez-le dans l’app.'],
  },
  en: {
    subject: 'Code · The Neighbor',
    category: 'Letters to the neighbours',
    title: 'Dear neighbour',
    sign: 'Yours sincerely,<br>The Neighbor team',
    end: 'It is valid for one hour. If you didn’t ask for it, do nothing: no one will come in in your place.',
    signup: ['H', 'ere is the code: {code}.<br>Copy it into the app, and you are one of us.'],
    back: ['W', 'elcome back! Here is the code: {code}.<br>Copy it into the app, your neighbours kept you a seat.'],
    code: ['H', 'ere is the code: {code}.<br>Copy it into the app.'],
  },
}

// The day the letter is sent, in Paris: "11 octobre 2026." or "11 October 2026."
export function dateLine(lang, now = new Date()) {
  const locale = lang === 'en' ? 'en-GB' : 'fr-FR'
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }).format(now) + '.'
}

// The e-mail for one code: its subject, HTML and plain-text versions.
// `kind` is 'signup', 'back' or 'code'; any language but 'en' is French.
export function letter({ kind, lang, code, now }) {
  const w = WORDS[lang === 'en' ? 'en' : 'fr']
  const [cap, text] = w[kind] ?? w.code
  const date = dateLine(lang, now)
  const codeHtml = `<span style="${NEIGHBOR};font-size:30px;letter-spacing:0.1em;color:#FF1919;white-space:nowrap">${code}</span>`
  const capHtml = `<span style="float:left;${NEIGHBOR};font-size:64px;line-height:52px;color:#000000;padding:6px 8px 0 0">${cap}</span>`

  const html = `<!doctype html>
<html lang="${lang === 'en' ? 'en' : 'fr'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Averia+Libre&amp;family=EB+Garamond:ital@0;1&amp;display=swap" rel="stylesheet">
<style>
@font-face { font-family: NeighborFont; src: url('${FONT}') format('opentype'); }
</style>
</head>
<body style="margin:0;padding:0;background:#FFFFF2">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFF2">
  <tr><td align="center" style="padding:28px 20px 44px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px">
      <tr><td align="center" style="${NEIGHBOR};font-size:30px;line-height:34px;color:#000000">The Neighbor</td></tr>
      <tr><td style="padding:48px 0 0;${AVERIA};font-size:18px;line-height:20px;color:#FF1919">${w.category}</td></tr>
      <tr><td style="padding:4px 0 0;${SERIF};font-size:21px;line-height:24px;color:#000000">${date}</td></tr>
      <tr><td style="padding:2px 0 40px;${NEIGHBOR};font-size:42px;line-height:46px;letter-spacing:-0.03em;color:#000000">${w.title}</td></tr>
      <tr><td style="${SERIF};font-size:21px;line-height:31px;color:#000000">${capHtml}${text.replace('{code}', codeHtml)} ${w.end}</td></tr>
      <tr><td style="padding:20px 0 0;${SERIF};font-size:21px;line-height:31px;color:#000000">${w.sign}</td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>
`

  // The same words without the markup, for apps that show text only.
  const plain = (s) => s.replace(/<br>/g, '\n').replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '')
  const textVersion = `The Neighbor\n\n${plain(w.category).toUpperCase()}\n${date}\n\n${w.title}\n\n${cap}${plain(text.replace('{code}', code))} ${plain(w.end)}\n\n${plain(w.sign)}\n`

  return { subject: w.subject, html, text: textVersion }
}
