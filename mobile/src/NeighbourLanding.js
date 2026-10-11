import { useEffect, useRef, useState } from 'react'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { useIsFocused } from 'expo-router/react-navigation'
import { useReducedMotion } from 'react-native-reanimated'
import { MONTHS } from './ArticleCard'
import { FadePressable, NEIGHBOUR } from './motion'
import { avatarUrl, getNeighbours } from './supabase'
import { categoryType, colors } from './theme'

// How many avatars ahead are loaded while one is shown. Loading all of them
// up front would be some 30 MB over a phone's data.
const AHEAD = 3

// Voisinage for a reader who isn't signed in: "S'inscrire" and "Se
// connecter" at the top, and below them the neighbours one at a time (their
// avatar, first name, activity and the month they joined), changing every
// couple of seconds. A tap on the neighbour stops on them, another goes on.
// Only neighbours with an activity are shown. The month comes without its
// year: some neighbours joined in 2025, before the dates the old database
// kept, so a year would be wrong for them. Chosen on a comparison sheet
// (option B), with everything in the categories' type.
export default function NeighbourLanding({ onSignUp, onSignIn }) {
  const neighbour = useNeighbours()
  return (
    <View style={styles.landing}>
      <View style={styles.links}>
        <FadePressable onPress={onSignUp} hitSlop={10} accessibilityRole="button">
          <Text style={[styles.link, styles.signUp]}>S'inscrire</Text>
        </FadePressable>
        <FadePressable onPress={onSignIn} hitSlop={10} accessibilityRole="button">
          <Text style={styles.link}>Se connecter</Text>
        </FadePressable>
      </View>
      <View style={styles.stage}>{neighbour}</View>
    </View>
  )
}

// The neighbour on show, as an element, or nothing until the first avatar
// has loaded (or if the neighbours can't be fetched: the links still work).
function useNeighbours() {
  const [list, setList] = useState(null)
  const [index, setIndex] = useState(0)
  // `ready` is a ref, so the first avatar's arrival also bumps this to draw.
  const [, setLoaded] = useState(0)
  const ready = useRef(new Set())
  const paused = useRef(false)
  const shown = useRef(new Animated.Value(1)).current
  const focused = useIsFocused()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    let live = true
    getNeighbours()
      .then((all) => {
        const withActivity = all.filter((n) => n.activity?.trim())
        // A different order on every visit, so the first faces vary.
        for (let i = withActivity.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[withActivity[i], withActivity[j]] = [withActivity[j], withActivity[i]]
        }
        if (live) setList(withActivity)
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])

  // Keeps the next few avatars loading, so a change never shows a blank.
  useEffect(() => {
    if (!list?.length) return
    for (let k = 0; k <= AHEAD; k++) {
      const n = list[(index + k) % list.length]
      if (ready.current.has(n.id)) continue
      Image.prefetch(avatarUrl(n.avatar_path)).then((ok) => {
        if (!ok) return
        ready.current.add(n.id)
        // The first one to arrive starts the show.
        if (ready.current.size === 1) {
          setIndex(list.indexOf(n))
          setLoaded((c) => c + 1)
        }
      })
    }
  }, [list, index])

  // Every `dwell`, fade the neighbour out, move on to the next one whose
  // avatar has loaded, and fade back in. Stops while the tab is out of
  // view or the reader has tapped.
  useEffect(() => {
    if (!list?.length || !focused) return
    const timer = setInterval(() => {
      if (paused.current) return
      let next = (index + 1) % list.length
      for (let k = 0; k < AHEAD && !ready.current.has(list[next].id); k++) next = (next + 1) % list.length
      if (!ready.current.has(list[next].id)) return
      Animated.timing(shown, { toValue: 0, duration: NEIGHBOUR.fade, easing: NEIGHBOUR.easing, useNativeDriver: true }).start(() => {
        setIndex(next)
        Animated.timing(shown, { toValue: 1, duration: NEIGHBOUR.fade, easing: NEIGHBOUR.easing, useNativeDriver: true }).start()
      })
    }, NEIGHBOUR.dwell)
    return () => clearInterval(timer)
  }, [list, index, focused, shown])

  const n = list?.[index]
  if (!n || !ready.current.has(n.id)) return null
  const month = MONTHS[new Date(n.created_at).getMonth()]
  const motion = reduceMotion
    ? { opacity: shown }
    : { opacity: shown, transform: [{ translateY: shown.interpolate({ inputRange: [0, 1], outputRange: [NEIGHBOUR.drop, 0] }) }] }

  return (
    <Pressable
      onPress={() => {
        paused.current = !paused.current
      }}
      accessibilityLabel={`${n.first_name}, ${n.activity}, depuis ${month}`}
    >
      <Animated.View style={[styles.neighbour, motion]}>
        <Image style={styles.avatar} source={avatarUrl(n.avatar_path)} contentFit="contain" transition={0} />
        <Text style={styles.name}>{n.first_name}</Text>
        <Text style={styles.activity}>{n.activity.trim()}</Text>
        <Text style={styles.since}>Depuis {month}</Text>
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  landing: {
    flex: 1,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 20,
  },
  link: {
    ...categoryType,
    fontSize: 14,
    lineHeight: 14 * 1.1,
    letterSpacing: 14 * -0.03,
    color: colors.ink,
  },
  signUp: {
    color: colors.red,
  },
  // The neighbour sits in the middle of the space under the links.
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  neighbour: {
    alignItems: 'center',
  },
  avatar: {
    width: 160,
    height: 160,
  },
  name: {
    ...categoryType,
    fontSize: 20,
    lineHeight: 20 * 1.1,
    letterSpacing: 20 * -0.05,
    color: colors.ink,
    textAlign: 'center',
    marginTop: 4,
  },
  activity: {
    ...categoryType,
    fontSize: 14,
    lineHeight: 14 * 1.1,
    letterSpacing: 14 * -0.03,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 3,
    paddingHorizontal: 20,
  },
  since: {
    ...categoryType,
    fontSize: 11,
    lineHeight: 11 * 1.1,
    letterSpacing: 11 * -0.02,
    textAlign: 'center',
    marginTop: 4,
  },
})
