import { useCallback } from 'react'
import { View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import ArticleList from '../../ArticleList'
import Masthead from '../../Masthead'
import { getLatestArticles } from '../../sanity'
import { colors } from '../../theme'

// En Couverture: the articles the editors flag as featured for this language.
export default function LatestScreen() {
  const { lang } = useLocalSearchParams()
  const fetchArticles = useCallback(() => getLatestArticles(lang), [lang])

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <Masthead />
      <ArticleList lang={lang} title="En Couverture" fetchArticles={fetchArticles} />
    </View>
  )
}
