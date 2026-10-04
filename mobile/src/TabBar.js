import { Pressable, StyleSheet, Text, View } from 'react-native'
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, fonts } from './theme'

const ICON = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: colors.icon, strokeWidth: 1.6, strokeLinecap: 'round' }

// Keyed by the tab's route name in app/[lang]/_layout.js.
const icons = {
  index: (color) => (
    <Svg {...ICON} stroke={color}>
      <Rect x={3.5} y={3.5} width={17} height={17} rx={1.5} />
      <Line x1={7.5} y1={8.5} x2={16.5} y2={8.5} />
      <Line x1={7.5} y1={12} x2={16.5} y2={12} />
      <Line x1={7.5} y1={15.5} x2={13} y2={15.5} />
    </Svg>
  ),
  rubriques: (color) => (
    <Svg {...ICON} stroke={color}>
      <Rect x={3.5} y={3.5} width={7} height={7} rx={1} />
      <Rect x={13.5} y={3.5} width={7} height={7} rx={1} />
      <Rect x={3.5} y={13.5} width={7} height={7} rx={1} />
      <Rect x={13.5} y={13.5} width={7} height={7} rx={1} />
    </Svg>
  ),
  voisinage: (color) => (
    <Svg {...ICON} stroke={color}>
      <Circle cx={5} cy={6.5} r={2.2} />
      <Circle cx={12} cy={4.5} r={2.2} />
      <Circle cx={19} cy={6.5} r={2.2} />
      <Circle cx={8} cy={13} r={2.2} />
      <Circle cx={16} cy={13} r={2.2} />
      <Circle cx={12} cy={19.5} r={2.2} />
    </Svg>
  ),
  'a-propos': (color) => (
    <Svg {...ICON} stroke={color}>
      <Circle cx={12} cy={12} r={9} />
      <Line x1={12} y1={10} x2={12} y2={16} />
      <Line x1={12} y1={7.2} x2={12} y2={7.3} strokeWidth={2} />
    </Svg>
  ),
}

// Same drawing style as the tab icons, for the masthead's join button.
export function JoinIcon({ size = ICON.width }) {
  return (
    <Svg {...ICON} width={size} height={size}>
      <Circle cx={9} cy={8} r={3.5} />
      <Path d="M3 20c0-3.6 2.7-6 6-6s6 2.4 6 6" />
      <Line x1={19} y1={8} x2={19} y2={14} />
      <Line x1={16} y1={11} x2={22} y2={11} />
    </Svg>
  )
}

// French-only for now, like the rest of the app's chrome.
const LABELS = {
  index: 'A La Une',
  rubriques: 'Rubriques',
  voisinage: 'Voisinage',
  'a-propos': 'A Propos',
}

// Rendered by the Tabs navigator (its `tabBar` prop). The current tab is
// drawn in ink, the others in grey. Pressing the current tab again lets the
// navigator scroll its list to the top, or pop a rubrique back to the list.
export default function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, i) => {
        const focused = state.index === i
        const color = focused ? colors.ink : colors.icon
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
            {icons[route.name]?.(color)}
            <Text style={[styles.label, { color }]}>{LABELS[route.name]}</Text>
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
    paddingTop: 10,
    paddingBottom: 6,
    gap: 3,
  },
  label: {
    fontFamily: fonts.garamond,
    fontSize: 16,
  },
})
