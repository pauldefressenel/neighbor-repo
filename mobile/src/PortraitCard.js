import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import BalancedText from './BalancedText'
import { APPEAR, Rise } from './motion'
import PortraitAnimation, { PORTRAIT_SIZE, hasPortrait } from './PortraitAnimation'
import { urlFor } from './sanity'
import { colors, fonts } from './theme'

// The website's portrait card (src/PortraitCard.jsx, Framer's Portrait
// Vignette): the 110px animation, then a 300px centred column of category,
// title, excerpt and author. Sizes and gaps are the site's.
export default function PortraitCard({ category, title, excerpt, author, mainImage, slug }) {
  return (
    <View style={styles.card}>
      <Rise step={APPEAR.image}>
        {hasPortrait(slug?.current)
          ? <PortraitAnimation slug={slug.current} alt={title} />
          // A portrait without an animation shows its whole drawing instead.
          : <Image style={styles.still} source={mainImage ? urlFor(mainImage).width(330).url() : null} contentFit="contain" accessibilityLabel={title} />}
      </Rise>
      <View style={styles.text}>
        <Rise step={APPEAR.top} style={styles.heading}>
          {category ? <Text style={styles.category}>{category}</Text> : null}
          <Text style={styles.title}>{title}</Text>
        </Rise>
        <Rise step={APPEAR.bottom} style={styles.body}>
          {excerpt ? <BalancedText style={styles.excerpt}>{excerpt}</BalancedText> : null}
          {author ? <Text style={styles.author}>{author}</Text> : null}
        </Rise>
      </View>
    </View>
  )
}

const centred = { textAlign: 'center', color: colors.ink }

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 10,
  },
  still: {
    width: PORTRAIT_SIZE,
    height: PORTRAIT_SIZE,
  },
  text: {
    width: 300,
    maxWidth: '100%',
    gap: 5,
  },
  heading: {
    gap: 4,
  },
  body: {
    gap: 7,
  },
  category: {
    ...centred,
    fontFamily: fonts.averia,
    fontSize: 18,
    letterSpacing: 2,
    color: colors.red,
    textTransform: 'uppercase',
  },
  title: {
    ...centred,
    fontFamily: fonts.neighborMedium,
    fontSize: 27,
    lineHeight: 30,
    letterSpacing: 27 * -0.03,
  },
  excerpt: {
    ...centred,
    fontFamily: fonts.garamond,
    fontSize: 20,
    lineHeight: 22,
  },
  author: {
    ...centred,
    fontFamily: fonts.garamondMedium,
    fontSize: 20,
    lineHeight: 22,
  },
})
