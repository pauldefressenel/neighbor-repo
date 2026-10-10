import { useState } from 'react'
import { NavLink, Link, Navigate, Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom'
import { i18n } from './i18n'
import { LEGACY_SECTIONS, NEIGHBORHOOD_OPEN } from './sections'
import './Layout.css'
import SectionPage from './SectionPage'
import ArticlePage from './ArticlePage'
import LatestPage from './LatestPage'
import AboutPage from './AboutPage'
import VoisinagePage from './VoisinagePage'
import Footer from './Footer'
import Rule from './Rule'

// The nav: the three rubriques, The Neighborhood once it opens, then About.
function navSections(t) {
  return [
    ...t.sections,
    ...(NEIGHBORHOOD_OPEN ? [{ label: t.neighborhood, value: 'neighborhood' }] : []),
    { label: t.about, value: 'about' },
  ]
}

// The wide header's links, split either side of the wordmark: the rubriques
// to the left, the rest to the right.
function HeaderLinks({ items, lang, className }) {
  return (
    <nav className={className}>
      {items.map(({ label, value }) => (
        <NavLink
          key={value}
          to={`/${lang}/${value}`}
          className={({ isActive }) => `section-link${isActive ? ' section-link--active' : ''}`}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

// The phone menu lists the same links; The Neighborhood, once it opens, is
// set apart from the rubriques by a gap and drops its article.
function menuItems(t, lang) {
  return navSections(t).map(({ label, value }) =>
    value === 'neighborhood'
      ? { label: t.menuNeighborhood, to: `/${lang}/${value}`, groupStart: true }
      : { label, to: `/${lang}/${value}` }
  )
}

// An old section URL (/en/the-arts/…) sends the reader to its rubrique,
// keeping the article slug if there is one.
function LegacySection({ to }) {
  const { lang, '*': rest } = useParams()
  return <Navigate to={`/${lang}/${to}${rest ? `/${rest}` : ''}`} replace />
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
    // Remembered for a year: the bare address (middleware.js, App.jsx) opens
    // in this language rather than the one picked by location.
    document.cookie = `lang=${t.switchTo}; path=/; max-age=31536000; samesite=lax`
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
          <HeaderLinks items={t.sections} lang={lang} className="header-links header-links--left" />
          <Link to={`/${lang}`} className="site-title" onClick={() => setMenuOpen(false)}>
            The Neighbor
          </Link>
          <div className="header-meta">
            <HeaderLinks items={navSections(t).slice(t.sections.length)} lang={lang} className="header-links" />
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
            {/* Wide screens: both languages, the current one in red; one click
                switches (chosen over the menu above, which they hide). */}
            <span className="lang-pair">
              {['fr', 'en'].map((code, i) => (
                <span key={code} className="lang-pair-item">
                  {i > 0 && <span className="lang-pair-sep" aria-hidden="true">/</span>}
                  <button
                    type="button"
                    className={`lang-pair-option${code === lang ? ' lang-pair-option--current' : ''}`}
                    aria-current={code === lang ? 'true' : undefined}
                    aria-label={i18n[code].language}
                    onClick={code === lang ? undefined : switchLanguage}
                  >
                    {code.toUpperCase()}
                  </button>
                </span>
              ))}
            </span>
          </div>
        </div>
        <nav className="sections-nav">
          {navSections(t).map(({ label, value }) =>
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
        {/* Wide screens: the hand-drawn line under the one-row header. */}
        <Rule className="header-rule" />
      </header>

      {/* Phone-only: the sections nav collapses behind the header toggle. */}
      <div
        className={`menu-overlay${menuOpen ? ' menu-overlay--open' : ''}`}
        hidden={!menuOpen}
      >
        <nav className="menu-overlay-nav">
          {menuItems(t, lang).map(({ label, to, groupStart }, i) => (
            <NavLink
              key={label}
              to={to}
              className={`menu-overlay-link${groupStart ? ' menu-overlay-link--group-start' : ''}`}
              style={{ animationDelay: `${0.06 + i * 0.035}s` }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <Routes>
        <Route index element={<LatestPage key={useLocation().pathname} />} />
        <Route path="about" element={<AboutPage />} />
        <Route
          path="neighborhood"
          element={NEIGHBORHOOD_OPEN ? <VoisinagePage /> : <Navigate to={`/${lang}`} replace />}
        />
        {Object.entries(LEGACY_SECTIONS).map(([from, to]) => (
          <Route key={from} path={`${from}/*`} element={<LegacySection to={to} />} />
        ))}
        <Route path=":section/:slug" element={<ArticlePage />} />
        <Route path=":section" element={<SectionPage key={useLocation().pathname} />} />
      </Routes>
      <Footer lang={lang} />
    </div>
  )
}
