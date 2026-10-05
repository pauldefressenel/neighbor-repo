import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import BalancedText from './BalancedText'
import { APPEAR, Rise } from './motion'
import { urlFor } from './sanity'
import { colors, fonts, titleType } from './theme'

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

// "9 mai 2026". Spelled out by hand rather than through Intl, whose French
// data isn't guaranteed in the app's JavaScript engine.
const frenchDate = (iso) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// An article as a centred title page: category, title and excerpt, then the
// illustration, then the byline and date. Portraits have their own card
// (PortraitCard.js). Inside a list that sets
// AppearContext, its parts rise in one after another.
export default function ArticleCard({ category, title, excerpt, author, mainImage, imageAspect, publishedAt }) {
  const date = publishedAt ? frenchDate(publishedAt) : null
  return (
    <View>
      <Rise step={APPEAR.top}>
        {category ? <Text style={styles.category}>{category}</Text> : null}
        {/* A one-line title wider than 80% of the card goes onto two lines. */}
        <BalancedText style={styles.title} maxFill={0.8}>{title}</BalancedText>
      </Rise>
      <Rise step={APPEAR.bottom}>
        {excerpt ? <BalancedText style={styles.excerpt}>{excerpt}</BalancedText> : null}
      </Rise>
      <Rise step={APPEAR.image}>
        <Illustration title={title} mainImage={mainImage} imageAspect={imageAspect} />
      </Rise>
      <Rise step={APPEAR.bottom}>
        {author ? <Text style={styles.author}>de {author}</Text> : null}
        {date ? <Text style={styles.date}>{date}</Text> : null}
      </Rise>
    </View>
  )
}

// The vignettes' shared proportions (about 1818×572), for the placeholder.
const VIGNETTE_ASPECT = 1818 / 572

function Illustration({ title, mainImage, imageAspect }) {
  if (!mainImage) return <View style={[styles.image, styles.placeholder, { aspectRatio: VIGNETTE_ASPECT }]} />
  // Full width, and as tall as the drawing's own proportions make it
  // (from Sanity's metadata), so nothing is cropped.
  return <Image style={[styles.image, { aspectRatio: imageAspect ?? VIGNETTE_ASPECT }]} source={urlFor(mainImage).width(1200).url()} contentFit="contain" accessibilityLabel={title} transition={200} />
}

const centred = { textAlign: 'center', color: colors.ink }

const styles = StyleSheet.create({
  // 18pt, -0.05em letter-spacing, 1.1em line height.
  category: {
    ...centred,
    fontFamily: fonts.averia,
    fontSize: 18,
    lineHeight: 18 * 1.1,
    letterSpacing: 18 * -0.05,
    color: colors.red,
    textTransform: 'uppercase',
  },
  // The page title's type (titleType).
  title: {
    ...titleType,
    textAlign: 'center',
    // 15pt from the category's letters to the title's (measured): the
    // padding below and both line boxes already hold 14 of it.
    marginTop: 1,
    // A 1.1em line box is barely taller than NeighborFont's letters, and iOS
    // clips to the box: the padding gives the tops of the first line and the
    // descenders of the last somewhere to go.
    paddingTop: 8,
    paddingBottom: 4,
  },
  excerpt: {
    ...centred,
    paddingHorizontal: 12,
    fontFamily: fonts.garamond,
    fontSize: 20,
    lineHeight: 20 * 1.1,
    letterSpacing: 0,
  },
  image: {
    width: '100%',
    alignSelf: 'center',
    marginVertical: 22,
  },
  placeholder: {
    backgroundColor: colors.placeholder,
  },
  author: {
    ...centred,
    fontFamily: fonts.garamondMedium,
    fontSize: 21,
    lineHeight: 24,
  },
  // The author's size, in a lighter italic.
  date: {
    ...centred,
    fontFamily: fonts.garamondItalic,
    fontSize: 21,
    lineHeight: 24,
  },
})
