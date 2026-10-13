// TEMPORARY: a comparison sheet for the phone's Rubriques switch scrolling
// sideways to reach Portraits (A La Une, Essais, Prose, then Portraits off to
// the right), at /:lang/switch-scroll. Swipe each row, or tap its arrow.
// Delete this file, ScrollSheet.css and the route in Layout.jsx once one is
// chosen.
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { i18n } from './i18n'
import Rule from './Rule'
import './ScrollSheet.css'

function Chevron({ flipped }) {
  return (
    <svg width="10" height="16" viewBox="0 0 16 26" fill="none" aria-hidden="true" style={flipped ? undefined : { transform: 'scaleX(-1)' }}>
      <path d="M12.1 3.1 C10.9 4.6 9.2 6.6 7.6 8.2 C6 9.9 4.4 11.4 2.9 12.8 C2.6 13.1 2.6 13.4 2.9 13.7 C4.6 15.3 6.4 17 8 18.8 C9.6 20.5 11.2 22.3 12.8 23.7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Row({ letter, names, dots, arrow, red, peek, lineArrow, tight }) {
  const track = useRef(null)
  const [end, setEnd] = useState(false)
  const onScroll = () => {
    const el = track.current
    setEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }
  useEffect(onScroll, [])
  const go = () => track.current.scrollTo({ left: end ? 0 : track.current.scrollWidth, behavior: 'smooth' })
  return (
    <section className="ss-option">
      <p className="ss-letter">{letter}</p>
      <div className={`ss-switch${peek ? ' ss-switch--peek' : ''}`}>
        <div className={`ss-track${dots ? ' ss-track--dots' : ''}${tight ? ' ss-track--tight' : ''}`} ref={track} onScroll={onScroll}>
          {names.map((n, i) => [
            i > 0 && dots ? <i key={`dot-${n}`} className="ss-dot" /> : null,
            <span key={n} className={i === 0 ? 'ss-name ss-name--on' : 'ss-name'}>{n}</span>,
          ])}
        </div>
        {arrow && (
          <button type="button" className={`ss-arrow${red ? ' ss-arrow--red' : ''}${arrow === 'flip' && end ? ' ss-arrow--start' : ''}`} onClick={go} aria-label="Portraits">
            <Chevron flipped={arrow === 'flip' && end} />
          </button>
        )}
      </div>
      <div className="ss-line">
        <Rule className="ss-rule" drawn />
        {lineArrow && <span className={`ss-line-head${end ? ' ss-line-head--end' : ''}`} onClick={go}><Chevron /></span>}
      </div>
    </section>
  )
}

export default function ScrollSheet() {
  const { lang } = useParams()
  const t = i18n[lang] ?? i18n.en
  const label = (v) => t.sections.find((s) => s.value === v).label
  const names = [t.latest, label('essays-criticism'), label('prose-poetry'), label('portraits')]
  const options = {
    // A drawn chevron at the right edge, over a fade; tapping it scrolls.
    // The names closer together.
    A: { arrow: 'plain', tight: true },
    // The same, the chevron red.
    B: { arrow: 'plain', red: true },
    // The chevron turns round once Portraits is reached, to come back.
    C: { arrow: 'flip' },
    // With the app's dots between the names.
    D: { arrow: 'flip', dots: true },
    // No arrow: Portraits peeks in, cut by the fade at the edge.
    E: { peek: true },
    // The line under the row ends in an arrowhead pointing on.
    F: { lineArrow: true },
  }
  return (
    <main className="ss-sheet">
      {Object.entries(options).map(([letter, o]) => <Row key={letter} letter={letter} names={names} {...o} />)}
    </main>
  )
}
