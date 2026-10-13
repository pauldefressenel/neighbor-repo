import { useContext, useLayoutEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { longDate } from '../shared/dates.js'
import { illustrationSize } from '../shared/illustration.js'
import { appear } from '../shared/tokens.js'
import { AppearContext, delayLeft } from './appear'
import { back, fadeLine, fadeOut } from './fade'
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
export default function ArticleCard({ category, title, excerpt, author, mainImage, illustrationScale, publishedAt, slug, language, section, picture, pictureStyle, appearIndex, riseOnScroll }) {
  const t = i18n[language] ?? i18n.en
  // On a page that builds up, the first cards rise in as in the app, once the
  // title's asterisk is up, or at once if they arrived later than that. With
  // `riseOnScroll` (the article grids), the cards after them wait unseen and
  // rise the same way as they come into view; those already in view as the
  // page opens (a wide screen's second row) rise with the first ones.
  const since = useContext(AppearContext)
  const link = useRef(null)
  const navigate = useNavigate()
  const to = `/${language}/${rubriqueOf(section)}/${slug.current}`
  useLayoutEffect(() => {
    if (since == null || appearIndex == null) return
    const el = link.current
    const rise = () => {
      el.classList.remove('article-card--waiting')
      el.style.animationDelay = `${delayLeft(since, appear.card.delay)}ms`
      el.classList.add('article-card--rise')
    }
    if (appearIndex < appear.max) return rise()
    if (!riseOnScroll || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.classList.add('article-card--waiting')
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      rise()
    })
    observer.observe(el)
    return () => observer.disconnect()
    // Plays once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <Link
      className={`article-card${picture ? ' article-card--portrait' : ''}`}
      to={to}
      ref={link}
      // The page fades out before the article opens, at its top, the phone's
      // Rubriques switch with it (fade.js), noting where the card stood for
      // the way back. Not when it is opened in a new tab.
      onClick={(e) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        Object.assign(back, { from: window.location.pathname, slug: slug.current, top: e.currentTarget.getBoundingClientRect().top })
        fadeLine(document.querySelector('.rubrique-switch-rule'))
        fadeOut(e.currentTarget.closest('main'), document.querySelector('.rubrique-switch')).then(() => {
          window.scrollTo(0, 0)
          navigate(to)
        })
      }}
    >
      <Rule className="card-rule" />
      {category && <p className="article-category">{category}</p>}
      <CardTitle>{title}</CardTitle>
      {excerpt && <p className="article-description">{excerpt}</p>}
      {picture
        ? <div className="article-picture" style={pictureStyle}>{picture}</div>
        : mainImage
          ? <Illustration image={mainImage} scale={illustrationScale} title={title} />
          : <div className="article-image article-image--placeholder" />}
      {author && <p className="article-author">{t.by} {author}</p>}
      {publishedAt && <p className="article-date">{longDate(publishedAt, language)}</p>}
    </Link>
  )
}

// The drawing in a box just as tall as it (shared/illustration.js).
function Illustration({ image, scale, title }) {
  const { aspect, width } = illustrationSize(image, scale)
  return (
    <div className="article-image" style={{ aspectRatio: aspect }}>
      <img src={urlFor(image).width(1200).url()} alt={title} style={{ width: `${width * 100}%`, height: '100%' }} />
    </div>
  )
}

const PHONE = '(max-width: 699.98px)'

// The share of the card a one-line title may fill on a phone before it goes
// onto two lines: more than the app's card.titleMaxFill (0.8), which split
// titles the website's phones had room for.
const TITLE_MAX_FILL = 0.9

// The title, balanced by CSS. On phones it follows the app's rule
// (BalancedText's maxFill): a title that fits on one line but runs wider
// than TITLE_MAX_FILL of the card goes onto two balanced lines; a title
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
      if (lines === 1 && width > TITLE_MAX_FILL * el.parentElement.clientWidth) {
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
