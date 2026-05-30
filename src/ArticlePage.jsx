import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { getArticleBySlug } from './sanity/queries'
import './ArticlePage.css'

export default function ArticlePage() {
  const { slug } = useParams()
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

  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null

  return (
    <main className="article-page">
      <p className="article-page-category">{article.category}</p>
      <h1 className="article-page-title">{article.title}</h1>
      <p className="article-page-byline">
        <span className="article-page-author">By {article.author}</span>
        {date && <span className="article-page-date"> · {date}</span>}
      </p>
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
