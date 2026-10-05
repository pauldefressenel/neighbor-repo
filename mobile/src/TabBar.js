import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, fonts } from './theme'

// Hand-drawn black strokes on transparent PNGs, always drawn in ink. Keyed by
// the tab's route name in app/[lang]/_layout.js; each is drawn at its own
// aspect ratio and height.
const icons = {
  index: { source: require('../assets/icons/a-la-une.png'), ratio: 416 / 344, height: 22 },
  rubriques: { source: require('../assets/icons/rubriques.png'), ratio: 312 / 389, height: 20 },
  'a-propos': { source: require('../assets/icons/a-propos.png'), ratio: 282 / 344, height: 22 },
}

// French-only for now, like the rest of the app's chrome.
const LABELS = {
  index: 'A La Une',
  rubriques: 'Rubriques',
  'a-propos': 'A Propos',
}

// Rendered by the Tabs navigator (its `tabBar` prop). Icons and labels are
// in ink; a red dot under the label marks the current tab. Pressing the
// current tab again lets the navigator scroll its list to the top, or pop a
// rubrique back to the list.
export default function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
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
            style={styles.tab}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={LABELS[route.name]}
          >
            <View style={styles.icon}>
              <Image
                source={icon.source}
                style={{ height: icon.height, width: icon.height * icon.ratio, tintColor: colors.ink }}
              />
            </View>
            <Text style={styles.label}>{LABELS[route.name]}</Text>
            <View style={[styles.dot, focused && styles.dotOn]} />
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.bar,
    borderTopWidth: 1,
    borderTopColor: colors.ink,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 6,
    gap: 3,
  },
  // As tall as the tallest icon, so the labels line up across tabs.
  icon: {
    height: 22,
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.garamond,
    fontSize: 16,
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
