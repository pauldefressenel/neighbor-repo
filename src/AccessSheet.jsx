// TEMPORARY: a comparison sheet of ways to reach Portraits on a phone, now
// that the Rubriques switch shows only Latest and the two rubriques of texts.
// At /:lang/portraits-access. Each letter draws the top of a phone screen (and
// its foot where the option lives there). Delete this file, AccessSheet.css
// and the route in Layout.jsx once one is chosen.
import { Link, useParams } from 'react-router-dom'
import { i18n } from './i18n'
import MenuIcon from './MenuIcon'
import PortraitAnimation from './PortraitAnimation'
import Rule from './Rule'
import tabIcons from '../mobile/src/tabIcons.js'
import './AccessSheet.css'

function Header() {
  return (
    <>
      <div className="as-header">
        <MenuIcon open={false} />
        <span className="as-wordmark">The Neighbor</span>
        <span className="as-lang">FR <span className="as-faint">EN</span></span>
      </div>
      <Rule className="as-rule" drawn />
    </>
  )
}

function Switch({ names, small, extra }) {
  return (
    <div className="as-switch">
      <div className="as-switch-inner">
        <div className={`as-row${small ? ' as-row--small' : ''}`}>
          {names.map((n, i) => <span key={n} className={i === 0 ? 'as-on' : undefined}>{n}</span>)}
          {extra}
        </div>
        <Rule className="as-switch-rule" drawn />
      </div>
    </div>
  )
}

function Page({ t, children }) {
  return (
    <>
      {children}
      <h2 className="as-title">{t.latest}</h2>
      <p className="as-mark">*</p>
      <p className="as-cat">Critique</p>
      <p className="as-card-title">Kolkhoze</p>
    </>
  )
}

function TabIcon({ name }) {
  const i = tabIcons[name]
  return (
    <svg width={i.width} height={i.height} viewBox={i.viewBox} fill="none" aria-hidden="true">
      <path d={i.d} stroke="currentColor" strokeWidth={i.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function AccessSheet() {
  const { lang } = useParams()
  const t = i18n[lang] ?? i18n.en
  const names = [t.latest, ...t.sections.filter((s) => s.value !== 'portraits').map((s) => s.label)]
  const portraits = t.sections.find((s) => s.value === 'portraits').label
  const tabs = lang === 'en'
    ? [['rubriques', 'Sections'], ['portraits', 'Portraits'], ['voisinage', 'Neighborhood'], ['a-propos', 'About']]
    : [['rubriques', 'Rubriques'], ['portraits', 'Portraits'], ['voisinage', 'Voisinage'], ['a-propos', 'A Propos']]

  const options = {
    // As now: Portraits only in the menu.
    A: (
      <div className="as-phone">
        <Header />
        <Page t={t}><Switch names={names} /></Page>
        <p className="as-note">Portraits: in the menu (≡) only.</p>
      </div>
    ),
    // A fourth name in the row, smaller so the four fit.
    B: (
      <div className="as-phone">
        <Header />
        <Page t={t}><Switch names={[...names, portraits]} small /></Page>
      </div>
    ),
    // Set apart: Portraits under the line, alone, like a way out of the row.
    C: (
      <div className="as-phone">
        <Header />
        <Page t={t}>
          <Switch names={names} />
          <p className="as-under">{portraits} ›</p>
        </Page>
      </div>
    ),
    // The app's tab bar at the foot of the screen.
    D: (
      <div className="as-phone as-phone--tall">
        <Header />
        <Page t={t}><Switch names={names} /></Page>
        <div className="as-tabbar">
          <Rule className="as-tabbar-rule" drawn />
          <div className="as-tabs">
            {tabs.map(([icon, label], i) => (
              <span key={icon} className="as-tab">
                <TabIcon name={icon} />
                <span>{label}</span>
                <i className={i === 0 ? 'as-tab-dot as-tab-dot--on' : 'as-tab-dot'} />
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    // A portrait's figure, alive, in the corner: a tap opens Portraits.
    E: (
      <div className="as-phone as-phone--tall">
        <Header />
        <Page t={t}><Switch names={names} /></Page>
        <Link to={`/${lang}/portraits`} className="as-figure" aria-label={portraits}>
          <PortraitAnimation slug="richard-feynman-fr" alt={portraits} />
        </Link>
      </div>
    ),
    // In the list: after the first card, a band of three figures inviting to Portraits.
    F: (
      <div className="as-phone as-phone--tall">
        <Header />
        <Page t={t}><Switch names={names} /></Page>
        <div className="as-band">
          <Rule className="as-band-rule" drawn />
          <div className="as-band-figures">
            {['alexis-zorba-fr', 'henry-miller-fr', 'robert-sapolsky-fr'].map((slug) => <PortraitAnimation key={slug} slug={slug} alt="" />)}
          </div>
          <p className="as-under">{portraits} ›</p>
        </div>
      </div>
    ),
  }

  return (
    <main className="as-sheet">
      {Object.entries(options).map(([letter, phone]) => (
        <section key={letter} className="as-option">
          <p className="as-letter">{letter}</p>
          {phone}
        </section>
      ))}
    </main>
  )
}
