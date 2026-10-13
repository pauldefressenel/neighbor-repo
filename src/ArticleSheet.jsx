// TEMPORARY: a comparison sheet for the article page, at /:lang/article-sheet
// (?slug=<slug> for another article). Each letter shows the same article's
// opening at desktop width and at phone width:
// A — the website's page as it was (Framer's: centred, red drop cap);
// B — the app's layout, as the site has it now (ArticlePage.jsx);
// C — B with larger text and drop cap on desktop.
// Delete this file, ArticleSheet.css and the route in Layout.jsx once one is
// chosen.
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { getArticleBySlug } from './sanity/queries'
import { longDate } from '../shared/dates.js'
import { readingMinutes } from './readingMinutes'
import { ArticleHeading, ArticleText } from './ArticlePage'
import './ArticlePage.css'
import './ArticleSheet.css'

const PARAGRAPHS = 4

// The page as it was before the app's layout (git: ArticlePage.jsx before
// this sheet).
function Old({ article, lang }) {
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
        month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
      })
    : null
  return (
    <div className="old-page">
      <h1 className="old-title">{article.title}</h1>
      <p className="old-author">{article.author}</p>
      {date && <p className="old-date">{date}</p>}
      <div className="old-body">
        <PortableText value={article.body.slice(0, PARAGRAPHS)} />
      </div>
    </div>
  )
}

function App({ article, lang }) {
  const date = article.publishedAt ? longDate(article.publishedAt, lang) : null
  const byline = [article.author, date].filter(Boolean).join(', ')
  return (
    <div className="article-page">
      <ArticleHeading
        category={article.category}
        byline={byline ? `${byline}.` : ''}
        title={article.title}
        readingTime={`${readingMinutes(article)} min.`}
      />
      <ArticleText body={article.body.slice(0, PARAGRAPHS)} />
    </div>
  )
}

export default function ArticleSheet() {
  const { lang } = useParams()
  const [params] = useSearchParams()
  const slug = params.get('slug') ?? 'declaration-d-amour-a-alain-cavalier'
  const [article, setArticle] = useState(null)

  useEffect(() => {
    getArticleBySlug(slug).then((a) => setArticle(a && { ...a, body: (a.body ?? []).filter((b) => b._type === 'block') }))
  }, [slug])

  if (!article) return null

  return (
    <main className="article-sheet">
      {['A', 'B', 'C'].map((letter) => {
        const Page = letter === 'A' ? Old : App
        return (
          <section key={letter} className={`sheet-option sheet-${letter}`}>
            <p className="sheet-letter">{letter}</p>
            <div className="sheet-frames">
              <div className="sheet-frame sheet-desktop"><Page article={article} lang={lang} /></div>
              <div className="sheet-frame sheet-phone"><Page article={article} lang={lang} /></div>
            </div>
          </section>
        )
      })}
    </main>
  )
}
