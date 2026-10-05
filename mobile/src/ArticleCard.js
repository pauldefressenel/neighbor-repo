import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import BalancedText from './BalancedText'
import { APPEAR, Pressed, Rise } from './motion'
import { urlFor } from './sanity'
import { categoryType, colors, fonts, titleType } from './theme'

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

// "9 mai 2026". Spelled out by hand rather than through Intl, whose French
// data isn't guaranteed in the app's JavaScript engine.
export const frenchDate = (iso) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// An article as a centred title page: category, title and excerpt, then the
// illustration, then the byline and date. A portrait (PortraitCard.js) passes
// its animation as `picture`, which goes at the top instead, above the
// category. Inside a list that
// sets AppearContext, it rises all at once (APPEAR.card). (Each part on its
// own beat felt too drawn out.)
export default function ArticleCard({ category, title, excerpt, author, mainImage, imageAspect, publishedAt, picture }) {
  const date = publishedAt ? frenchDate(publishedAt) : null
  return (
    <View>
      <Rise step={APPEAR.card}>
        {/* A portrait's drawing stays still on press, and only the text below
            it shrinks (FadePressable's scaleChildren): moved or scaled, even
            around its own centre, it blurred. */}
        {picture ? <View style={styles.picture}>{picture}</View> : null}
        <Pressed>
          {category ? <Text style={styles.category}>{category}</Text> : null}
          {/* A one-line title wider than 80% of the card goes onto two lines. */}
          <BalancedText style={[styles.title, picture && styles.titleUnderPicture]} maxFill={0.8}>{title}</BalancedText>
          {excerpt ? <BalancedText style={styles.excerpt}>{excerpt}</BalancedText> : null}
          {picture ? null : <Illustration title={title} mainImage={mainImage} imageAspect={imageAspect} />}
          {author ? <Text style={[styles.author, picture && styles.afterExcerpt]}>de {author}</Text> : null}
          {/* Portraits go undated, as on the website. */}
          {date && !picture ? <Text style={styles.date}>{date}</Text> : null}
        </Pressed>
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
  category: {
    ...categoryType,
    textAlign: 'center',
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
  // A narrow column (about 240pt on a phone), so it breaks into short lines.
  excerpt: {
    ...centred,
    paddingHorizontal: 60,
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
  // A portrait's animation, centred, at the top, right above the category.
  picture: {
    alignItems: 'center',
    marginBottom: 10,
  },
  // On a portrait the text sits closer together: the title 6pt nearer the
  // category, the byline 4pt from the excerpt.
  titleUnderPicture: {
    marginTop: -5,
  },
  afterExcerpt: {
    marginTop: 4,
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
