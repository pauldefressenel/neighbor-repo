import { useCallback, useRef } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect, useGlobalSearchParams } from 'expo-router'
import { useReducedMotion } from 'react-native-reanimated'
import { APPEAR, AppearContext, FadePressable, PRESS, Rise, RiseLines } from '../../../motion'
import Rule from '../../../Rule'
import { prefetchSectionArticles } from '../../../sanity'
import { SECTIONS } from '../../../sections'
import { colors, fonts, menu as menuStyle } from '../../../theme'

// The rubriques as a numbered table of contents, each one ruled off with a
// smaller copy of the masthead's line.
export default function RubriquesScreen() {
  // From the URL: this stack's screens don't inherit the tab's params, and
  // an undefined lang made every rubrique link to /undefined/…, which
  // redirected to En Couverture.
  const { lang } = useGlobalSearchParams()

  // One rubrique per tap: further taps are ignored until the list is back in
  // focus, so quick double taps can't stack two rubriques.
  const opening = useRef(false)
  useFocusEffect(useCallback(() => { opening.current = false }, []))

  // Each rubrique's articles start loading while the list is on screen.
  useFocusEffect(
    useCallback(() => {
      SECTIONS.forEach((section) => prefetchSectionArticles(lang, section.sanity))
    }, [lang]),
  )
  const open = (slug) => {
    if (opening.current) return
    opening.current = true
    router.navigate(`/${lang}/rubriques/${slug}`)
  }

  // The list builds up (APPEAR in motion.js) once, the first time it is
  // shown. (Playing it again on coming back from a rubrique was tried and
  // rejected.)
  const shown = useRef(Date.now()).current
  const reduceMotion = useReducedMotion()
  const menu = APPEAR.menu

  return (
    <View style={styles.screen}>
      <AppearContext.Provider value={{ since: shown, still: reduceMotion }}>
        <View style={styles.body}>
          <RiseLines style={styles.title} step={menu.title}>Rubriques</RiseLines>
          {SECTIONS.map((section, i) => (
            <FadePressable
              key={section.slug}
              style={styles.row}
              pressScale={PRESS.scale}
              onPress={() => open(section.slug)}
              accessibilityRole="link"
              accessibilityLabel={section.label}
            >
              <Rise step={menu.name} extraDelay={i * menu.stagger} style={styles.line}>
                <Text style={styles.name}>{i + 1}. {section.label}</Text>
                <Text style={styles.chevron}>&gt;</Text>
              </Rise>
              <Rise step={menu.subtitle} extraDelay={i * menu.stagger}>
                <Text style={styles.subtitle}>{section.subtitle}</Text>
              </Rise>
              <Rise step={menu.rule} extraDelay={i * menu.stagger}>
                <Rule style={styles.rule} />
              </Rise>
            </FadePressable>
          ))}
        </View>
      </AppearContext.Provider>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  body: menuStyle.body,
  title: menuStyle.title,
  row: menuStyle.block,
  // The chevron sits on the name's baseline, at the right edge.
  line: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  name: menuStyle.name,
  chevron: {
    fontFamily: fonts.paprika,
    fontSize: 23,
    color: colors.ink,
  },
  subtitle: menuStyle.subtitle,
  rule: menuStyle.rule,
})
