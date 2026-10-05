import { useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import { useReducedMotion } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Rule from './Rule'
import { FadePressable, PAGE_REDUCED, useFade, usePop } from './motion'
import { colors, fonts } from './theme'

// The bar at the top of every screen. It sits outside the scrolling content
// so it stays put, and spans the full width so its hand-drawn rule runs edge
// to edge. The wordmark is centred between two equal slots: an optional back
// arrow (`onBack`) on the left and an empty one on the right. The arrow
// pops in as a rubrique opens (BACK_POP in motion.js), or just fades with
// Reduce Motion on, and keeps its last handler while it goes so the slot
// never jumps.
export default function Masthead({ onBack, backLabel = 'Retour' }) {
  const insets = useSafeAreaInsets()
  const lastBack = useRef(onBack)
  if (onBack) lastBack.current = onBack
  const reduceMotion = useReducedMotion()
  const pop = usePop(!!onBack)
  const fade = useFade(!!onBack, PAGE_REDUCED)
  const backStyle = reduceMotion ? { opacity: fade } : pop
  return (
    <View style={styles.masthead}>
      <View style={[styles.row, { paddingTop: insets.top + 12 }]}>
        <View style={styles.slot}>
          {lastBack.current ? (
            <Animated.View
              style={backStyle}
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
