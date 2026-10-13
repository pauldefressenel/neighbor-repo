import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { appear } from '../shared/tokens.js'
import { AppearContext, delayLeft } from './appear'
import ArticleCard from './ArticleCard'
import Rule from './Rule'
import PortraitCard from './PortraitCard'

// The list of cards on a section page or the Latest page, in columns on
// wider screens (SectionPage.css), with one drawn line down each gap between
// columns: three, of which the CSS shows as many as there are gaps. They
// come after the cards, so the cards' nth-child rules still count only
// cards, and only with them, so they rise in with the first ones
// (ColumnRules). Portraits get their own strip.
export default function ArticleGrid({ articles }) {
  if (articles[0]?.section === 'portraits') return <PortraitStrip articles={articles} />
  return <CardGrid articles={articles} />
}

function CardGrid({ articles }) {
  const grid = useRef(null)
  return (
    <div className="articles-grid" ref={grid}>
      {articles.map((a, i) => <ArticleCard key={a._id} {...a} appearIndex={i} riseOnScroll />)}
      {articles.length > 0 && <ColumnRules grid={grid} />}
    </div>
  )
}

// The lines between columns. Each runs from the grid's top down through the
// last row with a card on its left, so every card stands in a closed box,
// a lone last card included, and on to the line under that row if there is
// one; in a last row that isn't full, a gap with no card on its left has no
// line (running the grid's full height, they drew empty boxes), and a line
// under the row closes its cards' boxes, as far as the last one's line
// (`row-end-rule`), as the line between rows would: 30px under the cards.
// Measured, again whenever the grid changes size (images arriving, the
// window resized). On a page that builds up, they rise in on the line's step
// (appear.line in shared/tokens.js, with the first cards), or at once if the
// cards came later than that.
function ColumnRules({ grid }) {
  const rise = useLineRise()
  const [heights, setHeights] = useState([])
  const [end, setEnd] = useState(null)
  useLayoutEffect(() => {
    const el = grid.current
    const measure = () => {
      const cols = Number(getComputedStyle(el).getPropertyValue('--cols')) || 1
      const cards = [...el.children].filter((c) => c.classList.contains('article-card'))
      const top = el.getBoundingClientRect().top
      // A short last row: how many cards, and where the line under it goes.
      const start = Math.floor((cards.length - 1) / cols) * cols
      const span = cards.length - start
      const foot = span < cols
        ? Math.max(...cards.slice(start).map((c) => c.offsetTop + c.offsetHeight)) + ROW_END
        : null
      setEnd(foot == null ? null : { span, foot })
      setHeights([1, 2, 3].map((k) => {
        const last = cards.findLastIndex((_, i) => i % cols === k - 1)
        if (last < 0) return 0
        // The next row's first card carries the line under this row.
        const next = cards[(Math.floor(last / cols) + 1) * cols]
        if (!next) return foot ?? cards[last].offsetTop + cards[last].offsetHeight
        const rule = next.querySelector('.card-rule').getBoundingClientRect()
        return rule.top + rule.height / 2 - top
      }))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [grid])
  return (
    <>
      {[1, 2, 3].map((k) => (
        <Rule
          key={k}
          className={`column-rule column-rule-${k}${rise ? ' column-rule--rise' : ''}`}
          vertical
          style={{ '--k': k, height: heights[k - 1] ? `${heights[k - 1]}px` : 0, ...rise }}
        />
      ))}
      {end && (
        <Rule
          className={`row-end-rule${rise ? ' column-rule--rise' : ''}`}
          style={{ '--span': end.span, top: `${end.foot - 4}px`, ...rise }}
        />
      )}
    </>
  )
}

// From the foot of a row's cards to the middle of the line under it (the
// next card's line: its 30px margin, then half its 8px).
const ROW_END = 34

// The line's step, as a delay left to wait, or null outside a page that
// builds up.
function useLineRise() {
  const since = useContext(AppearContext)
  return since == null ? null : { animationDelay: `${delayLeft(since, appear.line.delay)}ms` }
}

// A Portraits card's line, in the gap to its left, sliding with it. The
// first card's falls in the row's faded edge (SectionPage.css).
function StripRule() {
  const rise = useLineRise()
  return <Rule className={`strip-rule${rise ? ' column-rule--rise' : ''}`} vertical style={rise ?? undefined} />
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
// On its own, it moves on one card every AUTO_ADVANCE, as the right arrow
// does, counted from the start of the last move, the reader's included, and
// whatever the pointer is doing. It holds still while the page is in the
// background, and with Reduce Motion on.
const AUTO_ADVANCE = 5000 // ms

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
  // The arrows rise in with the cards' lines.
  const rise = useLineRise()
  const arrowRise = rise ? ' column-rule--rise' : ''
  const viewport = useRef(null)
  // Counts the moves, so the automatic one is timed from the last.
  const [moves, setMoves] = useState(0)
  const move = (direction) => {
    if (busy.current) return
    busy.current = true
    setMoves((m) => m + 1)
    setMoved(true)
    setAnimate(true)
    setShift(direction)
  }

  useEffect(() => {
    const el = viewport.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => {
      // Phones show the column instead, with nothing to slide.
      if (document.hidden || getComputedStyle(el).overflow !== 'hidden') return
      move(1)
    }, AUTO_ADVANCE)
    return () => clearInterval(id)
    // Started again as each move begins.
  }, [moves])

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
      <button type="button" className={`strip-arrow${arrowRise}`} style={rise ?? undefined} aria-label="Previous" onClick={() => move(-1)}>
        <Arrow />
      </button>
      <div className="strip-viewport" ref={viewport}>
        <div
          className={`articles-grid articles-grid--portraits${animate ? '' : ' strip-still'}${moved ? ' strip-moved' : ''}`}
          style={{ '--shift': shift }}
          onTransitionEnd={settle}
        >
          <div className="strip-item strip-item--lead" inert>
            <StripRule />
            <PortraitCard {...lead} />
          </div>
          {turned.map((a, i) => (
            <div key={a._id} className="strip-item">
              <StripRule />
              <PortraitCard {...a} appearIndex={i} />
            </div>
          ))}
        </div>
      </div>
      <button type="button" className={`strip-arrow strip-arrow--next${arrowRise}`} style={rise ?? undefined} aria-label="Next" onClick={() => move(1)}>
        <Arrow />
      </button>
    </div>
  )
}

// A drawn chevron pointing left, "<" (the next one is mirrored in CSS): one
// stroke, as if by pen, its arms a little uneven (the lower one longer, each
// wavering slightly) and its point slightly rounded. Between a ruled chevron
// and two crossing strokes, which looked too hand-drawn. Drawn at 80% of
// its 16×26, with a heavier stroke (it was 1.7 at full size).
function Arrow() {
  return (
    <svg width="13" height="21" viewBox="0 0 16 26" fill="none" aria-hidden="true">
      <path d="M12.1 3.1 C10.9 4.6 9.2 6.6 7.6 8.2 C6 9.9 4.4 11.4 2.9 12.8 C2.6 13.1 2.6 13.4 2.9 13.7 C4.6 15.3 6.4 17 8 18.8 C9.6 20.5 11.2 22.3 12.8 23.7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
