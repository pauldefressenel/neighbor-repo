import { useEffect, useLayoutEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

// From a card to its article and back (L on the comparison sheet,
// quicker): the page fades out, softly at both ends, then the next one
// builds up as usual. Resolves once the elements have faded; at once with
// Reduce Motion. A missing element is skipped.
const fade = (els, duration, easing, keyframes = [{ opacity: 1 }, { opacity: 0 }], fill = 'forwards') =>
  matchMedia('(prefers-reduced-motion: reduce)').matches
    ? Promise.resolve()
    : Promise.all(
        els.filter(Boolean).map((el) => el.animate(keyframes, { duration, easing, fill }).finished),
      )

export const fadeOut = (...els) => fade(els, 300, 'ease-in-out')

// The same fade played backwards, for a list come back to.
export const fadeIn = (el) => fade([el], 300, 'ease-in-out', [{ opacity: 0 }, { opacity: 1 }], 'backwards')

// A thin black line, on top of the fade of what holds it: at the same pace
// it seemed to stay after the words around it had gone, and on the iPhone
// its own fade alone still left it there, so it also draws itself back into
// its middle, its entrance played backwards (RubriqueSwitch.css).
export const fadeLine = (el) =>
  fade([el], 200, 'ease-out', [
    { opacity: 1, clipPath: 'inset(-4px 0 -4px 0)' },
    { opacity: 0, clipPath: 'inset(-4px 50% -4px 50%)' },
  ])

// Set while an article page is open, so the phone's Rubriques switch, coming
// back with the list, rises in whole rather than playing its entrance
// (RubriqueSwitch.jsx, which clears it).
export const leaving = { article: false }

// Back from an article to the list it was opened from (O on the comparison
// sheet): the list opens where it was left, the card just read where it
// stood on the screen, and fades in whole rather than building up. Set by
// the card as it is tapped: the list's path, the card's slug and how far
// down the window its top was.
export const back = { from: null, slug: null, top: 0 }

// For a list page (`main`, its <main>): whether it is being come back to,
// and the style that holds it unseen until its cards are `ready`; then it
// scrolls to the card and fades in. Any list opened after that one opens
// as usual.
export function useComeBack(main, ready) {
  const { pathname } = useLocation()
  const [to] = useState(() => (back.from === pathname ? { slug: back.slug, top: back.top } : null))
  useEffect(() => { back.from = null }, [])
  useLayoutEffect(() => {
    const el = main.current
    if (!to || !ready || !el) return
    const card = el.querySelector(`a.article-card[href$="/${to.slug}"]`)
    if (card) window.scrollTo(0, card.getBoundingClientRect().top + window.scrollY - to.top)
    fadeIn(el)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])
  return { returning: to != null, style: to && !ready ? { opacity: 0 } : undefined }
}
