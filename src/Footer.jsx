import { Link } from 'react-router-dom'
import { i18n } from './i18n'
import { NEIGHBORHOOD_OPEN } from './sections'
import Rule from './Rule'
import './Footer.css'

// The newspaper's columns under a drawn line: the wordmark with the year
// in grey under it, the sections, and the paper's own pages. Chosen on a
// comparison sheet (C). A line saying what the paper is stood under the
// wordmark, and a second drawn line under the columns; both were taken
// out. There is no newsletter field: the letter comes with being a
// neighbour, signed up in The Neighborhood. Nor a language switch: the
// header has it.
export default function Footer({ lang }) {
  const t = i18n[lang] ?? i18n.en
  const pages = [
    ...(NEIGHBORHOOD_OPEN ? [{ label: t.neighborhood, value: 'neighborhood' }] : []),
    { label: t.about, value: 'about' },
  ]
  return (
    <footer className="site-footer">
      <Rule />
      <div className="footer-grid">
        <div className="footer-intro">
          <Link to={`/${lang}`} className="footer-wordmark">
            The Neighbor
          </Link>
          <p className="footer-rights">© {new Date().getFullYear()} The Neighbor</p>
        </div>
        <FooterColumn heading={t.footer.sections} lang={lang} items={t.sections} />
        <FooterColumn heading={t.footer.paper} lang={lang} items={pages}>
          <a href={`mailto:${t.footer.email}`}>{t.footer.submit}</a>
        </FooterColumn>
      </div>
    </footer>
  )
}

function FooterColumn({ heading, lang, items, children }) {
  return (
    <nav className="footer-column">
      <div className="footer-heading">{heading}</div>
      {items.map(({ label, value }) => (
        <Link key={value} to={`/${lang}/${value}`}>
          {label}
        </Link>
      ))}
      {children}
    </nav>
  )
}
