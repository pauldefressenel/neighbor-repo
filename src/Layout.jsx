import { useState } from 'react'
import { NavLink, Link, Navigate, Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom'
import { i18n } from './i18n'
import { ABOUT_OPEN, LEGACY_SECTIONS, NEIGHBORHOOD_OPEN } from './sections'
import './Layout.css'
import SectionPage from './SectionPage'
import ArticlePage from './ArticlePage'
import LatestPage from './LatestPage'
import AboutPage from './AboutPage'
import VoisinagePage from './VoisinagePage'
import Footer from './Footer'
import Rule from './Rule'
import RubriqueSwitch from './RubriqueSwitch'

// A La Une / Latest, first in the nav: the home page.
const latest = (t) => ({ label: t.latest, value: '', home: true })

// The nav: A La Une, the three rubriques, then The Neighborhood and About
// once they open.
function navSections(t) {
  return [
    latest(t),
    ...t.sections,
    ...(NEIGHBORHOOD_OPEN ? [{ label: t.neighborhood, value: 'neighborhood' }] : []),
    ...(ABOUT_OPEN ? [{ label: t.about, value: 'about' }] : []),
  ]
}

// The wide header's links, split either side of the wordmark: the rubriques
// to the left, the rest to the right.
function HeaderLinks({ items, lang, className }) {
  return (
    <nav className={className}>
      {items.map(({ label, value, home }) => (
        <NavLink
          key={label}
          to={home ? `/${lang}` : `/${lang}/${value}`}
          end={home}
          className={({ isActive }) => `section-link${isActive ? ' section-link--active' : ''}`}
        >
          {label}
        </NavLink>
      ))}
    </nav>
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
  const [langOpen, setLangOpen] = useState(false)
  const t = i18n[lang] ?? i18n.en

  const other = i18n[t.switchTo]
  const { pathname } = useLocation()
  // Latest and the three rubriques: the pages under the phone's Rubriques
  // switch.
  const listPage = [`/${lang}`, `/${lang}/essays-criticism`, `/${lang}/prose-poetry`, `/${lang}/portraits`].includes(pathname.replace(/\/$/, ''))
  // The other language opens on the same page (the URLs are the same in
  // both but for the language), except an article, which opens its
  // rubrique: the translation has another slug, if there is one. As in the
  // app (mobile/src/Masthead.js). It opened the home page at first.
  const switchLanguage = () => {
    setLangOpen(false)
    // Remembered for a year: the bare address (middleware.js, App.jsx) opens
    // in this language rather than the one picked by location.
    document.cookie = `lang=${t.switchTo}; path=/; max-age=31536000; samesite=lax`
    // /:lang/:page or /:lang/:rubrique/:slug: only the first is kept.
    const page = pathname.split('/').filter(Boolean)[1]
    navigate(page ? `/${t.switchTo}/${page}` : `/${t.switchTo}`)
  }

  return (
    <div className="page">
      <header className="header">
        <div className="header-top">
          <HeaderLinks items={[latest(t), ...t.sections]} lang={lang} className="header-links header-links--left" />
          <Link to={`/${lang}`} className="site-title">
            The Neighbor
          </Link>
          <div className="header-meta">
            <HeaderLinks items={navSections(t).slice(t.sections.length + 1)} lang={lang} className="header-links" />
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
            {/* Phones: the app's switch (mobile/src/Masthead.js), both
                languages with the other one faint; a tap anywhere on the pair
                switches. */}
            <button type="button" className="lang-switch" aria-label={other.language} onClick={switchLanguage}>
              <span className={lang === 'en' ? 'lang-switch-faint' : undefined}>FR</span>
              <span className={lang !== 'en' ? 'lang-switch-faint' : undefined}>EN</span>
            </button>
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
        {/* 750–1399: the hand-drawn line under the wordmark's row, and
            another under the nav, edge to edge. */}
        <Rule className="header-rule-mid" />
        <nav className="sections-nav">
          {navSections(t).map(({ label, value, home }) =>
            value || home ? (
              <NavLink
                key={label}
                to={home ? `/${lang}` : `/${lang}/${value}`}
                end={home}
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
        <Rule className="header-rule-mid" />
        {/* Wide screens: the hand-drawn line under the one-row header. */}
        <Rule className="header-rule" />
        {/* Phones: the app's masthead line, edge to edge. */}
        <Rule className="header-rule-phone" drawn />
        {/* Phones: the app's Rubriques switch, over the three lists. */}
        {listPage && <RubriqueSwitch lang={lang} t={t} />}
      </header>


      <Routes>
        <Route index element={<LatestPage key={useLocation().pathname} />} />
        <Route path="about" element={ABOUT_OPEN ? <AboutPage /> : <Navigate to={`/${lang}`} replace />} />
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
