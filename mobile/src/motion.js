import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native'

// Moving between the Rubriques list and a rubrique: a plain crossfade, as in
// Framer's Mobile — Rubriques Playground. Back plays it in reverse.
export const PAGE = {
  duration: 500,
  easing: Easing.bezier(0.22, 1, 0.36, 1),
}

// With Reduce Motion on, the fade is brief.
export const PAGE_REDUCED = {
  duration: 150,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
}

// Touch feedback on rubrique entries and the back arrow. Rubrique entries
// also shrink (`pressScale`) while held.
export const PRESS = {
  duration: 150,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  opacity: 0.55,
  scale: 0.9,
}

// Stack options for the transition, spread into a JS Stack's screenOptions.
// The screen underneath fades out as the one on top fades in; neither casts
// a shadow or dims, so the paper stays even through the crossfade.
export const pageTransition = ({ duration, easing }) => {
  const spec = { animation: 'timing', config: { duration, easing } }
  return {
    transitionSpec: { open: spec, close: spec },
    cardOverlayEnabled: false,
    cardShadowEnabled: false,
    cardStyleInterpolator: ({ current, next }) => {
      const clamp = { extrapolate: 'clamp' }
      const fadeIn = current.progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1], ...clamp })
      const fadeOut = next ? next.progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0], ...clamp }) : 1
      return {
        cardStyle: { opacity: Animated.multiply(fadeIn, fadeOut) },
      }
    },
  }
}

// A Pressable that eases to PRESS.opacity while held and back on release,
// scaling to `pressScale` as it goes (1 by default: no scaling). `style` goes
// on the faded view, not the touch target.
export function FadePressable({ style, children, onPressIn, onPressOut, pressScale = 1, ...props }) {
  // 1 at rest, 0 fully pressed; opacity and scale both follow it.
  const rest = useRef(new Animated.Value(1)).current
  const opacity = rest.interpolate({ inputRange: [0, 1], outputRange: [PRESS.opacity, 1] })
  const scale = rest.interpolate({ inputRange: [0, 1], outputRange: [pressScale, 1] })
  const fade = (toValue) =>
    Animated.timing(rest, { toValue, duration: PRESS.duration, easing: PRESS.easing, useNativeDriver: true }).start()

  return (
    <Pressable
      {...props}
      onPressIn={(e) => {
        fade(0)
        onPressIn?.(e)
      }}
      onPressOut={(e) => {
        fade(1)
        onPressOut?.(e)
      }}
    >
      <Animated.View style={[style, { opacity, transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  )
}

// How a rubrique's page builds up once it has faded in, from Framer's
// Articles Layout (title) and Article Vignette (cards). Delays are in ms from
// the moment the page mounts; springs are Framer's duration and bounce.
export const APPEAR = {
  // The page title, one line at a time.
  titleLines: { rise: 10, delay: 200, stagger: 75, spring: { duration: 400, bounce: 0.4 } },
  // The dinkus under the page title, once the title is in.
  dinkus: { rise: 5, delay: 350, spring: { duration: 200, bounce: 0 } },
  // Each card, in four parts.
  image: { rise: 10, delay: 400, spring: { duration: 400, bounce: 0.3 } },
  top: { rise: 5, delay: 500, spring: { duration: 200, bounce: 0 } }, // category and title
  bottom: { rise: 5, delay: 550, spring: { duration: 200, bounce: 0 } }, // excerpt and author
  line: { rise: 5, delay: 800, spring: { duration: 200, bounce: 0 } }, // the river below
  max: 5, // cards further down start offscreen and are shown as they are
  // The Rubriques list, after the cards but quicker: its title rises like a
  // page title, each row's name like an image, its subtitle and rule like a
  // card's text, each row a beat after the last.
  menu: {
    title: { rise: 10, delay: 50, stagger: 75, spring: { duration: 400, bounce: 0.4 } },
    name: { rise: 10, delay: 150, spring: { duration: 400, bounce: 0.3 } },
    subtitle: { rise: 5, delay: 210, spring: { duration: 200, bounce: 0 } },
    rule: { rise: 5, delay: 270, spring: { duration: 200, bounce: 0 } },
    stagger: 60,
  },
}

// Framer's spring (duration, bounce) as React Native's stiffness and damping.
const springConfig = ({ duration, bounce }) => {
  const stiffness = (2 * Math.PI / (duration / 1000)) ** 2
  return { stiffness, damping: 2 * (1 - bounce) * Math.sqrt(stiffness), mass: 1 }
}

// Set by a list that wants its content to build up: `since` is when the page
// mounted (Date.now()), so content that arrives late, after a fetch, doesn't
// wait out delays that have already passed; `still` turns the motion off
// (Reduce Motion, or a card past APPEAR.max). Without it, Rise does nothing.
export const AppearContext = createContext(null)

// Fades its children in while they rise `rise` px into place, on one of the
// APPEAR steps.
export function Rise({ step, extraDelay = 0, style, children }) {
  const appear = useContext(AppearContext)
  const skip = !appear || appear.still
  const value = useRef(new Animated.Value(skip ? 1 : 0)).current
  useEffect(() => {
    if (skip) return
    const delay = Math.max(0, step.delay + extraDelay - (Date.now() - appear.since))
    const anim = Animated.spring(value, {
      toValue: 1,
      delay,
      ...springConfig(step.spring),
      restDisplacementThreshold: 0.001,
      restSpeedThreshold: 0.001,
      useNativeDriver: true,
    })
    anim.start()
    return () => anim.stop()
    // Plays once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const clamp = { extrapolate: 'clamp' }
  const opacity = value.interpolate({ inputRange: [0, 1], outputRange: [0, 1], ...clamp })
  const translateY = value.interpolate({ inputRange: [0, 1], outputRange: [step.rise, 0] })
  return <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>
}

// A text that rises in one line at a time (Framer's line-tokenised appear).
// The full text lays out invisibly, and is what VoiceOver reads; once its
// lines are known each is drawn over its own spot and rises on the
// APPEAR.titleLines step (or `step`).
export function RiseLines({ style, step = APPEAR.titleLines, children }) {
  const appear = useContext(AppearContext)
  const [lines, setLines] = useState(null)
  if (!appear || appear.still) return <Text style={style}>{children}</Text>
  // Margins go on the wrapper so the lines' offsets match the text's own box.
  const { marginTop, marginBottom, ...text } = StyleSheet.flatten(style)
  return (
    <View style={{ marginTop, marginBottom }}>
      <Text
        style={[text, { opacity: 0 }]}
        onTextLayout={(e) => lines || setLines(e.nativeEvent.lines.map(({ text: line, y }) => ({ text: line.trim(), y })))}
      >
        {children}
      </Text>
      {lines?.map((line, i) => (
        <Rise
          key={i}
          step={step}
          extraDelay={i * step.stagger}
          style={{ position: 'absolute', left: 0, right: 0, top: line.y }}
        >
          <Text style={text} numberOfLines={1} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {line.text}
          </Text>
        </Rise>
      ))}
    </View>
  )
}

// Eases a value between 0 and 1 as `visible` changes, on the page timing.
// Starts at its resting value so nothing animates on mount.
export function useFade(visible, { duration, easing } = PAGE) {
  const value = useRef(new Animated.Value(visible ? 1 : 0)).current
  useEffect(() => {
    const anim = Animated.timing(value, { toValue: visible ? 1 : 0, duration, easing, useNativeDriver: true })
    anim.start()
    return () => anim.stop()
  }, [visible, value, duration, easing])
  return value
}
