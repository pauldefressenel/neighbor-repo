import { useContext, useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { longDate } from '../shared/dates.js'
import { appear, card } from '../shared/tokens.js'
import { AppearContext, delayLeft } from './appear'
import { i18n } from './i18n'
import Rule from './Rule'
import { urlFor } from './sanity/client'
import { rubriqueOf } from './sections'
import './ArticleCard.css'

// The app's card (mobile/src/ArticleCard.js): a centred title page with the
// category, title and excerpt, then the illustration, then the byline and
// date. A portrait (PortraitCard.jsx) passes its animation as `picture`,
// which takes the illustration's place. The rule above
// the card separates it from the one before (on phones the first card has
// none); on wider screens the first card of each row stretches it across the
// grid (SectionPage.css).
export default function ArticleCard({ category, title, excerpt, author, mainImage, publishedAt, slug, language, section, picture, pictureStyle, appearIndex }) {
  const t = i18n[language] ?? i18n.en
  // On a page that builds up, the first cards rise in as in the app, once the
  // title's asterisk is up, or at once if they arrived later than that.
  const since = useContext(AppearContext)
  const link = useRef(null)
  useLayoutEffect(() => {
    if (since == null || appearIndex == null || appearIndex >= appear.max) return
    link.current.style.animationDelay = `${delayLeft(since, appear.card.delay)}ms`
    link.current.classList.add('article-card--rise')
    // Plays once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <Link className={`article-card${picture ? ' article-card--portrait' : ''}`} to={`/${language}/${rubriqueOf(section)}/${slug.current}`} ref={link}>
      <Rule className="card-rule" />
      {category && <p className="article-category">{category}</p>}
      <CardTitle>{title}</CardTitle>
      {excerpt && <p className="article-description">{excerpt}</p>}
      {picture
        ? <div className="article-picture" style={pictureStyle}>{picture}</div>
        : mainImage
          ? <img className="article-image" src={urlFor(mainImage).width(1200).url()} alt={title} />
          : <div className="article-image article-image--placeholder" />}
      {author && <p className="article-author">{t.by} {author}</p>}
      {publishedAt && <p className="article-date">{longDate(publishedAt, language)}</p>}
    </Link>
  )
}

const PHONE = '(max-width: 699.98px)'

// The title, balanced by CSS. On phones it follows the app's rule
// (BalancedText's maxFill): a title that fits on one line but runs wider
// than card.titleMaxFill of the card goes onto two balanced lines; a title
// that already takes two lines or more keeps the card's full width. CSS can't
// tell a title's line count, so it is measured, again once the fonts arrive
// and whenever the card changes width.
function CardTitle({ children }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    const measure = () => {
      el.style.maxWidth = ''
      if (!window.matchMedia(PHONE).matches || !/\s/.test(el.textContent.trim())) return
      const range = document.createRange()
      range.selectNodeContents(el)
      const lines = new Set([...range.getClientRects()].map((r) => Math.round(r.top))).size
      const width = range.getBoundingClientRect().width
      // Just narrower than its one line, so balancing splits it evenly in two.
      if (lines === 1 && width > card.titleMaxFill * el.parentElement.clientWidth) {
        el.style.maxWidth = `${Math.floor(width) - 1}px`
      }
    }
    measure()
    document.fonts?.ready.then(measure)
    const observer = new ResizeObserver(measure)
    observer.observe(el.parentElement)
    return () => observer.disconnect()
  }, [children])
  return <h2 className="article-title" ref={ref}>{children}</h2>
}
