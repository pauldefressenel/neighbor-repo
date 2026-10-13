import { useState, useEffect, useRef } from 'react'
import { AppearContext } from './appear'
import { useComeBack } from './fade'
import { useParams } from 'react-router-dom'
import './SectionPage.css'
import { getArticlesBySection } from './sanity/queries'
import { i18n } from './i18n'
import { findRubrique } from './sections'
import ArticleGrid from './ArticleGrid'
import PageTitle from './PageTitle'

export default function SectionPage() {
  const { lang, section } = useParams()
  // null until fetched: the page holds the footer out of view till then.
  const [articles, setArticles] = useState(null)
  // When the page opened, for its build-up (appear.js).
  const [since] = useState(() => performance.now())
  // Come back to from an article, it shows at once where it was left.
  const main = useRef(null)
  const { returning, style } = useComeBack(main, articles != null)
  const t = i18n[lang] ?? i18n.en
  const title = t.sections.find(s => s.value === section)?.label

  useEffect(() => {
    getArticlesBySection(lang, findRubrique(section)?.sanity ?? []).then(setArticles)
  }, [lang, section])

  return (
    <AppearContext.Provider value={returning ? null : since}>
      <main className={`main${articles ? '' : ' main--loading'}`} ref={main} style={style}>
        <PageTitle>{title}</PageTitle>
        <ArticleGrid articles={articles ?? []} />
      </main>
    </AppearContext.Provider>
  )
}
