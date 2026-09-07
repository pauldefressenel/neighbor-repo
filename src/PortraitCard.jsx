import { Link } from 'react-router-dom'
import PortraitAnimation from './PortraitAnimation'
import { urlFor } from './sanity/client'
import { hasPortraitAnimation } from './portraits'
import './ArticleCard.css'
import './PortraitCard.css'

// Framer's "Portrait Vignette": a 110px animation slot above a 300px centred
// text block, all centred in the grid cell. Text presets are shared with
// the article card; only the layout differs.
export default function PortraitCard({ category, title, excerpt, author, mainImage, slug, language, section }) {
  return (
    <Link className="portrait-card" to={`/${language}/${section}/${slug.current}`}>
      {hasPortraitAnimation(slug.current)
        ? <PortraitAnimation slug={slug.current} alt={title} />
        : <div className="portrait-slot">
            {mainImage && <img className="portrait-still" src={urlFor(mainImage).width(220).url()} alt={title} />}
          </div>
      }
      <div className="portrait-text">
        <div className="portrait-heading">
          <p className="article-category">{category}</p>
          <h2 className="article-title">{title}</h2>
        </div>
        <div className="portrait-body">
          <p className="article-description">{excerpt}</p>
          <p className="article-author">{author}</p>
        </div>
      </div>
    </Link>
  )
}
