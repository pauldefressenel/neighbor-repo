import { useCallback } from 'react'
import { View } from 'react-native'
import { useGlobalSearchParams } from 'expo-router'
import ArticleList from '../../../ArticleList'
import { getLatestArticles } from '../../../sanity'
import { colors } from '../../../theme'

// En Couverture: the articles the editors flag as featured for this language.
// The masthead comes from (couverture)/_layout.js.
export default function LatestScreen() {
  // From the URL: a stack's screens don't inherit the tab's params.
  const { lang } = useGlobalSearchParams()
  const fetchArticles = useCallback(() => getLatestArticles(lang), [lang])

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <ArticleList
        lang={lang}
        title="En Couverture"
        fetchArticles={fetchArticles}
        articleHref={(article) => `/${lang}/articles/${article.slug.current}`}
      />
    </View>
  )
}
