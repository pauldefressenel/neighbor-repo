import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { useScrollToTop } from 'expo-router/react-navigation'
import { useReducedMotion } from 'react-native-reanimated'
import ArticleCard from './ArticleCard'
import PortraitCard from './PortraitCard'
import { APPEAR, AppearContext, RiseLines, Rise } from './motion'
import Rule from './Rule'
import { i18n } from './i18n'
import { colors, fonts, rubriquesTitle } from './theme'

// The article layout shared by A La Une and every rubrique: a title over a
// column of article cards, each with a line above it, with pull to refresh. The title sits
// where the Rubriques list's does, and the page builds up as it appears
// (APPEAR in motion.js). `fetchArticles` must be stable (useCallback).
export default function ArticleList({ lang, title, fetchArticles }) {
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
      data={articles ?? []}
      keyExtractor={(a) => a._id}
      renderItem={({ item, index }) => (
        <AppearContext.Provider value={appearFor(index)}>
          {item.section === 'portraits' ? <PortraitCard {...item} /> : <ArticleCard {...item} />}
        </AppearContext.Provider>
      )}
      // The masthead's line between two cards, the last part of the one above
      // to rise in.
      // Two portraits in a row are set apart by space alone, as on the site.
      ItemSeparatorComponent={({ leadingItem }) => {
        const index = articles.indexOf(leadingItem)
        if (leadingItem.section === 'portraits' && articles[index + 1]?.section === 'portraits') {
          return <View style={styles.portraitGap} />
        }
        return (
          <AppearContext.Provider value={appearFor(index)}>
            <Rise step={APPEAR.line} style={styles.separator}>
              <Rule />
            </Rise>
          </AppearContext.Provider>
        )
      }}
      ListHeaderComponent={
        <AppearContext.Provider value={appearFor(0)}>
          <RiseLines style={titleStyle}>{title}</RiseLines>
          {/* The first card gets the line every other card has above it.
              Portraits are set apart by space alone, so they get none. */}
          {articles?.length && articles[0].section !== 'portraits' ? (
            <Rise step={APPEAR.firstLine} style={styles.firstSeparator}>
              <Rule />
            </Rise>
          ) : null}
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
          <ActivityIndicator style={styles.center} color={colors.ink} />
        ) : null
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.ink} />}
    />
  )
}

// The Rubriques list's title, with the usual space down to the first card.
// The title, centred between the masthead's rule and the line above the
// first card (with rubriquesTitle's marginTop).
const titleStyle = { ...rubriquesTitle, marginBottom: 39.5 }

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  // Less room below the line than above it, so the next card's category
  // sits midway between the line and its title (with ArticleCard's title
  // margin).
  separator: {
    marginTop: 30,
    marginBottom: 17,
  },
  // The title keeps its own space below; the line under it matches the
  // others' room below, so the first category is centred the same way.
  firstSeparator: {
    marginBottom: 17,
  },
  // The website's row gap between portraits on phones.
  portraitGap: {
    height: 90,
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
