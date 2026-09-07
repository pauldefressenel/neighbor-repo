import { useState } from 'react'
import { NavLink, Link, Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom'
import { i18n, DONATE_URL } from './i18n'
import './Layout.css'
import NeighborhoodPage from './NeighborhoodPage'
import SectionPage from './SectionPage'
import ArticlePage from './ArticlePage'
import LatestPage from './LatestPage'
import AboutPage from './AboutPage'
import Footer from './Footer'

// The phone menu reorders the nav: the four reading sections, then a gap,
// then Neighborhood, About and Donate.
function menuItems(t, lang) {
  const reading = t.sections.filter((s) => s.value !== 'neighborhood')
  const neighborhood = t.sections.find((s) => s.value === 'neighborhood')
  return [
    ...reading.map((s) => ({ label: s.label, to: `/${lang}/${s.value}` })),
    {
      label: t.menuNeighborhood ?? neighborhood?.label,
      to: `/${lang}/neighborhood`,
      groupStart: true,
    },
    { label: t.about, to: `/${lang}/about` },
    { label: t.donate, href: DONATE_URL },
  ]
}

export default function Layout() {
  const { lang } = useParams()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const t = i18n[lang] ?? i18n.en

  const other = i18n[t.switchTo]
  const { pathname } = useLocation()
  // Keep the reader where they are, in the other language. Article slugs are
  // language-specific, so from an article we go to its section's listing.
  const switchLanguage = () => {
    setMenuOpen(false)
    setLangOpen(false)
    const [, , page] = pathname.split('/')
    navigate(`/${t.switchTo}${page ? `/${page}` : ''}`)
  }

  return (
    <div className="page">
      <header className="header">
        <div className="header-top">
          <button
            type="button"
            className="nav-toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={`nav-toggle-icon${menuOpen ? ' nav-toggle-icon--open' : ''}`} />
          </button>
          <Link to={`/${lang}`} className="site-title" onClick={() => setMenuOpen(false)}>
            The Neighbor
          </Link>
          <nav className="header-meta">
            <NavLink to={`/${lang}/about`}>{t.about}</NavLink>
            {/* Framer: the selector opens a row with the other language rather than switching outright. */}
            <span className="lang-menu">
              <button
                type="button"
                className="lang-selector"
                aria-haspopup="menu"
                aria-expanded={langOpen}
                onClick={() => setLangOpen((open) => !open)}
              >
                {t.language} ▾
              </button>
              <button
                type="button"
                className={`lang-option${langOpen ? ' lang-option--open' : ''}`}
                tabIndex={langOpen ? 0 : -1}
                onClick={switchLanguage}
              >
                {other.language}
              </button>
            </span>
            <a href={DONATE_URL} target="_blank" rel="noopener noreferrer">{t.donate}</a>
          </nav>
        </div>
        <nav className="sections-nav">
          {t.sections.map(({ label, value }) =>
            value ? (
              <NavLink
                key={label}
                to={`/${lang}/${value}`}
                className={({ isActive }) =>
                  `section-link${isActive ? ' section-link--active' : ''}`
                }
              >
                {label}
              </NavLink>
            ) : (
              <span key={label} className="section-link section-link--disabled">
                {label}
              </span>
            )
          )}
        </nav>
      </header>

      {/* Phone-only: the sections nav collapses behind the header toggle.
          Framer groups the four reading sections, then a blank line, then
          Neighborhood / About / Donate. */}
      <div
        className={`menu-overlay${menuOpen ? ' menu-overlay--open' : ''}`}
        hidden={!menuOpen}
      >
        <nav className="menu-overlay-nav">
          {menuItems(t, lang).map(({ label, to, href, groupStart }, i) => {
            const className = `menu-overlay-link${groupStart ? ' menu-overlay-link--group-start' : ''}`
            const style = { animationDelay: `${0.06 + i * 0.035}s` }
            return href ? (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
                {label}
              </a>
            ) : (
              <NavLink key={label} to={to} className={className} style={style} onClick={() => setMenuOpen(false)}>
                {label}
              </NavLink>
            )
          })}
        </nav>
      </div>

      <Routes>
        <Route index element={<LatestPage key={useLocation().pathname} />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="neighborhood" element={<NeighborhoodPage key={useLocation().pathname} />} />
        <Route path=":section/:slug" element={<ArticlePage />} />
        <Route path=":section" element={<SectionPage key={useLocation().pathname} />} />
      </Routes>
      <Footer lang={lang} />
    </div>
  )
}
