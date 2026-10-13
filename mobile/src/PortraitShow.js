import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AppState, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { useReducedMotion } from 'react-native-reanimated'
import Svg, { Path } from 'react-native-svg'
import PortraitCard from './PortraitCard'
import { CARD_PRESS, FadePressable, PRESS } from './motion'
import { colors } from './theme'

// The portraits (PortraitsPage.js), one at a time, sliding, as the website's
// row of portraits does on wide screens (PortraitStrip in src/ArticleGrid.jsx),
// with the same drawn arrows either side. A swipe moves it too. On its own it
// moves on one portrait every AUTO_ADVANCE, counted from the last move, the
// reader's included; it holds still while its page is out of sight or the app
// in the background, and with Reduce Motion on.
//
// It goes round without end: the track holds only the portrait before, the
// current one and the one after, and rests on the middle one. After a slide
// the list is turned by one and the track put back on the middle before the
// screen is drawn: the same portrait stands in the same place, so nothing is
// seen to move. The cards are keyed by portrait, so a turn moves them rather
// than redrawing them, and their animations run on.
const AUTO_ADVANCE = 5000 // ms
const SIDE = 40 // each arrow's column, either side of the card

export default function PortraitShow({ portraits, onOpen }) {
  const n = portraits.length
  const { width } = useWindowDimensions()
  const page = width - 2 * SIDE
  const [index, setIndex] = useState(0)
  const track = useRef(null)
  // True while a slide the arrows or the clock started is under way.
  const busy = useRef(false)
  // Counts the moves, so the automatic one is timed from the last.
  const [moves, setMoves] = useState(0)
  const reduceMotion = useReducedMotion()
  const focused = useRef(true)
  useFocusEffect(
    useCallback(() => {
      focused.current = true
      return () => { focused.current = false }
    }, []),
  )

  // Back on the middle page, before the turned list is drawn.
  useLayoutEffect(() => {
    track.current?.scrollTo({ x: page, animated: false })
  }, [index, page])

  const move = (direction) => {
    if (busy.current || n < 2) return
    busy.current = true
    setMoves((m) => m + 1)
    track.current?.scrollTo({ x: page * (1 + direction), animated: true })
  }

  // A slide has ended, swiped or not (iOS reports the end of scrollTo's
  // animation here too): turn the list if it left the middle.
  const settle = (e) => {
    busy.current = false
    const at = Math.round(e.nativeEvent.contentOffset.x / page)
    if (at !== 1) setIndex((i) => (i + at - 1 + n) % n)
  }

  useEffect(() => {
    if (reduceMotion || n < 2) return
    const id = setTimeout(() => {
      if (focused.current && AppState.currentState === 'active') move(1)
      else setMoves((m) => m + 1) // try again later
    }, AUTO_ADVANCE)
    return () => clearTimeout(id)
    // Started again after every move.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moves, reduceMotion, n])

  if (n === 0) return null
  const at = (offset) => portraits[(index + offset + n) % n]
  // With two portraits the one before is the one after: keyed apart.
  const slots = n < 2 ? [[at(0), 'only']] : [[at(-1), 'before'], [at(0), 'current'], [at(1), 'after']]

  return (
    <View style={styles.row}>
      <Arrow onPress={() => move(-1)} hidden={n < 2} label="Previous" />
      <ScrollView
        ref={track}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ width: page }}
        contentOffset={{ x: n < 2 ? 0 : page, y: 0 }}
        scrollEnabled={n > 1}
        onScrollBeginDrag={() => setMoves((m) => m + 1)}
        onMomentumScrollEnd={settle}
      >
        {slots.map(([portrait, slot]) => (
          <FadePressable
            key={n === 2 && slot === 'before' ? `before-${portrait._id}` : portrait._id}
            style={[styles.page, { width: page }]}
            onPress={() => onOpen(portrait)}
            pressScale={CARD_PRESS.scale}
            pressOpacity={CARD_PRESS.opacity}
            timing={CARD_PRESS}
            scaleChildren
            accessibilityRole="link"
            accessibilityLabel={portrait.title}
          >
            <PortraitCard {...portrait} />
          </FadePressable>
        ))}
      </ScrollView>
      <Arrow onPress={() => move(1)} hidden={n < 2} label="Next" next />
    </View>
  )
}

// The website's drawn chevron, pointing left, "<" (the next one is mirrored):
// one stroke, as if by pen, its arms a little uneven and its point slightly
// rounded.
function Arrow({ onPress, hidden, label, next = false }) {
  if (hidden) return <View style={styles.side} />
  return (
    <FadePressable style={styles.side} onPress={onPress} pressScale={PRESS.scale} hitSlop={10} accessibilityRole="button" accessibilityLabel={label}>
      <Svg width={16} height={26} viewBox="0 0 16 26" style={next && styles.mirrored}>
        <Path
          d="M12.1 3.1 C10.9 4.6 9.2 6.6 7.6 8.2 C6 9.9 4.4 11.4 2.9 12.8 C2.6 13.1 2.6 13.4 2.9 13.7 C4.6 15.3 6.4 17 8 18.8 C9.6 20.5 11.2 22.3 12.8 23.7"
          stroke={colors.ink}
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </FadePressable>
  )
}

const styles = StyleSheet.create({
  // The arrows stand level with the middle of the card, as on the website.
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Every card as tall as the tallest, so the signatures line up.
  page: {
    flexGrow: 1,
  },
  side: {
    width: SIDE,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  mirrored: {
    transform: [{ scaleX: -1 }],
  },
})
