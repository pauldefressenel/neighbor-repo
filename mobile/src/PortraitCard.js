import { StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import ArticleCard from './ArticleCard'
import PortraitAnimation, { PORTRAIT_SIZE, hasPortrait } from './PortraitAnimation'
import { urlFor } from './sanity'

// A portrait: the same card as every other article (ArticleCard.js), with the
// website's animated portrait (Framer's Portrait Vignette) where the
// illustration goes. (It used to be the website's own portrait card, a 300px
// column in its own sizes, which sat apart from the other rubriques.)
export default function PortraitCard(props) {
  const { title, mainImage, slug } = props
  const picture = hasPortrait(slug?.current)
    ? <PortraitAnimation slug={slug.current} alt={title} />
    // A portrait without an animation shows its whole drawing instead.
    : <Image style={styles.still} source={mainImage ? urlFor(mainImage).width(330).url() : null} contentFit="contain" accessibilityLabel={title} />
  return <ArticleCard {...props} picture={picture} />
}

const styles = StyleSheet.create({
  still: {
    width: PORTRAIT_SIZE,
    height: PORTRAIT_SIZE,
  },
})
