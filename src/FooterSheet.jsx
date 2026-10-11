// TEMPORARY: a comparison sheet of footer designs (/:lang/footers), each
// lettered, shown at the page's width and in a 390px phone frame. The
// footers answer to their own box (container queries), so the phone frame
// shows the phone layout on any screen. Delete this file, FooterSheet.css
// and the route in Layout.jsx once a letter is chosen.
import { Link, useParams } from 'react-router-dom'
import { i18n } from './i18n'
import Rule from './Rule'
import './FooterSheet.css'

const WORDS = {
  en: {
    line: 'Essays, prose, poetry and portraits, in French and English.',
    submit: 'Submit a piece',
    sections: 'Sections',
    paper: 'The paper',
    rights: '© 2026 The Neighbor',
    desktop: 'Desktop',
    phone: 'Phone',
  },
  fr: {
    line: 'Essais, prose, poésie et portraits, en français et en anglais.',
    submit: 'Proposer un texte',
    sections: 'Rubriques',
    paper: 'Le journal',
    rights: '© 2026 The Neighbor',
    desktop: 'Ordinateur',
    phone: 'Téléphone',
  },
}

function useFooterData() {
  const { lang } = useParams()
  const t = i18n[lang] ?? i18n.en
  const w = WORDS[lang] ?? WORDS.en
  const rubriques = t.sections.map(({ label, value }) => ({ label, to: `/${lang}/${value}` }))
  const more = [
    { label: t.neighborhood, to: `/${lang}/neighborhood` },
    { label: t.about, to: `/${lang}/about` },
  ]
  return { lang, t, w, rubriques, more, email: t.footer.email }
}

function Links({ items, className = 'fs-caps' }) {
  return items.map(({ label, to }) => (
    <Link key={to} to={to} className={className}>
      {label}
    </Link>
  ))
}

// C: the newspaper's columns. The wordmark and what the paper is, the
// sections, and the paper's own pages. (No letter: it comes with being a
// neighbour, signed up in The Neighborhood.) The links are in EB Garamond.
// `line` is the class of the line under the wordmark: each letter on the
// sheet sets it another way (none, for no line).
function FooterC({ line }) {
  const { w, rubriques, more, email } = useFooterData()
  return (
    <footer className="fs-c">
      <Rule />
      <div className="fs-c-grid">
        <div className="fs-c-intro">
          <div className="fs-wordmark fs-left">The Neighbor</div>
          {line ? <p className={line}>{w.line}</p> : null}
        </div>
        <div className="fs-c-col">
          <div className="fs-caps fs-red">{w.sections}</div>
          <Links items={rubriques} className="fs-link-garamond" />
        </div>
        <div className="fs-c-col">
          <div className="fs-caps fs-red">{w.paper}</div>
          <Links items={more} className="fs-link-garamond" />
          <a className="fs-link-garamond" href={`mailto:${email}`}>{w.submit}</a>
        </div>
      </div>
      <Rule />
      <div className="fs-c-foot">
        <span className="fs-caps fs-faint">{w.rights}</span>
      </div>
    </footer>
  )
}

// The line under the wordmark, set five ways (the italic was turned down):
// Garamond upright; the categories' red capitals; the same capitals in
// faint ink; Garamond smaller and faint; no line at all.
const OPTIONS = [
  ['A', 'fs-line-roman'],
  ['B', 'fs-line-red-caps'],
  ['C', 'fs-line-caps'],
  ['D', 'fs-line-small'],
  ['E', null],
]

export default function FooterSheet() {
  const { lang } = useParams()
  const w = WORDS[lang] ?? WORDS.en
  return (
    <main className="main fs">
      {OPTIONS.map(([letter, line]) => (
        <section key={letter} className="fs-option">
          <div className="fs-letter">{letter}</div>
          <div className="fs-label">{w.desktop}</div>
          <div className="fs-frame fs-frame--wide">
            <div className="fs-filler" />
            <FooterC line={line} />
          </div>
          <div className="fs-label">{w.phone}</div>
          <div className="fs-frame fs-frame--phone">
            <div className="fs-filler" />
            <FooterC line={line} />
          </div>
        </section>
      ))}
    </main>
  )
}
