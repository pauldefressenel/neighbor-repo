import { NavLink, Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom'
import { i18n } from './i18n'
import './Layout.css'
import NeighborhoodPage from './NeighborhoodPage'
import SectionPage from './SectionPage'

export default function Layout() {
  const { lang, section } = useParams()
  const navigate = useNavigate()
  const t = i18n[lang] ?? i18n.en

  const switchLanguage = () => {
    navigate(`/${t.switchTo}/${section ?? 'literature-review'}`)
  }

  return (
    <div className="page">
      <header className="header">
        <div className="header-top">
          <div className="header-top-spacer" />
          <h1 className="site-title">The Neighbor</h1>
          <nav className="header-meta">
            <a href="#">{t.about}</a>
            <span className="lang-selector" onClick={switchLanguage}>
              {t.language} ▾
            </span>
            <a href="#">{t.donate}</a>
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

      <Routes>
        <Route path="neighborhood" element={<NeighborhoodPage key={useLocation().pathname} />} />
        <Route path=":section" element={<SectionPage key={useLocation().pathname} />} />
      </Routes>
    </div>
  )
}
