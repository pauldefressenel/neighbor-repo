import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import { getAboutPage } from './sanity/queries'
import { urlFor } from './sanity/client'
import './AboutPage.css'

// Mirrors Framer's About page: title, paragraphs in the article column, then
// the founders' pixel avatars. Content is the `about-<lang>` Sanity document.
export default function AboutPage() {
  const { lang } = useParams()
  const [page, setPage] = useState(null)

  useEffect(() => {
    getAboutPage(lang).then(setPage)
  }, [lang])

  if (!page) return null

  return (
    <main className="about-page">
      <h1 className="page-title">{page.title}</h1>
      <div className="about-body">
        <PortableText value={page.body} />
      </div>
      {page.founders?.length > 0 && (
        <div className="about-founders">
          {page.founders.map(({ _key, name, image }) => (
            <figure key={_key} className="about-founder">
              {image && <img src={urlFor(image).height(144).url()} alt={name} draggable="false" />}
              <figcaption>{name}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </main>
  )
}
