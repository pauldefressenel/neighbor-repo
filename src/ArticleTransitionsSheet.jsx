// TEMPORARY: a comparison sheet of ways to come back from an article to the
// card it was opened from, at /:lang/article-transitions. Each letter is a
// phone-sized screen with the Top Stories cards: scroll down, tap a card, then
// the back arrow. Opening is the site's (L: the list fades out, the article
// builds up); every letter comes back to the list where it was left, the card
// just read in view, rather than at its top. They differ in how it shows:
// O — the list fades back in whole, the fade out played backwards;
// P — the cards in view build up as when the page opens, each rising a little;
// Q — the card just read shows first, the others fade in around it after;
// R — the list opens a little higher and glides down onto the card.
// (G–N, ways of opening, were set aside; L was chosen.)
// Delete this file, ArticleTransitionsSheet.css and the route in Layout.jsx
// once one is chosen.
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getArticleBySlug, getLatestArticles } from './sanity/queries'
import { longDate } from '../shared/dates.js'
import { illustrationSize } from '../shared/illustration.js'
import { appear, springCurve } from '../shared/tokens.js'
import { readingMinutes } from './readingMinutes'
import { urlFor } from './sanity/client'
import { i18n } from './i18n'
import { ArticleHeading, ArticleText } from './ArticlePage'
import Arrow from './Arrow'
import Rule from './Rule'
import './ArticleCard.css'
import './ArticlePage.css'
import './ArticleTransitionsSheet.css'

const LETTERS = ['O', 'P', 'Q', 'R']

const FADE = { duration: 300, easing: 'ease-in-out' }
const cardSpring = springCurve(appear.card.spring)
const articleSpring = springCurve(appear.article.body.spring)

// The cards at least partly on screen in the list.
const inView = (list) => {
  const box = list.getBoundingClientRect()
  return [...list.querySelectorAll('.tx-card')].filter((c) => {
    const r = c.getBoundingClientRect()
    return r.bottom > box.top && r.top < box.bottom
  })
}

// Scrolls `el` from `from` to `to` over `ms`, easing out.
const glide = (el, from, to, ms) =>
  new Promise((resolve) => {
    const start = performance.now()
    const step = (now) => {
      const t = Math.min(1, (now - start) / ms)
      el.scrollTop = from + (to - from) * (1 - (1 - t) ** 3)
      if (t < 1) requestAnimationFrame(step)
      else resolve()
    }
    requestAnimationFrame(step)
  })

// How each letter brings the list back, once the article has faded out. The
// list is where it was left; `card` is the one just read.
const comeBack = {
  O: ({ list, anim }) => anim(list, [{ opacity: 0 }, { opacity: 1 }], FADE).finished,
  P: ({ list, anim }) => {
    const cards = inView(list)
    cards.forEach((c) => (c.style.opacity = 0))
    list.style.opacity = 1
    return Promise.all(
      cards.map((c) =>
        anim(c, [{ opacity: 0, transform: `translateY(${appear.card.rise}px)` }, { opacity: 1, transform: 'none' }], {
          duration: cardSpring.ms, easing: cardSpring.easing, delay: 100, fill: 'backwards',
        }).finished.then(() => (c.style.opacity = '')),
      ),
    )
  },
  Q: ({ list, card, anim }) => {
    const others = inView(list).filter((c) => c !== card)
    others.forEach((c) => (c.style.opacity = 0))
    list.style.opacity = 1
    return Promise.all([
      anim(card, [{ opacity: 0 }, { opacity: 1 }], FADE).finished,
      ...others.map((c) =>
        anim(c, [{ opacity: 0 }, { opacity: 1 }], { ...FADE, duration: 400, delay: 300, fill: 'backwards' })
          .finished.then(() => (c.style.opacity = '')),
      ),
    ])
  },
  R: ({ list, anim }) => {
    const to = list.scrollTop
    const from = Math.max(0, to - 140)
    list.scrollTop = from
    return Promise.all([
      anim(list, [{ opacity: 0 }, { opacity: 1 }], { ...FADE, duration: 400 }).finished,
      glide(list, from, to, 650),
    ])
  },
}

function Card({ article, lang, onOpen }) {
  const t = i18n[lang] ?? i18n.en
  const image = article.mainImage && illustrationSize(article.mainImage, article.illustrationScale)
  return (
    <div className="tx-card article-card" onClick={onOpen}>
      <Rule className="card-rule" />
      {article.category && <p className="article-category">{article.category}</p>}
      <h2 className="article-title">{article.title}</h2>
      {article.excerpt && <p className="article-description">{article.excerpt}</p>}
      {image ? (
        <div className="article-image" style={{ aspectRatio: image.aspect }}>
          <img src={urlFor(article.mainImage).width(800).url()} alt="" style={{ width: `${image.width * 100}%`, height: '100%' }} />
        </div>
      ) : (
        <div className="article-image article-image--placeholder" />
      )}
      {article.author && <p className="article-author">{t.by} {article.author}</p>}
      {article.publishedAt && <p className="article-date">{longDate(article.publishedAt, lang)}</p>}
    </div>
  )
}

function Screen({ letter, cards, full, lang }) {
  const t = i18n[lang] ?? i18n.en
  const list = useRef(null)
  const page = useRef(null)
  const [opened, setOpened] = useState(null) // { slug, card }
  const busy = useRef(false)

  const anim = (el, keyframes, options) => el.animate(keyframes, options)

  // The article builds up as soon as it is in place, before it is seen.
  useLayoutEffect(() => {
    if (!opened) return
    page.current.scrollTop = 0
    const { rise } = appear.article.body
    anim(page.current, [{ opacity: 0, transform: `translateY(${rise}px)` }, { opacity: 1, transform: 'none' }], {
      duration: articleSpring.ms, easing: articleSpring.easing, fill: 'backwards',
    }).finished.then(() => { busy.current = false })
  }, [opened])

  const onOpen = (slug) => async (e) => {
    if (busy.current || opened || !full[slug]) return
    busy.current = true
    const card = e.currentTarget
    await anim(list.current, [{ opacity: 1 }, { opacity: 0 }], FADE).finished
    list.current.style.opacity = 0
    setOpened({ slug, card })
  }

  const onClose = async () => {
    if (busy.current) return
    busy.current = true
    await anim(page.current, [{ opacity: 1 }, { opacity: 0 }], { ...FADE, fill: 'forwards' }).finished
    const { card } = opened
    setOpened(null)
    await comeBack[letter]({ list: list.current, card, anim })
    list.current.style.opacity = ''
    busy.current = false
  }

  const article = opened && full[opened.slug]
  return (
    <section className="tx-option">
      <p className="tx-letter">{letter}</p>
      <div className="tx-phone">
        <header className="tx-masthead">
          <span className="tx-wordmark">The Neighbor</span>
          <Rule className="tx-masthead-rule" drawn />
        </header>
        <div className="tx-screen">
          <div className="tx-list" ref={list}>
            {cards.map((card) => (
              <Card key={card._id} article={card} lang={lang} onOpen={onOpen(card.slug.current)} />
            ))}
          </div>
          {article && (
            <div className="tx-article" ref={page}>
              <div className="tx-article-inner" lang={article.language ?? lang}>
                <button type="button" className="article-page-back tx-back" aria-label={t.back} onClick={onClose}>
                  <Arrow />
                </button>
                <ArticleHeading
                  category={article.category}
                  byline={[article.author, article.publishedAt && longDate(article.publishedAt, lang)].filter(Boolean).join(', ') + '.'}
                  title={article.title}
                  readingTime={`${readingMinutes(article)} min.`}
                />
                <ArticleText body={article.body ?? []} poems={article.poems ?? []} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default function ArticleTransitionsSheet() {
  const { lang } = useParams()
  const [cards, setCards] = useState([])
  const [full, setFull] = useState({})

  // All the Top Stories cards, so there is a list to scroll down, and their
  // articles in full ahead of time, so a tap opens at once.
  useEffect(() => {
    getLatestArticles(lang).then((articles) => {
      setCards(articles)
      articles.forEach((a) =>
        getArticleBySlug(a.slug.current).then((loaded) => setFull((f) => ({ ...f, [a.slug.current]: loaded }))),
      )
    })
  }, [lang])

  return (
    <main className="tx-sheet">
      {LETTERS.map((letter) => (
        <Screen key={letter} letter={letter} cards={cards} full={full} lang={lang} />
      ))}
    </main>
  )
}
