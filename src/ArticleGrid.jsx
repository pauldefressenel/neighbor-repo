import { useEffect, useRef, useState } from 'react'
import ArticleCard from './ArticleCard'
import PortraitCard from './PortraitCard'

// The list of cards on a section page or the Latest page, in columns on
// wider screens (SectionPage.css). Portraits get their own strip.
export default function ArticleGrid({ articles }) {
  if (articles[0]?.section === 'portraits') return <PortraitStrip articles={articles} />
  return (
    <div className="articles-grid">
      {articles.map((a) => <ArticleCard key={a._id} {...a} />)}
    </div>
  )
}

// Portraits. On phones, the usual column. On wider screens, a row showing
// four at a time (three below 900px) between two arrows, which slides one
// card per move and goes round without end. The track holds the list turned
// to the current card, plus a `lead` copy of the card before it, parked just
// off the left edge, so there is always a card to slide in from either side.
// After a slide the list is turned by one and the track put back where it
// was, without a transition: the same cards stand in the same places, so
// nothing is seen to move. The row's edges fade (SectionPage.css), so a card
// dissolves as it slides out and appears as it slides in. The wheel or a trackpad swipe moves it too.
function PortraitStrip({ articles }) {
  const n = articles.length
  const [offset, setOffset] = useState(0)
  // -1 or 1 while a slide is under way, 0 at rest.
  const [shift, setShift] = useState(0)
  const [animate, setAnimate] = useState(true)
  // Once the row has moved, the cards' entrance animation is off: moving a
  // card within the page restarts it, which blanked the card after a move.
  const [moved, setMoved] = useState(false)
  const busy = useRef(false)
  const viewport = useRef(null)
  const move = (direction) => {
    if (busy.current) return
    busy.current = true
    setMoved(true)
    setAnimate(true)
    setShift(direction)
  }

  // The slide has ended: turn the list, put the track back, and allow the
  // transition again once that has been drawn.
  const settle = (e) => {
    if (e.target !== e.currentTarget || e.propertyName !== 'transform' || shift === 0) return
    setAnimate(false)
    setOffset((o) => (o + shift + n) % n)
    setShift(0)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setAnimate(true)
        busy.current = false
      })
    )
  }

  // The wheel (or a swipe) moves one card once enough of it has built up.
  useEffect(() => {
    const el = viewport.current
    if (!el) return
    let built = 0
    const wheel = (e) => {
      if (getComputedStyle(el).overflow !== 'hidden') return // phones
      e.preventDefault()
      built += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (Math.abs(built) > 60) {
        move(built > 0 ? 1 : -1)
        built = 0
      }
    }
    el.addEventListener('wheel', wheel, { passive: false })
    return () => el.removeEventListener('wheel', wheel)
  })

  // Keyed by article, so a turn moves the cards rather than redrawing them.
  const turned = [...articles.slice(offset), ...articles.slice(0, offset)]
  const lead = articles[(offset - 1 + n) % n]

  return (
    <div className="portrait-strip">
      <button type="button" className="strip-arrow" aria-label="Previous" onClick={() => move(-1)}>
        <Arrow />
      </button>
      <div className="strip-viewport" ref={viewport}>
        <div
          className={`articles-grid articles-grid--portraits${animate ? '' : ' strip-still'}${moved ? ' strip-moved' : ''}`}
          style={{ '--shift': shift }}
          onTransitionEnd={settle}
        >
          <div className="strip-item strip-item--lead" inert>
            <PortraitCard {...lead} />
          </div>
          {turned.map((a) => (
            <div key={a._id} className="strip-item">
              <PortraitCard {...a} />
            </div>
          ))}
        </div>
      </div>
      <button type="button" className="strip-arrow strip-arrow--next" aria-label="Next" onClick={() => move(1)}>
        <Arrow />
      </button>
    </div>
  )
}

// A drawn chevron pointing left, "<" (the next one is mirrored in CSS): one
// stroke, as if by pen, its arms a little uneven (the lower one longer, each
// wavering slightly) and its point slightly rounded. Between a ruled chevron
// and two crossing strokes, which looked too hand-drawn.
function Arrow() {
  return (
    <svg width="16" height="26" viewBox="0 0 16 26" fill="none" aria-hidden="true">
      <path d="M12.1 3.1 C10.9 4.6 9.2 6.6 7.6 8.2 C6 9.9 4.4 11.4 2.9 12.8 C2.6 13.1 2.6 13.4 2.9 13.7 C4.6 15.3 6.4 17 8 18.8 C9.6 20.5 11.2 22.3 12.8 23.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
