import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { useScrollToTop } from 'expo-router/react-navigation'
import { useReducedMotion } from 'react-native-reanimated'
import ArticleCard from './ArticleCard'
import { APPEAR, AppearContext, RiseLines, Rise } from './motion'
import Rule from './Rule'
import { i18n } from './i18n'
import { colors, fonts, pageTitle, rubriquesTitle } from './theme'

// The article layout shared by A La Une and every rubrique: an underlined
// title over a column of article cards, with pull to refresh. The title sits
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
          <ArticleCard {...item} />
        </AppearContext.Provider>
      )}
      // The masthead's line between two cards, the last part of the one above
      // to rise in.
      ItemSeparatorComponent={({ leadingItem }) => (
        <AppearContext.Provider value={appearFor(articles.indexOf(leadingItem))}>
          <Rise step={APPEAR.line} style={styles.separator}>
            <Rule />
          </Rise>
        </AppearContext.Provider>
      )}
      ListHeaderComponent={
        <AppearContext.Provider value={appearFor(0)}>
          <UnderlinedTitle style={titleStyle}>{title}</UnderlinedTitle>
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
const titleStyle = { ...rubriquesTitle, marginBottom: pageTitle.marginBottom }

// The title shrink-wrapped and centred, so the rule under it is exactly as
// wide as the text. The space below moves from the title to the pair.
function UnderlinedTitle({ style, children }) {
  const { marginBottom, ...title } = StyleSheet.flatten(style)
  return (
    <View style={{ alignSelf: 'center', marginBottom }}>
      <RiseLines style={title}>{children}</RiseLines>
      {/* Tucked up into the room the title keeps for its descenders. */}
      <Rise step={APPEAR.underline} style={{ marginTop: -2 }}>
        <Rule weight={1.4} round />
      </Rise>
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  separator: {
    marginVertical: 30,
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
