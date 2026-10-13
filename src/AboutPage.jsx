import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getAboutPage } from './sanity/queries'
import { i18n } from './i18n'
import { ArticleHeading, ArticleText } from './ArticlePage'
import { readingMinutes } from './readingMinutes'

// A Propos, set like an article, as in the app (mobile/src/app/[lang]/a-propos.js):
// a fixed heading (category, byline, title, reading time), then the
// `about-<lang>` document's text. The heading is fixed so it shows while the
// text loads.
export default function AboutPage() {
  const { lang } = useParams()
  const t = i18n[lang] ?? i18n.en
  const heading = t.aboutHeading
  const [body, setBody] = useState(null)

  useEffect(() => {
    getAboutPage(lang).then((page) => setBody(page?.body ?? []))
  }, [lang])

  return (
    <main className="article-page article-page--about" lang={lang}>
      <ArticleHeading
        category={heading.category}
        byline={heading.byline}
        title={heading.title}
        readingTime={body?.length ? `${readingMinutes({ body })} min.` : null}
      />
      {body && <ArticleText body={body} />}
    </main>
  )
}
