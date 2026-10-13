import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { getArticleBySlug } from './sanity/queries'
import { longDate } from '../shared/dates.js'
import { readingMinutes } from './readingMinutes'
import { rubriqueOf } from './sections'
import { i18n } from './i18n'
import Arrow from './Arrow'
import './ArticlePage.css'

// An article's page, as in the app (mobile/src/ArticleScreen.js and
// ArticleText.js): the category, "author, date.", the title and the reading
// time, on the left, then the text, opening on a drop cap, then any poems.
// Above them, the app's back arrow.
export default function ArticlePage() {
  const { lang, slug } = useParams()
  const [article, setArticle] = useState(null)
  // The page builds up from the moment it opened, as the lists do: an
  // article that arrives late doesn't wait out time already past.
  const [since] = useState(() => performance.now())
  const [elapsed, setElapsed] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()
  const t = i18n[lang] ?? i18n.en

  useEffect(() => {
    getArticleBySlug(slug).then((loaded) => {
      setElapsed(performance.now() - since)
      setArticle(loaded)
    })
  }, [slug, since])

  if (!article) return null

  // "Anna Canonne, 20 mai 2026." on one line, closed by a full stop.
  const date = article.publishedAt ? longDate(article.publishedAt, lang) : null
  const byline = [article.author, date].filter(Boolean).join(', ')

  return (
    <main className="article-page" lang={article.language ?? lang} style={{ '--appear-elapsed': `${Math.round(elapsed)}ms` }}>
      {/* Back to the page the article was opened from, as in the app; opened
          straight from a link, with nothing to go back to, its rubrique. */}
      <Link
        to={`/${lang}/${rubriqueOf(article.section)}`}
        className="article-page-back"
        aria-label={t.back}
        onClick={(e) => {
          if (location.key === 'default') return
          e.preventDefault()
          navigate(-1)
        }}
      >
        <Arrow />
      </Link>
      <ArticleHeading
        category={article.category}
        byline={byline ? `${byline}.` : ''}
        title={article.title}
        readingTime={`${readingMinutes(article)} min.`}
      />
      <ArticleText body={article.body ?? []} poems={article.poems ?? []} />
    </main>
  )
}

// The block above an article's text, also About's: the category, "author,
// date." right under it, the title, then the reading time. `readingTime` is
// null until the text has loaded: its line is held open until then, so
// nothing moves when it arrives.
export function ArticleHeading({ category, byline, title, readingTime }) {
  return (
    <>
      {(category || byline) && (
        <div className="article-page-heading">
          {category && <p className="article-page-category">{category}</p>}
          {byline && <p className="article-page-byline">{byline}</p>}
        </div>
      )}
      <h1 className={`article-page-title${category || byline ? '' : ' article-page-title--alone'}`}>{title}</h1>
      <p className="article-page-byline article-page-reading">{readingTime ?? ' '}</p>
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
