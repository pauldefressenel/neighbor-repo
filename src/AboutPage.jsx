import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { getAboutPage } from './sanity/queries'
import { i18n } from './i18n'
import './AboutPage.css'

const WORDS_PER_MINUTE = 200

// "4 min.", from the words in the text.
const readingMinutes = (body) => {
  const words = body
    .flatMap((block) => block.children ?? [])
    .reduce((sum, span) => sum + (span.text?.match(/\S+/g)?.length ?? 0), 0)
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

// A Propos, set like an article, as in the app (mobile/src/app/[lang]/a-propos.js):
// a fixed heading on the left (category, byline, title, reading time), then
// the `about-<lang>` document's text, opening on a drop cap. The heading is
// fixed so it shows while the text loads.
export default function AboutPage() {
  const { lang } = useParams()
  const t = i18n[lang] ?? i18n.en
  const heading = t.aboutHeading
  const [body, setBody] = useState(null)

  useEffect(() => {
    getAboutPage(lang).then((page) => setBody(page?.body ?? []))
  }, [lang])

  return (
    <main className="about-page">
      <div className="about-heading">
        <p className="about-category">{heading.category}</p>
        <p className="about-byline">{heading.byline}</p>
      </div>
      <h1 className="about-title">{heading.title}</h1>
      {/* Held open until the text arrives, so nothing moves when it does. */}
      <p className="about-byline about-reading">{body?.length ? `${readingMinutes(body)} min.` : ' '}</p>
      {body && (
        <div className="about-body">
          <PortableText value={body} />
        </div>
      )}
    </main>
  )
}
