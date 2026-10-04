import { useCallback } from 'react'
import { View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import ArticleList from '../../ArticleList'
import Masthead from '../../Masthead'
import { getLatestArticles } from '../../sanity'
import { colors } from '../../theme'

// A La Une: the articles the editors flag as featured for this language.
export default function LatestScreen() {
  const { lang } = useLocalSearchParams()
  const fetchArticles = useCallback(() => getLatestArticles(lang), [lang])

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <Masthead />
      <ArticleList lang={lang} title="A La Une" fetchArticles={fetchArticles} />
    </View>
  )
}
