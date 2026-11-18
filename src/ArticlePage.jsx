import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { getArticleBySlug } from './sanity/queries'
import { shortDate } from '../shared/dates.js'
import { rubriqueOf } from './sections'
import { fadeOut, leaving, opening } from './fade'
import { i18n } from './i18n'
import Arrow from './Arrow'
import './ArticlePage.css'

// An article's page, as in the app (mobile/src/ArticleScreen.js and
// ArticleText.js): the category, the author, the title and the date, on
// the left, then the text, opening on a drop cap, then any poems. Above them, the app's back arrow.
export default function ArticlePage() {
  const { lang, slug } = useParams()
  // Opened from a card (fade.js opening): its fetch, already under way, and
  // what the card showed, so the heading needn't wait for it.
  const [opened] = useState(() => (opening.slug === slug ? { ...opening } : null))
  useEffect(() => { opening.slug = null }, [])
  const [article, setArticle] = useState(null)
  // The page builds up from the moment it opened (from a card, the tap), as
  // the lists do: what arrives late doesn't wait out time already past. The
  // heading counts from the page drawn, the text from its arrival.
  const [since] = useState(() => opened?.since ?? performance.now())
  const [elapsed] = useState(() => performance.now() - since)
  const [bodyElapsed, setBodyElapsed] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()
  const t = i18n[lang] ?? i18n.en

  // However it is left, the list it goes to shows its switch at once. Set
  // while it is open: the next page is drawn before this one's effects end.
  useEffect(() => { leaving.article = true }, [])

  useEffect(() => {
    const load = opened?.slug === slug ? opened.article : getArticleBySlug(slug)
    load.then((loaded) => {
      setBodyElapsed(performance.now() - since)
      setArticle(loaded)
    })
  }, [slug, since, opened])

  // Until the article arrives, the card's heading, else an empty page a
  // screen tall, so the footer doesn't show for a moment at the foot of the
  // window.
  const shown = article ?? (opened?.slug === slug ? opened.card : null)
  if (!shown) return <main className="article-page article-page--loading" />

  // "Anna Canonne" over the title, "20 mai 2026" under it.
  const date = shown.publishedAt ? shortDate(shown.publishedAt, lang) : null

  return (
    <main
      className={`article-page${article ? '' : ' article-page--loading'}`}
      lang={shown.language ?? lang}
      style={{ '--appear-elapsed': `${Math.round(elapsed)}ms`, '--appear-body-elapsed': `${Math.round(bodyElapsed)}ms` }}
    >
      {/* Back to the page the article was opened from, as in the app; opened
          straight from a link, with nothing to go back to, its rubrique. */}
      <Link
        to={`/${lang}/${rubriqueOf(shown.section)}`}
        className="article-page-back"
        aria-label={t.back}
        onClick={(e) => {
          e.preventDefault()
          const to = location.key === 'default' ? `/${lang}/${rubriqueOf(shown.section)}` : -1
          fadeOut(e.currentTarget.closest('main')).then(() => navigate(to))
        }}
      >
        <Arrow />
      </Link>
      <ArticleHeading
        category={shown.category}
        byline={shown.author ?? ''}
        title={shown.title}
        date={date}
      />
      {article && <ArticleText body={article.body ?? []} poems={article.poems ?? []} />}
    </main>
  )
}

// The block above an article's text, also About's: the category, the author
// right under it, the title, then the date (none on About).
export function ArticleHeading({ category, byline, title, date }) {
  return (
    <>
      {(category || byline) && (
        <div className="article-page-heading">
          {category && <p className="article-page-category">{category}</p>}
          {byline && <p className="article-page-byline">{byline}</p>}
        </div>
      )}
      <h1 className={`article-page-title${category || byline ? '' : ' article-page-title--alone'}${date ? '' : ' article-page-title--last'}`}>{title}</h1>
      {date && <p className="article-page-byline article-page-date">{date}</p>}
    </>
  )
}

const components = {
  marks: {
    citation: ({ children }) => <cite className="article-citation">{children}</cite>,
  },
}

// The running text, also About's: the paragraphs, the first opening on a
// drop cap, then any poems.
export function ArticleText({ body = [], poems = [] }) {
  return (
    <div className="article-page-text">
      <div className="article-page-body">
        <PortableText value={body} components={components} />
      </div>
      {poems.map((poem) => (
        <div key={poem._key} className="article-page-poem">
          {poem.poemTitle && <h2 className="article-page-poem-title">{poem.poemTitle}</h2>}
          <PortableText value={poem.poemContent ?? []} components={components} />
        </div>
      ))}
    </div>
  )
}
