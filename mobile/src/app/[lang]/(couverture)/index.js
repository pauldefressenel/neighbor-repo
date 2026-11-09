import { useCallback } from 'react'
import { View } from 'react-native'
import { useGlobalSearchParams } from 'expo-router'
import ArticleList from '../../../ArticleList'
import { i18n } from '../../../i18n'
import { getLatestArticles } from '../../../sanity'
import { colors } from '../../../theme'

// A La Une: the articles the editors list, in order, in the language's
// À la Une document. The masthead comes from (couverture)/_layout.js. (For a
// while this tab also held the rubriques, in a sideways row over the page;
// the Rubriques tab's numbered menu came back in its place.)
export default function LatestScreen() {
  // From the URL: a stack's screens don't inherit the tab's params.
  const { lang } = useGlobalSearchParams()
  const fetchArticles = useCallback(() => getLatestArticles(lang), [lang])

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <ArticleList
        // Keyed by language: kept, the list went on showing the other
        // language's title.
        key={lang}
        lang={lang}
        title={(i18n[lang] ?? i18n.fr).latest}
        fetchArticles={fetchArticles}
        articleHref={(article) => `/${lang}/articles/${article.slug.current}`}
      />
    </View>
  )
}
