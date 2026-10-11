import ArticleCard from './ArticleCard'
import PortraitAnimation from './PortraitAnimation'
import { urlFor } from './sanity/client'
import { hasPortraitAnimation, portraitInk } from './portraits'
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
  // The figure's own empty room above and below, at the drawn size (100 of
  // the slot's 110), for the card to take away from the gap around it.
  const ink = portraitInk(slug.current)
  const pictureStyle = { '--ink-top': `${(ink.top * 100) / 110}px`, '--ink-bottom': `${(ink.bottom * 100) / 110}px` }
  return <ArticleCard {...props} picture={picture} pictureStyle={pictureStyle} />
}
