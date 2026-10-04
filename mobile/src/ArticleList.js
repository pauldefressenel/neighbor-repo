import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { useScrollToTop } from 'expo-router/react-navigation'
import ArticleCard from './ArticleCard'
import { Separator } from './River'
import { pickRivers } from './rivers'
import { i18n } from './i18n'
import { colors, fonts, pageTitle } from './theme'

// A page title over a column of article cards, with pull to refresh. Used by
// A La Une and by each rubrique. `fetchArticles` must be stable (useCallback).
export default function ArticleList({ lang, title, fetchArticles }) {
  const t = i18n[lang] ?? i18n.en
  const [articles, setArticles] = useState(null)
  const [failed, setFailed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  // Tapping the current tab again scrolls back to the top.
  const list = useRef(null)
  useScrollToTop(list)

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

  // New river shapes each time the articles load.
  const rivers = useMemo(() => pickRivers(articles?.length ?? 0), [articles])

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
      renderItem={({ item }) => <ArticleCard {...item} />}
      ItemSeparatorComponent={({ leadingItem }) => <Separator index={articles.indexOf(leadingItem)} shapes={rivers} />}
      ListHeaderComponent={<Text style={pageTitle}>{title}</Text>}
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

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.paper,
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
