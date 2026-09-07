import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { getArticleBySlug } from './sanity/queries'
import './ArticlePage.css'

export default function ArticlePage() {
  const { lang, slug } = useParams()
  const [article, setArticle] = useState(null)

  useEffect(() => {
    getArticleBySlug(slug).then(setArticle)
  }, [slug])

  if (!article) return null

  const portableTextComponents = {
    marks: {
      citation: ({ children }) => (
        <cite className="article-citation">{children}</cite>
      ),
    },
  }

  // Dates are stored at UTC midnight, so format in UTC or a westward timezone
  // renders the previous day. Framer prints "Jul 6, 2026" / "6 juil. 2026".
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : null

  return (
    <main className="article-page">
      <h1 className="article-page-title">{article.title}</h1>
      <p className="article-page-author">{article.author}</p>
      {date && <p className="article-page-date">{date}</p>}
      <hr className="article-page-rule" />
      {article.body && (
        <div className="article-page-body">
          <PortableText value={article.body} components={portableTextComponents} />
        </div>
      )}
      {article.poems && article.poems.map((poem) => (
        <div key={poem._key} className="article-page-poem">
          {poem.poemTitle && <h2 className="article-page-poem-title">{poem.poemTitle}</h2>}
          <PortableText value={poem.poemContent} />
        </div>
      ))}
    </main>
  )
}
