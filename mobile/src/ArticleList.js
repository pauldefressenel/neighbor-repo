import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { useScrollToTop } from 'expo-router/react-navigation'
import { useReducedMotion } from 'react-native-reanimated'
import ArticleCard from './ArticleCard'
import Dinkus from './Dinkus'
import PortraitCard from './PortraitCard'
import { APPEAR, AppearContext, RiseLines, Rise } from './motion'
import Rule from './Rule'
import { i18n } from './i18n'
import { colors, fonts, rubriquesTitle } from './theme'

// The article layout shared by En Couverture and every rubrique: a title over
// a column of article cards with a line between each two, and pull to
// refresh. The title sits where the Rubriques list's does, and the page builds
// up as it appears (APPEAR in motion.js). `fetchArticles` must be stable
// (useCallback).
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
      // to rise in. Two portraits in a row are set apart by space alone, as on the site.
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
          <Rise step={APPEAR.dinkus} style={styles.dinkus}>
            <Dinkus />
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
          <ActivityIndicator style={styles.center} color={colors.ink} />
        ) : null
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.ink} />}
    />
  )
}

// The page title (rubriquesTitle's marginTop above it), then the dinkus that
// closes it before the first card: 36pt from the title's letters to the
// dinkus, and 36pt again from the dinkus to the first category (measured).
const titleStyle = { ...rubriquesTitle, marginBottom: 22.7 }

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  dinkus: {
    marginBottom: 17,
  },
  // The line sits 42pt below the date above it and 42pt above the next
  // category, measured to the letters: the fonts' own line boxes already
  // hold 6.3pt and 4.1pt of that.
  separator: {
    marginTop: 35.7,
    marginBottom: 37.9,
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
