import { useGlobalSearchParams, useLocalSearchParams } from 'expo-router'
import ArticleScreen from '../../../../ArticleScreen'

// An article opened from a rubrique: /fr/rubriques/<rubrique>/<slug>, as the
// website's /:lang/:rubrique/:slug.
export default function RubriqueArticleScreen() {
  // lang from the URL: this stack's screens don't inherit the tab's params.
  const { lang } = useGlobalSearchParams()
  const { slug } = useLocalSearchParams()
  return <ArticleScreen key={slug} lang={lang} slug={slug} />
}
