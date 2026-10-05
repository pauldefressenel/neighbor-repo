import { useCallback } from 'react'
import { View } from 'react-native'
import { Redirect, useGlobalSearchParams, useLocalSearchParams } from 'expo-router'
import ArticleList from '../../../../ArticleList'
import { getSectionArticles } from '../../../../sanity'
import { findSection } from '../../../../sections'
import { colors } from '../../../../theme'

// One rubrique's articles, newest first. The masthead and its back arrow
// come from rubriques/_layout.js.
export default function SectionScreen() {
  const { lang } = useGlobalSearchParams()
  const { section: slug } = useLocalSearchParams()
  const section = findSection(slug)
  const fetchArticles = useCallback(() => getSectionArticles(lang, section?.sanity ?? []), [lang, section])

  if (!section) return <Redirect href={`/${lang}/rubriques`} />

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <ArticleList
        lang={lang}
        title={section.label}
        fetchArticles={fetchArticles}
        articleHref={(article) => `/${lang}/rubriques/${section.slug}/${article.slug.current}`}
      />
    </View>
  )
}
