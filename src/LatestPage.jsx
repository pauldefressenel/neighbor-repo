import { useState, useEffect } from 'react'
import { AppearContext } from './appear'
import { useParams } from 'react-router-dom'
import { getLatestArticles } from './sanity/queries'
import { i18n } from './i18n'
import ArticleGrid from './ArticleGrid'
import PageTitle from './PageTitle'
import './SectionPage.css'

export default function LatestPage() {
  const { lang } = useParams()
  const [articles, setArticles] = useState([])
  // When the page opened, for its build-up (appear.js).
  const [since] = useState(() => performance.now())
  const t = i18n[lang] ?? i18n.en

  useEffect(() => {
    getLatestArticles(lang).then(setArticles)
  }, [lang])

  return (
    <AppearContext.Provider value={since}>
      <main className="main">
        <PageTitle>{t.latest}</PageTitle>
        <ArticleGrid articles={articles} />
      </main>
    </AppearContext.Provider>
  )
}
