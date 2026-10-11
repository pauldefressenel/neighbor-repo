import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useGlobalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TabIcon } from './DrawnIcons'
import PaperFade from './PaperFade'
import { i18n } from './i18n'
import Rule from './Rule'
import { categoryType, colors } from './theme'

// Each tab's icon (DrawnIcons.js), always drawn in ink. Keyed by the tab's
// route name in app/[lang]/_layout.js.
const icons = {
  '(couverture)': 'a-la-une',
  rubriques: 'rubriques',
  voisinage: 'voisinage',
  'a-propos': 'a-propos',
}

// Rendered by the Tabs navigator (its `tabBar` prop). Icons and labels are
// in ink; a red dot under the label marks the current tab. Pressing the
// current tab again lets the navigator scroll its list to the top, or pop a
// rubrique back to the list.
export default function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets()
  const { lang } = useGlobalSearchParams()
  const labels = (i18n[lang] ?? i18n.fr).tabs
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      {/* Above the line, the paper fades out into the page, as under the
          masthead. */}
      <PaperFade edge="bottom" />
      {/* The masthead's hand-drawn line, turned upside down so the two
          aren't the same: its sag is right of centre, bowing up. */}
      <Rule style={styles.rule} />
      <View style={[styles.tabs, lang === 'en' && styles.tabsEn]}>
        {state.routes.map((route, i) => {
          const icon = icons[route.name]
          if (!icon) return null
          const focused = state.index === i
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params)
          }
          return (
            <Pressable
              key={route.key}
              style={[styles.tab, lang === 'en' && route.name === 'rubriques' && styles.sectionsEn]}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={labels[route.name]}
            >
              <View style={styles.icon}>
                <TabIcon name={icon} />
              </View>
              <View style={styles.labelBox}>
                <Text style={styles.label} numberOfLines={1}>{labels[route.name]}</Text>
              </View>
              <View style={[styles.dot, focused && styles.dotOn]} />
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.bar,
    // Above the page, for the fade above it (PaperFade).
    zIndex: 1,
  },
  // Turned a half turn. Its box is 2pt taller than the border it replaced,
  // taken back so the tabs stay where they were.
  rule: {
    transform: [{ rotate: '180deg' }],
    marginBottom: -2,
  },
  // Inset from the screen's sides, so the four tabs sit closer together
  // than they would spread across the full width. English's longer labels
  // ("Neighborhood") get the tabs spread wider.
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 28,
  },
  tabsEn: {
    paddingHorizontal: 12,
  },
  // In English, Sections sits a little left of its share of the bar, set
  // by eye.
  sectionsEn: {
    transform: [{ translateX: -11 }],
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 6,
    gap: 6,
  },
  // Every icon stands on the same line, the bottom of this box, rather than
  // being centred in it; their viewBoxes are cropped to the ink
  // (make-icons.py) so that line is where each drawing ends.
  icon: {
    height: 25,
    justifyContent: 'flex-end',
  },
  // Wider than a tab (84pt on a 393pt screen in French, 92pt in English), centred on it, so a
  // long label overflows evenly into its neighbours' room instead of being
  // cut: "Neighborhood" is wider than its tab. Its neighbours' labels are
  // short enough for the two never to meet.
  labelBox: {
    width: 120,
    alignItems: 'center',
  },
  // The cards' category type, but in ink, at 14pt, and tightened a little
  // more (-0.06em against their -0.05em). (16pt, read off the mock-up, was
  // too big; 12 and 13pt too small.)
  label: {
    ...categoryType,
    fontSize: 14,
    lineHeight: 14 * 1.1,
    letterSpacing: 14 * -0.06,
    color: colors.ink,
  },
  // Always laid out, so the bar doesn't shift when the selection moves.
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotOn: {
    backgroundColor: colors.red,
  },
})
