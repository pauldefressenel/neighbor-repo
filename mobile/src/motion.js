import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native'

// Moving between the Rubriques list and a rubrique: the rubrique slides in
// from the right, pushing the list off to the left, and back plays it in
// reverse. Framer's Mobile — Rubriques Playground has a plain crossfade
// instead; `slide: false` brings it back.
export const PAGE = {
  duration: 500,
  easing: Easing.bezier(0.22, 1, 0.36, 1),
  slide: true,
}

// With Reduce Motion on, a brief fade and no sliding.
export const PAGE_REDUCED = {
  duration: 150,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  slide: false,
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
// Sliding, the screen on top comes in from the right as the one underneath
// leaves to the left, side by side. Otherwise the screen underneath fades out
// as the one on top fades in. Neither casts a shadow or dims, so the paper
// stays even throughout.
export const pageTransition = ({ duration, easing, slide }) => {
  const spec = { animation: 'timing', config: { duration, easing } }
  return {
    transitionSpec: { open: spec, close: spec },
    cardOverlayEnabled: false,
    cardShadowEnabled: false,
    cardStyleInterpolator: ({ current, next, layouts }) => {
      const clamp = { extrapolate: 'clamp' }
      if (slide) {
        const width = layouts.screen.width
        const slideIn = current.progress.interpolate({ inputRange: [0, 1], outputRange: [width, 0], ...clamp })
        const slideOut = next ? next.progress.interpolate({ inputRange: [0, 1], outputRange: [0, -width], ...clamp }) : 0
        return {
          cardStyle: { transform: [{ translateX: Animated.add(slideIn, slideOut) }] },
        }
      }
      const fadeIn = current.progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1], ...clamp })
      const fadeOut = next ? next.progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0], ...clamp }) : 1
      return {
        cardStyle: { opacity: Animated.multiply(fadeIn, fadeOut) },
      }
    },
  }
}

// A Pressable that eases to PRESS.opacity while held and back on release,
// scaling to `pressScale` as it goes (1 by default: no scaling). Article cards
// pass `pressOpacity={1}` to shrink without fading. `style` goes on the faded
// view, not the touch target.
//
// With `scaleChildren`, it doesn't scale itself: the parts of its content
// wrapped in `Pressed` shrink instead, and the rest stays exactly still. A
// portrait's drawing blurred while its card shrank, even when held at its
// own size, because the card moved it by fractions of a pixel.
export function FadePressable({ style, children, onPressIn, onPressOut, pressScale = 1, pressOpacity = PRESS.opacity, scaleChildren = false, ...props }) {
  // 1 at rest, 0 fully pressed; opacity and scale both follow it.
  const rest = useRef(new Animated.Value(1)).current
  const opacity = rest.interpolate({ inputRange: [0, 1], outputRange: [pressOpacity, 1] })
  const scale = rest.interpolate({ inputRange: [0, 1], outputRange: [pressScale, 1] })
  const fade = (toValue) =>
    Animated.timing(rest, { toValue, duration: PRESS.duration, easing: PRESS.easing, useNativeDriver: true }).start()
  // Whether it is held, for what's inside (`useHeld`).
  const [held, setHeld] = useState(false)

  return (
    <Pressable
      {...props}
      onPressIn={(e) => {
        fade(0)
        setHeld(true)
        onPressIn?.(e)
      }}
      onPressOut={(e) => {
        fade(1)
        setHeld(false)
        onPressOut?.(e)
      }}
    >
      <Animated.View style={[style, { opacity, transform: scaleChildren ? [] : [{ scale }] }]}>
        <HeldContext.Provider value={held}>
          <PressScaleContext.Provider value={scaleChildren ? scale : null}>{children}</PressScaleContext.Provider>
        </HeldContext.Provider>
      </Animated.View>
    </Pressable>
  )
}

// Whether the FadePressable around a view is being held. A portrait's
// animation pauses on its current frame while its card is pressed.
const HeldContext = createContext(false)
export const useHeld = () => useContext(HeldContext)

// The press scale for `Pressed` views, inside a FadePressable with
// `scaleChildren`.
const PressScaleContext = createContext(null)

// The part of a FadePressable's content that shrinks on press, when the
// FadePressable leaves the rest still (`scaleChildren`). Elsewhere, a plain
// View.
export function Pressed({ style, children }) {
  const scale = useContext(PressScaleContext)
  if (!scale) return <View style={style}>{children}</View>
  return <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
}

// How a rubrique's page builds up as it slides in, from Framer's Articles
// Layout (title) and Article Vignette (cards). Delays are in ms from the
// moment the page mounts; springs are Framer's duration and bounce. (Playing
// it 30% faster was tried and rejected.)
export const APPEAR = {
  // The page title, one line at a time.
  titleLines: { rise: 10, delay: 200, stagger: 75, spring: { duration: 400, bounce: 0.4 } },
  // The dinkus under the page title, once the title is in.
  dinkus: { rise: 5, delay: 350, spring: { duration: 200, bounce: 0 } },
  // Each card (portraits too) rises all at once, with the line below it, as
  // soon as the dinkus is up. (Two beats, at 500 and 550, felt slow; 250 felt rushed.)
  card: { rise: 5, delay: 400, spring: { duration: 200, bounce: 0 } },
  line: { rise: 5, delay: 400, spring: { duration: 200, bounce: 0 } },
  max: 5, // cards further down start offscreen and are shown as they are
  // An article's page, top to bottom: the category and byline, the title, then
  // the reading time and text. The website's timings (0.15, 0.2, 0.3s, in
  // ArticlePage.css) were spent inside the 500ms slide and went unseen, so it
  // plays later and slower, ending as the article lists' cards do.
  article: {
    heading: { rise: 10, delay: 300, spring: { duration: 400, bounce: 0 } }, // category and byline
    title: { rise: 10, delay: 350, spring: { duration: 400, bounce: 0 } },
    body: { rise: 10, delay: 400, spring: { duration: 400, bounce: 0 } },
  },
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

// The masthead's back arrow pops in as a rubrique slides in, growing quickly
// from `from` to its full size without overshooting (a bounce was tried and
// rejected), a beat after the slide starts (`delay`), and goes out quickly on
// the way back.
export const BACK_POP = {
  from: 0.3,
  delay: 150,
  spring: { duration: 300, bounce: 0 },
  out: { duration: 150, easing: Easing.bezier(0.25, 0.1, 0.25, 1) },
}

// A value between 0 and 1 that springs up to 1 when `visible`
// turns on and eases back to 0 when it turns off, on BACK_POP. Starts at its
// resting value so nothing animates on mount. Opacity and scale follow it.
export function usePop(visible) {
  const value = useRef(new Animated.Value(visible ? 1 : 0)).current
  useEffect(() => {
    const anim = visible
      ? Animated.spring(value, { toValue: 1, delay: BACK_POP.delay, ...springConfig(BACK_POP.spring), useNativeDriver: true })
      : Animated.timing(value, { toValue: 0, ...BACK_POP.out, useNativeDriver: true })
    anim.start()
    return () => anim.stop()
  }, [visible, value])
  return {
    opacity: value.interpolate({ inputRange: [0, 0.5], outputRange: [0, 1], extrapolate: 'clamp' }),
    transform: [{ scale: value.interpolate({ inputRange: [0, 1], outputRange: [BACK_POP.from, 1] }) }],
  }
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
