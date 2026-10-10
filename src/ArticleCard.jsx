import { Link } from 'react-router-dom'
import { i18n } from './i18n'
import Rule from './Rule'
import { urlFor } from './sanity/client'
import { rubriqueOf } from './sections'
import './ArticleCard.css'

// "9 mai 2026" / "May 9, 2026". Dates are stored at UTC midnight, so format
// in UTC or a westward timezone renders the previous day.
const longDate = (iso, lang) =>
  new Date(iso).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })

// The app's card (mobile/src/ArticleCard.js): a centred title page with the
// category, title and excerpt, then the illustration, then the byline and
// date. A portrait (PortraitCard.jsx) passes its animation as `picture`,
// which goes at the top instead and leaves the card undated. The rule above
// the card separates it from the one before (on phones the first card has
// none); on wider screens the first card of each row stretches it across the
// grid (SectionPage.css).
export default function ArticleCard({ category, title, excerpt, author, mainImage, publishedAt, slug, language, section, picture }) {
  const t = i18n[language] ?? i18n.en
  return (
    <Link className={`article-card${picture ? ' article-card--portrait' : ''}`} to={`/${language}/${rubriqueOf(section)}/${slug.current}`}>
      <Rule className="card-rule" />
      {picture && <div className="article-picture">{picture}</div>}
      {category && <p className="article-category">{category}</p>}
      <h2 className="article-title">{title}</h2>
      {excerpt && <p className="article-description">{excerpt}</p>}
      {!picture && (mainImage
        ? <img className="article-image" src={urlFor(mainImage).width(1200).url()} alt={title} />
        : <div className="article-image article-image--placeholder" />
      )}
      {author && <p className="article-author">{t.by} {author}</p>}
      {publishedAt && !picture && <p className="article-date">{longDate(publishedAt, language)}</p>}
    </Link>
  )
}
