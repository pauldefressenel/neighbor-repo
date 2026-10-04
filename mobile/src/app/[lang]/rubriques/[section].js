import { useCallback } from 'react'
import { View } from 'react-native'
import { Redirect, router, useLocalSearchParams } from 'expo-router'
import ArticleList from '../../../ArticleList'
import Masthead from '../../../Masthead'
import { getSectionArticles } from '../../../sanity'
import { findSection } from '../../../sections'
import { colors } from '../../../theme'

// One rubrique's articles, newest first.
export default function SectionScreen() {
  const { lang, section: slug } = useLocalSearchParams()
  const section = findSection(slug)
  const fetchArticles = useCallback(() => getSectionArticles(lang, section?.sanity ?? []), [lang, section])

  if (!section) return <Redirect href={`/${lang}/rubriques`} />

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <Masthead onBack={() => (router.canGoBack() ? router.back() : router.replace(`/${lang}/rubriques`))} />
      <ArticleList lang={lang} title={section.label} fetchArticles={fetchArticles} />
    </View>
  )
}
