import { Link } from 'react-router-dom'
import { urlFor } from './sanity/client'
import { rubriqueOf } from './sections'
import './ArticleCard.css'

export default function ArticleCard({ category, title, excerpt, author, mainImage, slug, language, section }) {
  return (
    <Link className="article-card" to={`/${language}/${rubriqueOf(section)}/${slug.current}`}>
      {mainImage
        ? <img className="article-image" src={urlFor(mainImage).width(1200).url()} alt={title} />
        : <div className="article-image article-image--placeholder" />
      }
      <p className="article-category">{category}</p>
      <h2 className="article-title">{title}</h2>
      <p className="article-description">{excerpt}</p>
      <p className="article-author">{author}</p>
    </Link>
  )
}
