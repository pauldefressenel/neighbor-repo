import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from 'expo-router'
import { useScrollToTop } from 'expo-router/react-navigation'
import { useReducedMotion } from 'react-native-reanimated'
import { frenchDate } from './ArticleCard'
import ArticleText, { readingMinutes } from './ArticleText'
import { i18n } from './i18n'
import { APPEAR, AppearContext, Rise } from './motion'
import { articleCard, getArticle } from './sanity'
import { categoryType, colors, fonts, rubriquesTitle } from './theme'

// An article's page, after the website's (src/ArticlePage.jsx and
// ArticlePage.css): the category, "author, date.", the title and the reading
// time, on the left, then the text (ArticleText.js).
// The masthead and its back arrow come from the stack (PageStack.js).
//
// What the card already showed (openArticle in sanity.js) is drawn at once;
// the text follows when it has loaded.
export default function ArticleScreen({ lang, slug }) {
  const t = i18n[lang] ?? i18n.fr
  const [article, setArticle] = useState(() => articleCard(slug))
  const [full, setFull] = useState(false)
  const [failed, setFailed] = useState(false)
  const scroll = useRef(null)
  useScrollToTop(scroll)
  const shown = useRef(Date.now()).current
  const reduceMotion = useReducedMotion()
  const steps = APPEAR.article

  // The scroll bar stays hidden while the page slides in: iOS shows it as the
  // page mounts, and it slid in with the page.
  const navigation = useNavigation()
  const [settled, setSettled] = useState(false)
  useEffect(
    () => navigation.addListener('transitionEnd', (e) => { if (!e.data.closing) setSettled(true) }),
    [navigation],
  )

  const load = useCallback(async () => {
    setFailed(false)
    try {
      const loaded = await getArticle(slug)
      if (!loaded) throw new Error(`No article ${slug}`)
      setArticle(loaded)
      setFull(true)
    } catch {
      setFailed(true)
    }
  }, [slug])
  useEffect(() => {
    load()
  }, [load])

  const date = article?.publishedAt ? frenchDate(article.publishedAt) : null
  // "Anna Canonne, 20 mai 2026." on one line, closed by a full stop.
  const byline = [article?.author, date].filter(Boolean).join(', ')
  const bylineText = byline ? `${byline}.` : ''
  const readingTime = full ? `${readingMinutes(article)} min.` : null

  return (
    <AppearContext.Provider value={{ since: shown, still: reduceMotion }}>
      <ScrollView ref={scroll} style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={settled}>
        {article ? (
          <ArticleHeading category={article.category} byline={bylineText} title={article.title} readingTime={readingTime} />
        ) : null}
        {failed ? (
          <View style={styles.center}>
            <Text style={styles.message}>{t.pageError}</Text>
            <Pressable onPress={load} accessibilityRole="button">
              <Text style={styles.message}>{t.retry}</Text>
            </Pressable>
          </View>
        ) : !full ? (
          <ActivityIndicator style={styles.center} color={colors.ink} />
        ) : (
          <Rise step={steps.body}>
            <ArticleText body={article.body ?? []} poems={article.poems ?? []} />
          </Rise>
        )}
      </ScrollView>
    </AppearContext.Provider>
  )
}

// The block above an article's text, also A Propos's, on the left: the
// category, "author, date." right under it, the title, then the reading time.
// `readingTime` is null until the text has loaded: its line is held open (a
// blank) until then, so nothing moves when it arrives, and it rises with the
// text. (On the category's line, at its right, was tried and rejected.)
export function ArticleHeading({ category, byline, title, readingTime }) {
  const steps = APPEAR.article
  return (
    <>
      <Rise step={steps.heading}>
        {category ? <Text style={styles.category}>{category}</Text> : null}
        {byline ? <Text style={[styles.byline, category ? styles.author : styles.top]}>{byline}</Text> : null}
      </Rise>
      <Rise step={steps.title}>
        <Text style={[styles.title, !category && !byline && styles.titleAlone]}>{title}</Text>
      </Rise>
      {readingTime ? (
        <Rise step={steps.body}>
          <Text style={[styles.byline, styles.readingTime]}>{readingTime}</Text>
        </Rise>
      ) : (
        <Text style={[styles.byline, styles.readingTime]}>{'\u00A0'}</Text>
      )}
    </>
  )
}

// Where an article's heading starts, below the masthead.
export const HEADING_TOP = 60

// An article's title, also A Propos's: 42pt rather than a page title's 35,
// with the same letter spacing and line height, on the left. Its lines fill
// the column, unbalanced (balanced lines were tried first). The 8pt of
// padding is room for accents, which iOS would otherwise clip to
// NeighborFont's tight line box.
const TITLE = 42
export const articleTitle = {
  ...rubriquesTitle,
  fontSize: TITLE,
  lineHeight: TITLE * 1.1,
  letterSpacing: TITLE * -0.03,
  textAlign: 'left',
  paddingTop: 8,
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  // The block above the text (category, byline, title, reading time) is set
  // on the left, unlike the cards and the page titles.
  //
  // The category at the top, further down than a page title sits
  // (rubriquesTitle, 41.5).
  category: {
    ...categoryType,
    textAlign: 'left',
    marginTop: HEADING_TOP,
  },
  // "Author, date." right under the category, or at the top without one.
  author: {
    marginTop: 4,
  },
  top: {
    marginTop: HEADING_TOP,
  },
  title: {
    ...articleTitle,
    marginTop: -2,
    marginBottom: 2,
  },
  // "6 min." under the title, in the byline's type, 48px above the text as on
  // the website. (A dinkus between the two, centred or on the left, was tried
  // and rejected.)
  readingTime: {
    marginBottom: 48,
  },
  // With neither category nor byline, the title takes their place at the top.
  titleAlone: {
    marginTop: HEADING_TOP - 8,
  },
  // The author and the date, at the cards' size (ArticleCard.js) but in
  // regular.
  byline: {
    fontFamily: fonts.garamond,
    fontSize: 21,
    lineHeight: 24,
    color: colors.ink,
    textAlign: 'left',
  },
  center: {
    marginTop: 40,
    alignItems: 'center',
    gap: 12,
  },
  message: {
    fontFamily: fonts.garamond,
    fontSize: 20,
    color: colors.ink,
    textAlign: 'center',
  },
})
