import { useGlobalSearchParams, useLocalSearchParams } from 'expo-router'
import ArticleScreen from '../../../../ArticleScreen'

// An article opened from the Rubriques tab (A La Une or a rubrique):
// /fr/articles/<slug>.
export default function CouvertureArticleScreen() {
  // lang from the URL: this stack's screens don't inherit the tab's params.
  const { lang } = useGlobalSearchParams()
  const { slug } = useLocalSearchParams()
  return <ArticleScreen key={slug} lang={lang} slug={slug} />
}
