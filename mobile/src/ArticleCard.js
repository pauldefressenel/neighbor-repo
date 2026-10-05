import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import BalancedText from './BalancedText'
import PortraitAnimation, { PORTRAIT_SCALE, hasPortrait } from './PortraitAnimation'
import { APPEAR, Rise } from './motion'
import { urlFor } from './sanity'
import { colors, fonts } from './theme'

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

// "9 mai 2026". Spelled out by hand rather than through Intl, whose French
// data isn't guaranteed in the app's JavaScript engine.
const frenchDate = (iso) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// An article as a centred title page: category, title and excerpt, then the
// illustration, then the byline and date. A portrait's illustration is its
// animated sprite (or, without one, the whole drawing in a square) rather
// than a 2:1 crop. Inside a list that sets
// AppearContext, its parts rise in one after another.
export default function ArticleCard({ category, title, excerpt, author, mainImage, publishedAt, slug, section }) {
  const date = publishedAt ? frenchDate(publishedAt) : null
  return (
    <View style={styles.card}>
      <Rise step={APPEAR.top}>
        {category ? <Text style={styles.category}>{category}</Text> : null}
        <BalancedText style={styles.title}>{title}</BalancedText>
      </Rise>
      <Rise step={APPEAR.bottom}>
        {excerpt ? <Text style={styles.excerpt}>{excerpt}</Text> : null}
      </Rise>
      <Rise step={APPEAR.image}>
        <Illustration title={title} mainImage={mainImage} slug={slug?.current} section={section} />
      </Rise>
      <Rise step={APPEAR.bottom}>
        {author ? <Text style={styles.author}>de {author}</Text> : null}
        {date ? <Text style={styles.date}>{date}</Text> : null}
      </Rise>
    </View>
  )
}

function Illustration({ title, mainImage, slug, section }) {
  if (hasPortrait(slug)) {
    return <View style={styles.portrait}><PortraitAnimation slug={slug} alt={title} /></View>
  }
  if (!mainImage) return <View style={[styles.image, styles.placeholder]} />
  return section === 'portraits'
    ? <Image style={[styles.portrait, styles.portraitStill]} source={urlFor(mainImage).width(400).url()} contentFit="contain" accessibilityLabel={title} transition={200} />
    : <Image style={styles.image} source={urlFor(mainImage).width(1200).url()} contentFit="cover" accessibilityLabel={title} transition={200} />
}

const centred = { textAlign: 'center', color: colors.ink }

const styles = StyleSheet.create({
  card: {
    paddingVertical: 10,
  },
  category: {
    ...centred,
    fontFamily: fonts.newAmsterdam,
    fontSize: 21,
    letterSpacing: 1.2,
    color: colors.red,
    textTransform: 'uppercase',
  },
  title: {
    ...centred,
    marginTop: 8,
    // A 0.9em line box is shorter than NeighborFont's letters, and iOS clips
    // to the box: the padding gives the tops of the first line and the
    // descenders of the last somewhere to go.
    paddingTop: 8,
    paddingBottom: 4,
    fontFamily: fonts.neighbor,
    fontSize: 36,
    lineHeight: 36 * 0.9,
    letterSpacing: 36 * -0.03,
  },
  excerpt: {
    ...centred,
    marginTop: 6,
    paddingHorizontal: 12,
    fontFamily: fonts.garamond,
    fontSize: 20,
    lineHeight: 20 * 1.1,
    letterSpacing: 0,
  },
  image: {
    width: '85%',
    aspectRatio: 2,
    alignSelf: 'center',
    marginVertical: 30,
  },
  placeholder: {
    backgroundColor: colors.placeholder,
  },
  portrait: {
    alignSelf: 'center',
    marginVertical: 30,
  },
  portraitStill: {
    width: 110 * PORTRAIT_SCALE,
    height: 110 * PORTRAIT_SCALE,
  },
  author: {
    ...centred,
    fontFamily: fonts.garamondMedium,
    fontSize: 21,
    lineHeight: 24,
  },
  // The author's type, in italic.
  date: {
    ...centred,
    fontFamily: fonts.garamondMediumItalic,
    fontSize: 21,
    lineHeight: 24,
  },
})
