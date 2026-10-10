import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import './SectionPage.css'
import { getArticlesBySection } from './sanity/queries'
import { i18n } from './i18n'
import { findRubrique } from './sections'
import ArticleGrid from './ArticleGrid'
import PageTitle from './PageTitle'

export default function SectionPage() {
  const { lang, section } = useParams()
  const [articles, setArticles] = useState([])
  const t = i18n[lang] ?? i18n.en
  const title = t.sections.find(s => s.value === section)?.label

  useEffect(() => {
    getArticlesBySection(lang, findRubrique(section)?.sanity ?? []).then(setArticles)
  }, [lang, section])

  return (
    <main className="main">
      <PageTitle>{title}</PageTitle>
      {section === 'portraits' && <p className="page-subtitle">{t.portraitsSubtitle}</p>}
      <ArticleGrid articles={articles} />
    </main>
  )
}
