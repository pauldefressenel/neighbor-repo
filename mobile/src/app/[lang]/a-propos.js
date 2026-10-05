import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import { useScrollToTop } from 'expo-router/react-navigation'
import { useReducedMotion } from 'react-native-reanimated'
import { ArticleHeading } from '../../ArticleScreen'
import ArticleText from '../../ArticleText'
import Masthead from '../../Masthead'
import { APPEAR, AppearContext, Rise } from '../../motion'
import { getAboutPage } from '../../sanity'
import { i18n } from '../../i18n'
import { colors, fonts } from '../../theme'

// A Propos, set like an article (ArticleScreen.js): an article's heading,
// with a fixed category, byline and reading time, then the `about-<lang>` document's
// text (ArticleText.js), opening on a drop cap. The heading is fixed so it can
// rise in while the text loads.
const HEADING = {
  category: 'A propos',
  byline: 'L\'équipe de rédaction, 5 octobre 2026.',
  title: 'Manifeste Neighbor.',
  readingTime: '4 min.',
}

export default function AProposScreen() {
  const { lang } = useLocalSearchParams()
  const t = i18n[lang] ?? i18n.fr
  const [body, setBody] = useState(null)
  const [failed, setFailed] = useState(false)
  const scroll = useRef(null)
  useScrollToTop(scroll)
  // Unlike every other page, A Propos builds up (APPEAR.article) each time
  // its tab is entered, from the top: its content is remounted and the page
  // scrolled back up. The tab's focus also fires on the first visit.
  const navigation = useNavigation()
  const [shown, setShown] = useState(() => Date.now())
  useEffect(
    () =>
      navigation.addListener('focus', () => {
        scroll.current?.scrollTo({ y: 0, animated: false })
        setShown(Date.now())
      }),
    [navigation],
  )
  const reduceMotion = useReducedMotion()
  const steps = APPEAR.article

  const load = useCallback(async () => {
    setFailed(false)
    try {
      const page = await getAboutPage(lang)
      setBody(page?.body ?? [])
    } catch {
      setFailed(true)
    }
  }, [lang])
  useEffect(() => {
    load()
  }, [load])

  return (
    <View style={styles.screen}>
      <Masthead />
      <AppearContext.Provider value={{ since: shown, still: reduceMotion }}>
        <ScrollView ref={scroll} style={styles.scroll} contentContainerStyle={styles.content}>
          <View key={shown}>
            <ArticleHeading {...HEADING} />
            {failed ? (
              <View style={styles.center}>
                <Text style={styles.message}>{t.pageError}</Text>
                <Pressable onPress={load} accessibilityRole="button">
                  <Text style={styles.message}>{t.retry}</Text>
                </Pressable>
              </View>
            ) : body === null ? (
              <ActivityIndicator style={styles.center} color={colors.ink} />
            ) : (
              <Rise step={steps.body}>
                <ArticleText body={body} />
              </Rise>
            )}
          </View>
        </ScrollView>
      </AppearContext.Provider>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 60,
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
