import { useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import { useReducedMotion } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Rule from './Rule'
import { FadePressable, PAGE, PAGE_REDUCED, useFade } from './motion'
import { colors, fonts } from './theme'

// The bar at the top of every screen. It sits outside the scrolling content
// so it stays put, and spans the full width so its hand-drawn rule runs edge
// to edge. The wordmark is centred between two equal slots: an optional back
// arrow (`onBack`) on the left and an empty one on the right. The arrow
// fades in and out with the page transition rather than popping, and keeps
// its last handler while it fades so the slot never jumps.
export default function Masthead({ onBack, backLabel = 'Retour' }) {
  const insets = useSafeAreaInsets()
  const lastBack = useRef(onBack)
  if (onBack) lastBack.current = onBack
  const backOpacity = useFade(!!onBack, useReducedMotion() ? PAGE_REDUCED : PAGE)
  return (
    <View style={styles.masthead}>
      <View style={[styles.row, { paddingTop: insets.top + 12 }]}>
        <View style={styles.slot}>
          {lastBack.current ? (
            <Animated.View
              style={{ opacity: backOpacity }}
              pointerEvents={onBack ? 'auto' : 'none'}
              aria-hidden={!onBack}
            >
              <FadePressable
                onPress={() => lastBack.current?.()}
                disabled={!onBack}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={backLabel}
              >
                {/* The Rubriques list's chevron, mirrored to point back. */}
                <Text style={styles.back}>&gt;</Text>
              </FadePressable>
            </Animated.View>
          ) : null}
        </View>
        <Text style={styles.logo}>The Neighbor</Text>
        {/* Empty, as wide as the back arrow's slot, so the wordmark stays
            centred. */}
        <View style={styles.slot} />
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
  back: {
    fontFamily: fonts.paprika,
    fontSize: 23,
    color: colors.ink,
    transform: [{ scaleX: -1 }],
    alignSelf: 'flex-start',
  },
  logo: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.neighbor,
    fontSize: 28,
    color: colors.ink,
  },
})
