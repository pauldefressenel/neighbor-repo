import { useCallback, useEffect, useRef, useState } from 'react'
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useScrollToTop } from 'expo-router/react-navigation'
import { useReducedMotion } from 'react-native-reanimated'
import ArticleCard from './ArticleCard'
import LateSpinner from './LateSpinner'
import PortraitCard from './PortraitCard'
import { APPEAR, AppearContext, CARD_PRESS, FadePressable, RiseLines, Rise } from './motion'
import Rule from './Rule'
import { i18n } from './i18n'
import { openArticle } from './sanity'
import { titleMark } from '../../shared/tokens'
import { colors, fonts, rubriquesTitle } from './theme'

// The article layout shared by En Couverture and every rubrique: a title over
// a column of article cards with a line between each two, and pull to
// refresh. The title sits where the Rubriques list's does, and the page builds
// up as it appears (APPEAR in motion.js). `fetchArticles` must be stable
// (useCallback). Tapping a card opens `articleHref(article)`.
export default function ArticleList({ lang, title, fetchArticles, articleHref }) {
  const t = i18n[lang] ?? i18n.en
  const [articles, setArticles] = useState(null)
  const [failed, setFailed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  // Tapping the current tab again scrolls back to the top.
  const list = useRef(null)
  useScrollToTop(list)
  const mounted = useRef(Date.now()).current
  const reduceMotion = useReducedMotion()
  const appearFor = (index) => ({ since: mounted, still: reduceMotion || index >= APPEAR.max })

  // One article per tap: further taps are ignored until the list is back in
  // focus, so quick double taps can't stack two articles.
  const opening = useRef(false)
  useFocusEffect(useCallback(() => { opening.current = false }, []))
  // The scroll bar hides as soon as an article starts sliding over the list.
  // iOS shows it for a moment whenever the list grows, as it does when the
  // articles and their images first arrive, and it slid out with the list.
  const [focused, setFocused] = useState(true)
  useFocusEffect(
    useCallback(() => {
      setFocused(true)
      return () => setFocused(false)
    }, []),
  )
  const open = (article) => {
    if (opening.current || !article.slug?.current) return
    opening.current = true
    openArticle(article)
    router.navigate(articleHref(article))
  }

  const load = useCallback(async () => {
    setFailed(false)
    try {
      setArticles(await fetchArticles())
    } catch {
      setFailed(true)
    }
  }, [fetchArticles])

  useEffect(() => {
    setArticles(null)
    load()
  }, [load])

  // The masthead's line between two cards, the last part of the one above
  // to rise in, between portraits too. Kept as one component across renders: written inline, it was a new
  // component on every render (coming back to the tab is one), so every line
  // was remounted and rose in again. It reads the articles through a ref so
  // a pull to refresh doesn't make it new either.
  const latest = useRef(articles)
  latest.current = articles
  const Separator = useCallback(
    ({ leadingItem }) => {
      const index = latest.current.indexOf(leadingItem)
      return (
        <AppearContext.Provider value={{ since: mounted, still: reduceMotion || index >= APPEAR.max }}>
          <Rise step={APPEAR.line} style={styles.separator}>
            <Rule />
          </Rise>
        </AppearContext.Provider>
      )
    },
    [mounted, reduceMotion],
  )

  const refresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  return (
    <FlatList
      ref={list}
      style={styles.list}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={focused}
      data={articles ?? []}
      keyExtractor={(a) => a._id}
      renderItem={({ item, index }) => (
        <AppearContext.Provider value={appearFor(index)}>
          <FadePressable onPress={() => open(item)} pressScale={CARD_PRESS.scale} pressOpacity={CARD_PRESS.opacity} timing={CARD_PRESS} scaleChildren={item.section === 'portraits'} accessibilityRole="link" accessibilityLabel={item.title}>
            {item.section === 'portraits' ? <PortraitCard {...item} /> : <ArticleCard {...item} />}
          </FadePressable>
        </AppearContext.Provider>
      )}
      ItemSeparatorComponent={Separator}
      ListHeaderComponent={
        <AppearContext.Provider value={appearFor(0)}>
          <RiseLines style={titleStyle}>{title}</RiseLines>
          <Rise step={APPEAR.titleMark} style={styles.titleMark}>
            <Text style={styles.asterisk} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">*</Text>
          </Rise>
        </AppearContext.Provider>
      }
      ListEmptyComponent={
        failed ? (
          <View style={styles.center}>
            <Text style={styles.message}>{t.error}</Text>
            <Pressable onPress={load} accessibilityRole="button">
              <Text style={styles.retry}>{t.retry}</Text>
            </Pressable>
          </View>
        ) : articles === null ? (
          <LateSpinner style={styles.center} />
        ) : null
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.ink} />}
    />
  )
}

// The page title (rubriquesTitle's marginTop above it), then the asterisk
// that closes it before the first card, centred (titleMark in
// shared/tokens.js, the website's too; three asterisks, then a short drawn
// line, came first): `above` between the title's box and the asterisk's,
// `below` between the asterisk's and the first card's.
const titleStyle = { ...rubriquesTitle, marginBottom: titleMark.above }

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  titleMark: {
    alignSelf: 'center',
    marginBottom: titleMark.below,
  },
  // A full line box: iOS clips a glyph to its box, and the asterisk sits at
  // the top of it.
  asterisk: {
    fontFamily: fonts.averiaSerif,
    fontSize: titleMark.size,
    lineHeight: titleMark.size,
    color: colors.ink,
  },
  // The line sits 54pt below the date above it and 54pt above the next
  // category, measured to the letters: the fonts' own line boxes already
  // hold 6.3pt and 4.1pt of that. (It was 42pt.)
  separator: {
    marginTop: 47.7,
    marginBottom: 49.9,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  retry: {
    fontFamily: fonts.garamond,
    fontSize: 20,
    color: colors.ink,
  },
  center: {
    marginTop: 60,
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
