import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { Redirect, router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ArticleCard from '../ArticleCard'
import { getLatestArticles } from '../sanity'
import { i18n } from '../i18n'
import { colors, fonts } from '../theme'

export default function LatestScreen() {
  const { lang } = useLocalSearchParams()
  const insets = useSafeAreaInsets()
  const [articles, setArticles] = useState(null)
  const [failed, setFailed] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    setFailed(false)
    try {
      setArticles(await getLatestArticles(lang))
    } catch {
      setFailed(true)
    }
  }, [lang])

  useEffect(() => {
    setArticles(null)
    load()
  }, [load])

  const refresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const t = i18n[lang]
  if (!t) return <Redirect href="/en" />

  const header = (
    <View>
      <View style={styles.masthead}>
        <Text style={styles.logo}>The Neighbor</Text>
        <Pressable onPress={() => router.replace(`/${t.switchTo}`)} hitSlop={12} accessibilityRole="button">
          <Text style={styles.switch}>{i18n[t.switchTo].language}</Text>
        </Pressable>
      </View>
      <Text style={styles.pageTitle}>{t.latest}</Text>
    </View>
  )

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + 30 }]}
      data={articles ?? []}
      keyExtractor={(a) => a._id}
      renderItem={({ item }) => <ArticleCard {...item} />}
      ItemSeparatorComponent={() => <View style={styles.rule} />}
      ListHeaderComponent={header}
      ListEmptyComponent={
        failed ? (
          <View style={styles.center}>
            <Text style={styles.message}>{t.error}</Text>
            <Pressable onPress={load} accessibilityRole="button">
              <Text style={styles.switch}>{t.retry}</Text>
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
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    paddingHorizontal: 20,
  },
  masthead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink,
  },
  logo: {
    fontFamily: fonts.neighbor,
    fontSize: 32,
    color: colors.ink,
  },
  switch: {
    fontFamily: fonts.mono,
    fontSize: 15,
    color: colors.ink,
  },
  pageTitle: {
    fontFamily: fonts.neighbor,
    fontSize: 40,
    lineHeight: 44,
    color: colors.ink,
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 15,
  },
  // One column, so cards are separated by a rule as on the website's phone layout.
  rule: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    marginBottom: 30,
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
