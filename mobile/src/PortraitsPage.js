import { useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useScrollToTop } from 'expo-router/react-navigation'
import { useReducedMotion } from 'react-native-reanimated'
import { PageHeading } from './ArticleList'
import LateSpinner from './LateSpinner'
import PortraitShow from './PortraitShow'
import { i18n } from './i18n'
import { AppearContext } from './motion'
import { getSectionArticles, openArticle } from './sanity'
import { findSection } from './sections'
import { colors, fonts } from './theme'

const PORTRAITS = findSection('portraits')

// Portraits, picked in the Rubriques tab's switch: the page title and its
// asterisk, then the portraits one at a time (PortraitShow.js). It builds up
// as the article lists do when it is picked. (It was a tab of its own.)
// `titleTop` replaces the room above the title, as in ArticleList.
export default function PortraitsPage({ lang, titleTop }) {
  const t = i18n[lang] ?? i18n.fr
  const [portraits, setPortraits] = useState(null)
  const [failed, setFailed] = useState(false)
  // Tapping the tab again scrolls back to the top, on a short screen.
  const page = useRef(null)
  useScrollToTop(page)
  const shown = useRef(Date.now()).current
  const reduceMotion = useReducedMotion()

  const load = useCallback(async () => {
    setFailed(false)
    try {
      setPortraits(await getSectionArticles(lang, PORTRAITS.sanity))
    } catch {
      setFailed(true)
    }
  }, [lang])

  useEffect(() => {
    setPortraits(null)
    load()
  }, [load])

  // One portrait per tap: further taps are ignored until the page is back in
  // focus, so quick double taps can't stack two.
  const opening = useRef(false)
  useFocusEffect(useCallback(() => { opening.current = false }, []))
  const open = (portrait) => {
    if (opening.current || !portrait.slug?.current) return
    opening.current = true
    openArticle(portrait)
    router.navigate(`/${lang}/articles/${portrait.slug.current}`)
  }

  return (
    <ScrollView ref={page} style={styles.screen} contentContainerStyle={styles.content}>
      <AppearContext.Provider value={{ since: shown, still: reduceMotion }}>
        <PageHeading title={PORTRAITS.label[lang] ?? PORTRAITS.label.fr} titleTop={titleTop} />
        {portraits ? (
          <PortraitShow portraits={portraits} onOpen={open} />
        ) : failed ? (
          <View style={styles.center}>
            <Text style={styles.message}>{t.error}</Text>
            <Pressable onPress={load} accessibilityRole="button">
              <Text style={styles.message}>{t.retry}</Text>
            </Pressable>
          </View>
        ) : (
          <LateSpinner style={styles.center} />
        )}
      </AppearContext.Provider>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    paddingBottom: 30,
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
