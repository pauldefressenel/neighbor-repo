import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { urlFor } from './sanity'
import { colors, fonts } from './theme'

// The website's phone layout of a card (src/ArticleCard.css below 700px).
export default function ArticleCard({ category, title, excerpt, author, mainImage }) {
  return (
    <View style={styles.card}>
      {mainImage
        ? <Image style={styles.image} source={urlFor(mainImage).width(1200).url()} contentFit="cover" accessibilityLabel={title} transition={200} />
        : <View style={[styles.image, styles.placeholder]} />
      }
      {category ? <Text style={styles.category}>{category}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {excerpt ? <Text style={styles.excerpt}>{excerpt}</Text> : null}
      {author ? <Text style={styles.author}>{author}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    paddingBottom: 30,
  },
  image: {
    width: '80%',
    aspectRatio: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  placeholder: {
    backgroundColor: colors.placeholder,
  },
  category: {
    fontFamily: fonts.monoBold,
    fontSize: 16,
    color: colors.red,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 4,
    fontFamily: fonts.neighborMedium,
    fontSize: 27,
    lineHeight: 30,
    letterSpacing: -0.8,
    color: colors.ink,
  },
  excerpt: {
    marginTop: 5,
    fontFamily: fonts.garamond,
    fontSize: 20,
    lineHeight: 22,
    color: colors.ink,
  },
  author: {
    marginTop: 7,
    fontFamily: fonts.garamondMedium,
    fontSize: 20,
    lineHeight: 22,
    color: colors.ink,
  },
})
