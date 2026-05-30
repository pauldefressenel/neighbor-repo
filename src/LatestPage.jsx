import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getLatestArticles } from './sanity/queries'
import { i18n } from './i18n'
import ArticleCard from './ArticleCard'
import './SectionPage.css'

export default function LatestPage() {
  const { lang } = useParams()
  const [articles, setArticles] = useState([])
  const t = i18n[lang] ?? i18n.en

  useEffect(() => {
    getLatestArticles(lang).then(setArticles)
  }, [lang])

  return (
    <main className="main">
      <h2 className="page-title">{t.latest}</h2>
      <div className="articles-grid">
        {articles.map((a) => (
          <ArticleCard key={a._id} {...a} />
        ))}
      </div>
    </main>
  )
}
