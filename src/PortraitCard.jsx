import ArticleCard from './ArticleCard'
import PortraitAnimation from './PortraitAnimation'
import { urlFor } from './sanity/client'
import { hasPortraitAnimation } from './portraits'
import './PortraitCard.css'

// A portrait: the same card as every other article, with the animated
// portrait (Framer's Portrait Vignette) at the top, as in the app
// (mobile/src/PortraitCard.js).
export default function PortraitCard(props) {
  const { title, mainImage, slug } = props
  const picture = hasPortraitAnimation(slug.current)
    ? <PortraitAnimation slug={slug.current} alt={title} />
    // A portrait without an animation shows its whole drawing instead.
    : <div className="portrait-slot">
        {mainImage && <img className="portrait-still" src={urlFor(mainImage).width(220).url()} alt={title} />}
      </div>
  return <ArticleCard {...props} picture={picture} />
}
