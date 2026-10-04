import { Pressable, StyleSheet, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Rule from './Rule'
import { JoinIcon } from './TabBar'
import { colors, fonts } from './theme'

// The bar at the top of every screen. It sits outside the scrolling content
// so it stays put, and spans the full width so its hand-drawn rule runs edge
// to edge. The wordmark is centred between two equal slots: an optional back
// arrow (`onBack`) on the left and the join button on the right.
export default function Masthead({ onBack }) {
  const insets = useSafeAreaInsets()
  return (
    <View style={styles.masthead}>
      <View style={[styles.row, { paddingTop: insets.top + 12 }]}>
        <View style={styles.slot}>
          {onBack ? (
            <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Retour">
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M15 5l-7 7 7 7" />
              </Svg>
            </Pressable>
          ) : null}
        </View>
        <Text style={styles.logo}>The Neighbor</Text>
        {/* Destination to be decided; the app is French-only for now, so the
            language switch is gone. */}
        <View style={[styles.slot, styles.end]}>
          <Pressable hitSlop={12} accessibilityRole="button" accessibilityLabel="Rejoindre">
            <JoinIcon size={24} />
          </Pressable>
        </View>
      </View>
      <Rule />
    </View>
  )
}

const styles = StyleSheet.create({
  masthead: {
    backgroundColor: colors.bar,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  slot: {
    width: 32,
  },
  end: {
    alignItems: 'flex-end',
  },
  logo: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.neighbor,
    fontSize: 28,
    color: colors.ink,
  },
})
