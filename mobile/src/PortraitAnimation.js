import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Image } from 'expo-image'
import { useIsFocused } from 'expo-router/react-navigation'
import { useReducedMotion } from 'react-native-reanimated'
import { portraitSpec } from '../../src/portraits'
import { SPRITES } from './portraitSprites'

// The website's portrait player (src/PortraitAnimation.jsx) for React Native,
// reading the same spec (src/portraitAnimations.js). That spec is written as
// CSS: percentages, 'px' strings and translates relative to the layer's own
// size. Here they are resolved to plain numbers inside the component's box.

// Framer's 110×110 slot. PORTRAIT_SCALE 1 draws it at the website's size.
const SLOT = 110
export const PORTRAIT_SCALE = 1
export const PORTRAIT_SIZE = SLOT * PORTRAIT_SCALE

export const hasPortrait = (slug) => Boolean(portraitSpec(slug))

// '49%' of `size`, '12px', or nothing for 'auto' and missing values.
const length = (v, size) => {
  if (v == null || v === 'auto') return undefined
  const n = parseFloat(v)
  return String(v).endsWith('%') ? (n / 100) * size : n
}

// A sprite with only a height takes its width from the image's proportions.
function layerSize(l) {
  if (l.w != null || !l.src) return { w: l.w, h: l.h }
  const { width, height } = SPRITES[l.src]
  return { w: (l.h * width) / height, h: l.h }
}

function layerStyle(base, override, box, rotate) {
  const l = { ...base, ...override }
  const { w, h } = layerSize(l)
  const [tx, ty] = l.translate ? l.translate.split(',').map((s) => s.trim()) : []
  const transform = [
    { translateX: length(tx, w) ?? 0 },
    { translateY: length(ty, h) ?? 0 },
  ]
  if (rotate != null) transform.push({ rotate: `${rotate}deg` })
  if (l.flip) transform.push({ scaleX: -1 })
  return {
    position: 'absolute',
    width: w,
    height: h,
    left: length(l.left, box.w),
    right: length(l.right, box.w),
    top: length(l.top, box.h),
    bottom: length(l.bottom, box.h),
    zIndex: l.z ?? 0,
    opacity: l.opacity ?? 1,
    backgroundColor: l.color,
    transform,
  }
}

// Advances through spec.steps, holding each for its `ms`, while `running`.
function useStepCycle(spec, running) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (!running || !spec?.steps) return undefined
    const id = setTimeout(() => setStep((n) => (n + 1) % spec.steps.length), spec.steps[step].ms)
    return () => clearTimeout(id)
  }, [step, running, spec])
  return spec?.steps ? spec.steps[step] : null
}

// One independent toggle per glyph: base angle ⇄ target angle every `ms`.
function useLoops(spec, running) {
  const [toggled, setToggled] = useState({})
  useEffect(() => {
    if (!running || !spec?.loops) return undefined
    const ids = spec.loops.map((loop) =>
      setInterval(() => setToggled((t) => ({ ...t, [loop.layer]: !t[loop.layer] })), loop.ms)
    )
    return () => ids.forEach(clearInterval)
  }, [running, spec])
  return toggled
}

// One of the seven portrait loops in its slot. It plays only while its
// screen is in front, and holds its first frame with Reduce Motion on.
export default function PortraitAnimation({ slug, alt }) {
  const spec = portraitSpec(slug)
  const running = useIsFocused() && !useReducedMotion()
  const step = useStepCycle(spec, running)
  const toggled = useLoops(spec, running)
  if (!spec) return null

  const visible = new Set(step?.show ?? Object.keys(spec.layers))
  return (
    <View style={styles.frame} accessible accessibilityRole="image" accessibilityLabel={alt}>
      <View style={styles.slot}>
        <View
          style={{
            width: spec.box.w,
            height: spec.box.h,
            overflow: spec.clip ? 'hidden' : 'visible',
            transform: step?.root?.flip ? [{ scaleX: -1 }] : [],
          }}
        >
          {Object.entries(spec.layers).map(([key, base]) => {
            const loop = spec.loops?.find((x) => x.layer === key)
            const rotate = loop && toggled[key] ? loop.to : base.rotate
            const style = layerStyle(base, step?.layers?.[key], spec.box, rotate)
            // Every layer stays mounted, hidden rather than removed, so no
            // sprite reloads mid-loop.
            if (!visible.has(key)) style.opacity = 0
            return base.src
              ? <Image key={key} source={SPRITES[base.src].source} style={style} contentFit="contain" />
              : <View key={key} style={style} />
          })}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    width: PORTRAIT_SIZE,
    height: PORTRAIT_SIZE,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Zorba's smaller box sits at the top of the slot, as on the site.
  slot: {
    width: SLOT,
    height: SLOT,
    alignItems: 'center',
    justifyContent: 'flex-start',
    transform: [{ scale: PORTRAIT_SCALE }],
  },
})
