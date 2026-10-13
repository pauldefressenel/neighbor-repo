import { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'
import { useFocusEffect, useGlobalSearchParams, useNavigation } from 'expo-router'
import ArticleList from '../../../ArticleList'
import PortraitsPage from '../../../PortraitsPage'
import RubriqueSwitch from '../../../RubriqueSwitch'
import { i18n } from '../../../i18n'
import { getLatestArticles, getSectionArticles, prefetchSectionArticles } from '../../../sanity'
import { SECTIONS } from '../../../sections'
import { useTabEntered } from '../../../motion'
import { colors } from '../../../theme'

// The Rubriques tab: A La Une (the articles the editors list, in order, in
// the language's À la Une document) and the three rubriques in the RubriqueSwitch over the
// chosen one's page, Portraits as the slideshow (PortraitsPage.js). It opens
// on A La Une; tapping the tab again, or coming back to it, returns there.
// Picking a page replaces the one below, which builds up again. The masthead
// comes from (couverture)/_layout.js.
const LATEST = 'a-la-une'

// From the switch's line to the title under it (the page titles' own 41.5
// left them far apart).
const TITLE_TOP = 22

export default function RubriquesScreen() {
  // From the URL: a stack's screens don't inherit the tab's params.
  // `rubrique`: the language switch, from an article, opens its rubrique
  // (Masthead.js).
  const { lang, rubrique } = useGlobalSearchParams()
  const t = i18n[lang] ?? i18n.fr
  const asked = SECTIONS.some((s) => s.slug === rubrique) ? rubrique : null
  // A rubrique's slug, or LATEST.
  const [current, setCurrent] = useState(asked ?? LATEST)
  const section = SECTIONS.find((s) => s.slug === current)

  // Back on A La Une each time the tab is entered again, and built up again.
  // Set while rendering, so the tab opens on it straight away rather than on
  // the last page for a moment.
  const entered = useTabEntered()
  const [landed, setLanded] = useState(entered)
  if (entered !== landed) {
    setLanded(entered)
    setCurrent(LATEST)
  }
  // The rubrique the language switch asks for, once each time it asks.
  const [answered, setAnswered] = useState(asked)
  if (asked !== answered) {
    setAnswered(asked)
    if (asked) setCurrent(asked)
  }
  // And when the tab is tapped while already in front (which also pops an
  // article and scrolls to the top).
  const navigation = useNavigation()
  useEffect(
    () => navigation.getParent()?.addListener('tabPress', () => {
      if (navigation.getParent()?.isFocused()) setCurrent(LATEST)
    }),
    [navigation],
  )

  const entries = [{ key: LATEST, label: t.latest }, ...SECTIONS.map((s) => ({ key: s.slug, label: s.label[lang] ?? s.label.fr }))]
  const fetchArticles = useCallback(
    () => (section ? getSectionArticles(lang, section.sanity) : getLatestArticles(lang)),
    [lang, section],
  )

  // The rubriques not on screen start loading. (The one on screen is
  // fetched by its page: a prefetch of it would wait unused.)
  useFocusEffect(
    useCallback(() => {
      SECTIONS.filter((s) => s.slug !== current).forEach((s) => prefetchSectionArticles(lang, s.sanity))
    }, [lang, current]),
  )

  // Keyed by language too: kept, a page went on showing the other
  // language's title. And by the tab's entry, to build up again.
  const key = `${lang}-${current}-${entered}`
  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <RubriqueSwitch key={entered} entries={entries} current={current} onChange={setCurrent} since={entered} />
      {current === 'portraits' ? (
        <PortraitsPage key={key} lang={lang} titleTop={TITLE_TOP} />
      ) : (
        <ArticleList
          key={key}
          lang={lang}
          title={section ? section.label[lang] ?? section.label.fr : t.latest}
          titleTop={TITLE_TOP}
          fetchArticles={fetchArticles}
          articleHref={(article) => `/${lang}/articles/${article.slug.current}`}
        />
      )}
    </View>
  )
}
