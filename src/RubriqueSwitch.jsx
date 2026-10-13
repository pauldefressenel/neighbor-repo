import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { leaving } from './fade'
import './RubriqueSwitch.css'

// Phones only: a row like the app's Rubriques switch (mobile/src/RubriqueSwitch.js)
// over Latest and the three rubriques, in the cards' category capitals, the
// current one red, over one drawn line. The first three fill the width;
// Portraits waits off to the right: the row scrolls sideways, fading out
// towards a drawn chevron that scrolls it on, or back once at the end
// (option A of a comparison sheet). On Portraits it opens scrolled to the
// end. It sits in the fixed header, under its line, so the paper's fade falls
// below it. Its line draws itself from the middle outwards while the names
// rise one after another, then the arrow (D of the switch-appear sheet; the
// names first, then the line and arrow rising, came first, then the line
// drawn before the names), each time it appears (from another page, not between the four, where it stays put). A name shrinks while held, as in the app;
// tracked by pointer rather than :active, which phones apply only for an
// instant on a quick tap, so the shrink jumped. Only the words shrink, not
// the link: a shrinking link pulled its edge out from under the finger, and
// a tap let go there didn't count. A quick tap still plays the whole shrink:
// the press is held at least PRESS_IN, or the finger lifted before it showed.
const PRESS_IN = 150 // ms, the shrink's length in RubriqueSwitch.css

export default function RubriqueSwitch({ lang, t }) {
  // Come back to from an article, it is simply there (fade.js).
  const [still] = useState(() => leaving.article)
  useEffect(() => { leaving.article = false }, [])
  const [pressed, setPressed] = useState(null)
  const since = useRef(0)
  const timer = useRef(null)
  const press = (to, e) => {
    clearTimeout(timer.current)
    since.current = e.timeStamp
    setPressed(to)
  }
  const release = (e) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setPressed(null), Math.max(0, PRESS_IN - (e.timeStamp - since.current)))
  }
  const items = [
    { label: t.latest, to: `/${lang}`, end: true },
    ...t.sections.map((s) => ({ label: s.label, to: `/${lang}/${s.value}` })),
  ]

  const track = useRef(null)
  const [atEnd, setAtEnd] = useState(false)
  const measure = () => {
    const el = track.current
    if (el) setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }
  // Opened on Portraits, the row starts scrolled to it.
  const { pathname } = useLocation()
  const onPortraits = pathname.replace(/\/$/, '') === `/${lang}/portraits`
  useLayoutEffect(() => {
    if (onPortraits && track.current) track.current.scrollLeft = track.current.scrollWidth
    measure()
    // Only as it appears; after that the reader scrolls it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const turn = () => track.current?.scrollTo({ left: atEnd ? 0 : track.current.scrollWidth, behavior: 'smooth' })

  return (
    <nav className={`rubrique-switch${still ? ' rubrique-switch--still' : ''}`}>
      <div className="rubrique-switch-bar">
        <div className={`rubrique-switch-row${atEnd ? ' rubrique-switch-row--end' : ''}`} ref={track} onScroll={measure}>
          {items.map(({ label, to, end }, i) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rubrique-switch-link${isActive ? ' rubrique-switch-link--active' : ''}${pressed === to ? ' rubrique-switch-link--pressed' : ''}`
              }
              onPointerDown={(e) => press(to, e)}
              onPointerUp={release}
              onPointerLeave={release}
              onPointerCancel={release}
              style={{ animationDelay: `${100 + i * 70}ms` }}
            >
              <span className="rubrique-switch-label">{label}</span>
            </NavLink>
          ))}
        </div>
        <button
          type="button"
          className={`rubrique-switch-arrow${atEnd ? ' rubrique-switch-arrow--back' : ''}`}
          onClick={turn}
          aria-label={atEnd ? t.latest : t.sections.at(-1).label}
        >
          <svg width="10" height="16" viewBox="0 0 16 26" fill="none" aria-hidden="true">
            <path d="M12.1 3.1 C10.9 4.6 9.2 6.6 7.6 8.2 C6 9.9 4.4 11.4 2.9 12.8 C2.6 13.1 2.6 13.4 2.9 13.7 C4.6 15.3 6.4 17 8 18.8 C9.6 20.5 11.2 22.3 12.8 23.7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <span className="rubrique-switch-rule" aria-hidden="true" />
    </nav>
  )
}
