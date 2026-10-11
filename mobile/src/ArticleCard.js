import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { useGlobalSearchParams } from 'expo-router'
import { longDate } from '../../shared/dates'
import { card, type } from '../../shared/tokens'
import BalancedText from './BalancedText'
import { i18n } from './i18n'
import { APPEAR, Pressed, Rise } from './motion'
import { urlFor } from './sanity'
import { categoryType, colors, fonts, titleType } from './theme'

// "9 mai 2026" / "May 9, 2026", as on the website (shared/dates.js).
export const articleDate = (iso, lang) => longDate(iso, lang === 'en' ? 'en' : 'fr')

// An article as a centred title page: category, title and excerpt, then the
// illustration, then the byline and date. A portrait (PortraitCard.js) passes
// its animation as `picture`, which takes the illustration's place (it was
// at the top, above the category, which ran all the text together). Inside a
// list that
// sets AppearContext, it rises all at once (APPEAR.card). (Each part on its
// own beat felt too drawn out.)
export default function ArticleCard({ category, title, excerpt, author, mainImage, publishedAt, picture, pictureInset }) {
  const { lang } = useGlobalSearchParams()
  const t = i18n[lang] ?? i18n.fr
  const date = publishedAt ? articleDate(publishedAt, lang) : null
  return (
    <View>
      <Rise step={APPEAR.card}>
        <Pressed>
          {category ? <Text style={styles.category}>{category}</Text> : null}
          {/* A one-line title wider than 80% of the card goes onto two lines. */}
          <BalancedText style={styles.title} maxFill={card.titleMaxFill}>{title}</BalancedText>
          {excerpt ? <BalancedText style={styles.excerpt}>{excerpt}</BalancedText> : null}
        </Pressed>
        {/* A portrait's drawing takes the illustration's place, as on the
            website's phones, and stays still on press while the text above
            and below it shrinks (FadePressable's scaleChildren): moved or
            scaled, even around its own centre, it blurred. */}
        {picture ? (
          <View
            style={[
              styles.picture,
              pictureInset && {
                marginTop: card.imageGap - GARAMOND_RISE - pictureInset.top,
                marginBottom: card.imageGap + GARAMOND_RISE - pictureInset.bottom,
              },
            ]}
          >
            {picture}
          </View>
        ) : (
          <Pressed>
            <Illustration title={title} mainImage={mainImage} />
          </Pressed>
        )}
        <Pressed>
          {author ? <Text style={styles.author}>{t.by} {author}</Text> : null}
          {date ? <Text style={styles.date}>{date}</Text> : null}
        </Pressed>
      </Rise>
    </View>
  )
}

// iOS sets EB Garamond about 1.5pt higher in its line than a browser does,
// so the excerpt above an illustration looked further from it and the byline
// below nearer than on the website (measured ink to ink, 1.7 and 1.4pt on a
// portrait, 2 and 1pt on an illustration). The illustration, or a
// portrait's drawing, sits that much higher to match.
const GARAMOND_RISE = 1.5

// Every illustration gets the same box, as on the website: the card's width,
// at the vignettes' shared proportions (card.illustrationAspect). A few
// vignettes are taller; they are scaled down to fit inside it rather than
// cropped.
function Illustration({ title, mainImage }) {
  if (!mainImage) return <View style={[styles.image, styles.placeholder]} />
  return <Image style={styles.image} source={urlFor(mainImage).width(1200).url()} contentFit="contain" accessibilityLabel={title} transition={200} />
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
  // The card's width less card.excerptInset each side (shared/tokens.js).
  excerpt: {
    ...centred,
    paddingHorizontal: card.excerptInset,
    fontFamily: fonts.garamond,
    fontSize: type.excerpt.size,
    lineHeight: type.excerpt.size * type.excerpt.leading,
    letterSpacing: 0,
  },
  image: {
    width: '100%',
    aspectRatio: card.illustrationAspect,
    alignSelf: 'center',
    marginTop: card.imageGap - GARAMOND_RISE,
    marginBottom: card.imageGap + GARAMOND_RISE,
  },
  // A portrait's animation, centred, in the illustration's place, with the
  // same room above and below the figure itself (less the room it leaves in
  // its slot, `pictureInset`).
  picture: {
    alignItems: 'center',
    marginTop: card.imageGap - GARAMOND_RISE,
    marginBottom: card.imageGap + GARAMOND_RISE,
  },
  placeholder: {
    backgroundColor: colors.placeholder,
  },
  author: {
    ...centred,
    fontFamily: fonts.garamondMedium,
    fontSize: type.byline.size,
    lineHeight: type.byline.lineHeight,
  },
  // The author's size, in a lighter italic.
  date: {
    ...centred,
    fontFamily: fonts.garamondItalic,
    fontSize: type.byline.size,
    lineHeight: type.byline.lineHeight,
  },
})
