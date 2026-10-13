import { useRef, useState } from 'react'
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useReducedMotion } from 'react-native-reanimated'
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg'
import PaperFade from './PaperFade'
import Rule from './Rule'
import { APPEAR, AppearContext, FadePressable, PRESS, Rise } from './motion'
import { categoryType, colors } from './theme'

// The Rubriques tab's pages in a row over the chosen one (A La Une and the
// three rubriques, `entries` of { key, label }), in the cards' category
// capitals, the current one red, over one drawn line, as on the website's
// phones (src/RubriqueSwitch.jsx). The first three fill the width; Portraits
// waits off to the right: the row scrolls sideways, fading out towards a
// drawn chevron that scrolls it on, or back, turned round, at the end, where
// the fade moves to the start (option A of a comparison sheet; centred rows
// with dots, and a row on two lines, came first). It stays put under the
// masthead while the list scrolls beneath it, which fades out under it as
// under the masthead. (The masthead's own fade is left out above it: it
// greyed the names out.) It builds up from `since` (APPEAR.switch), the
// moment the tab was entered. The arrow and the fade show only when the row
// is wider than the screen. With `unavailable` (Voisinage's and A Propos's
// rows, whose pages aren't built yet) a tapped name shakes instead of
// opening, unless its entry says `available`.
export default function RubriqueSwitch({ entries, current, onChange, since, unavailable = false }) {
  const reduceMotion = useReducedMotion()

  const track = useRef(null)
  const [atEnd, setAtEnd] = useState(false)
  const [overflows, setOverflows] = useState(false)
  const size = useRef({ view: 0, content: 0 })
  const measure = (x) => {
    setOverflows(size.current.content > size.current.view + 1)
    setAtEnd(x + size.current.view >= size.current.content - 4)
  }
  const turn = () => (atEnd ? track.current?.scrollTo({ x: 0 }) : track.current?.scrollToEnd())

  return (
    <AppearContext.Provider value={{ since, still: reduceMotion }}>
      <View style={styles.bar}>
        <View>
          <ScrollView
            ref={track}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
            scrollEventThrottle={16}
            onScroll={(e) => measure(e.nativeEvent.contentOffset.x)}
            onLayout={(e) => { size.current.view = e.nativeEvent.layout.width; measure(0) }}
            onContentSizeChange={(w) => { size.current.content = w; measure(0) }}
          >
            {entries.map((entry, i) => {
              const on = entry.key === current
              return (
                <Rise key={entry.key} step={APPEAR.switch.name} extraDelay={i * APPEAR.switch.stagger}>
                  <Name label={entry.label} on={on} unavailable={unavailable && !entry.available} onPress={() => onChange?.(entry.key)} />
                </Rise>
              )
            })}
          </ScrollView>
          {overflows ? <Fade side={atEnd ? 'left' : 'right'} /> : null}
          {overflows ? (
            <Rise step={APPEAR.switch.rule} style={styles.arrowBox}>
              <FadePressable onPress={turn} pressScale={PRESS.scale} hitSlop={10} accessibilityRole="button" accessibilityLabel={(atEnd ? entries[0] : entries.at(-1)).label}>
                <Svg width={10} height={16} viewBox="0 0 16 26" style={!atEnd && styles.mirrored}>
                  <Path
                    d="M12.1 3.1 C10.9 4.6 9.2 6.6 7.6 8.2 C6 9.9 4.4 11.4 2.9 12.8 C2.6 13.1 2.6 13.4 2.9 13.7 C4.6 15.3 6.4 17 8 18.8 C9.6 20.5 11.2 22.3 12.8 23.7"
                    stroke={colors.ink}
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </Svg>
              </FadePressable>
            </Rise>
          ) : null}
        </View>
        <Rise step={APPEAR.switch.rule}>
          <Rule style={styles.rule} />
        </Rise>
        {/* In the layout, under the line: hung below the bar as under the
            masthead, it was drawn over the names and greyed them out. */}
        <PaperFade inline />
      </View>
    </AppearContext.Provider>
  )
}

// One name. Held, it only shrinks a little: it doesn't fade. When its page
// isn't there yet, a tap shakes it (as the sign-up's envelope does when the
// profile isn't ready) and opens nothing.
function Name({ label, on, unavailable, onPress }) {
  const shake = useRef(new Animated.Value(0)).current
  const reduceMotion = useReducedMotion()
  const press = () => {
    if (!unavailable) return onPress()
    // The page already open stays still.
    if (on) return undefined
    if (reduceMotion) return undefined
    shake.setValue(0)
    Animated.sequence(
      [-4, 4, -3, 0].map((toValue) => Animated.timing(shake, { toValue, duration: 70, useNativeDriver: true })),
    ).start()
    return undefined
  }
  return (
    <FadePressable
      pressScale={PRESS.scale}
      pressOpacity={1}
      hitSlop={{ top: 12, bottom: 12 }}
      onPress={press}
      accessibilityRole="tab"
      accessibilityState={{ selected: on, disabled: unavailable }}
    >
      <Animated.View style={{ transform: [{ translateX: shake }] }}>
        <Text style={[styles.label, on && styles.on]} numberOfLines={1}>{label}</Text>
      </Animated.View>
    </FadePressable>
  )
}

// The paper over the row's end (or, scrolled to the end, its start), the
// names fading out under it over FADE pt towards the arrow, wholly hidden for
// the last FADE_SOLID. React Native has no masks, so the paper is drawn over
// them instead.
const FADE = 100
const FADE_SOLID = 22

function Fade({ side }) {
  const id = `switch-fade-${side}`
  const right = side === 'right'
  return (
    <View style={[styles.fade, right ? { right: 0 } : { left: 0 }]} pointerEvents="none">
      <Svg width={FADE} height="100%">
        <Defs>
          <LinearGradient id={id} x1={right ? 0 : 1} y1="0" x2={right ? 1 : 0} y2="0">
            <Stop offset="0" stopColor={colors.paper} stopOpacity={0} />
            <Stop offset={1 - FADE_SOLID / FADE} stopColor={colors.paper} stopOpacity={1} />
            <Stop offset="1" stopColor={colors.paper} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect width={FADE} height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  )
}

const SIZE = 15 // the names' type size, as on the website's phones
const GAP = 15 // between two names
const SIDE = 16 // the page's margin, before the first name and either side of the line
const RULE_GAP = 15 // between the names and the line under them

const styles = StyleSheet.create({
  // Above the list, so the fade below it is drawn over the cards.
  bar: {
    paddingTop: 18,
    backgroundColor: colors.paper,
    zIndex: 1,
  },
  // Room at the end to scroll the last name clear of the arrow.
  row: {
    flexDirection: 'row',
    columnGap: GAP,
    paddingLeft: SIDE,
    paddingRight: 40,
  },
  label: {
    ...categoryType,
    fontSize: SIZE,
    lineHeight: SIZE * 1.1,
    letterSpacing: SIZE * -0.05,
    color: colors.ink,
  },
  on: {
    color: colors.red,
  },
  fade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: FADE,
  },
  // The website's drawn chevron, pointing on (mirrored); turned round at the
  // end.
  arrowBox: {
    position: 'absolute',
    right: 18,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  mirrored: {
    transform: [{ scaleX: -1 }],
  },
  rule: {
    marginTop: RULE_GAP,
    marginHorizontal: SIDE,
  },
})
