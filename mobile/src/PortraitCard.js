import { StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import ArticleCard from './ArticleCard'
import PortraitAnimation, { PORTRAIT_SCALE, PORTRAIT_SIZE, hasPortrait } from './PortraitAnimation'
import { portraitInk } from '../../src/portraits'
import { urlFor } from './sanity'

// A portrait: the same card as every other article (ArticleCard.js), with the
// website's animated portrait (Framer's Portrait Vignette) first, then the
// category, title and excerpt, and the author and date at the bottom left
// (`pictureFirst`). (It was first the website's own portrait card, then the
// other articles' order, the drawing where the illustration goes.)
export default function PortraitCard(props) {
  const { title, mainImage, slug } = props
  const picture = hasPortrait(slug?.current)
    ? <PortraitAnimation slug={slug.current} alt={title} />
    // A portrait without an animation shows its whole drawing instead.
    : <Image style={styles.still} source={mainImage ? urlFor(mainImage).width(330).url() : null} contentFit="contain" accessibilityLabel={title} />
  // The figure's own empty room above and below at the drawn size, for the
  // card to take away from the gap around it (portraitInk, the website's too).
  const ink = portraitInk(slug?.current)
  return <ArticleCard {...props} picture={picture} pictureFirst pictureInset={{ top: ink.top * PORTRAIT_SCALE, bottom: ink.bottom * PORTRAIT_SCALE }} />
}

const styles = StyleSheet.create({
  still: {
    width: PORTRAIT_SIZE,
    height: PORTRAIT_SIZE,
  },
})
