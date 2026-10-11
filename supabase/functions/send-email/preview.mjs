// Writes preview.html beside this file: the letters as they arrive (a new
// address and a known one, in French and English), with a code and today's
// date filled in, to look at in a browser before deploying.
//   node supabase/functions/send-email/preview.mjs
import { writeFileSync } from 'node:fs'
import { letter } from './letter.js'

const cases = [
  ['signup', 'fr', 'Inscription · français'],
  ['signup', 'en', 'Sign-up · English'],
  ['back', 'fr', 'Connexion · français'],
  ['back', 'en', 'Sign-in · English'],
]

const escape = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
const frames = cases
  .map(([kind, lang, label]) => {
    const { subject, html } = letter({ kind, lang, code: '482913' })
    return `<figure><figcaption>${label} — <b>${subject}</b></figcaption><iframe srcdoc="${escape(html)}"></iframe></figure>`
  })
  .join('')

writeFileSync(
  new URL('./preview.html', import.meta.url),
  `<!doctype html><html><head><meta charset="utf-8"><title>Code E-mail Preview</title>
<style>body{margin:0;padding:30px;background:#E7E5DA;font-family:-apple-system,system-ui,sans-serif;display:flex;flex-wrap:wrap;gap:30px;justify-content:center}
figure{margin:0}figcaption{font-size:14px;color:#555;margin:0 0 8px}iframe{width:600px;max-width:90vw;height:620px;border:0;border-radius:12px;background:#fff;box-shadow:0 10px 30px rgba(0,0,0,.12)}</style>
</head><body>${frames}</body></html>`,
)
