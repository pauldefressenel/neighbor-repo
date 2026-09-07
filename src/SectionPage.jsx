import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import './SectionPage.css'
import { getArticlesBySection } from './sanity/queries'
import { i18n } from './i18n'
import ArticleCard from './ArticleCard'
import PortraitCard from './PortraitCard'

export default function SectionPage() {
  const { lang, section } = useParams()
  const [articles, setArticles] = useState([])
  const t = i18n[lang] ?? i18n.en
  const title = t.sections.find(s => s.value === section)?.label

  useEffect(() => {
    getArticlesBySection(lang, section).then(setArticles)
  }, [lang, section])

  return (
    <main className="main">
      <h2 className="page-title">{title}</h2>
      <div className={`articles-grid${section === 'portraits' ? ' articles-grid--portraits' : ''}`}>
        {articles.map((a) => (
          section === 'portraits'
            ? <PortraitCard key={a._id} {...a} />
            : <ArticleCard key={a._id} {...a} />
        ))}
      </div>
    </main>
  )
}
