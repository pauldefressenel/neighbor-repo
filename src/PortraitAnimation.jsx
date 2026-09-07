import { useState, useEffect, useRef } from 'react'
import { portraitSpec } from './portraits'
import './PortraitAnimation.css'

// Framer only advances a portrait's variant cycle while the component is on
// screen, so we do the same rather than ticking every card on the page.
function useInView(ref) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); return undefined }
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 })
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return inView
}

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Advances through spec.steps, holding each for its `ms`, while `running`.
function useStepCycle(spec, running) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (!running || !spec.steps) return undefined
    const id = setTimeout(() => setStep((n) => (n + 1) % spec.steps.length), spec.steps[step].ms)
    return () => clearTimeout(id)
  }, [step, running, spec])
  return spec.steps ? spec.steps[step] : null
}

// One independent toggle per glyph: base angle ⇄ target angle every `ms`.
function useLoops(spec, running) {
  const [toggled, setToggled] = useState({})
  useEffect(() => {
    if (!running || !spec.loops) return undefined
    const ids = spec.loops.map((loop) =>
      setInterval(() => setToggled((t) => ({ ...t, [loop.layer]: !t[loop.layer] })), loop.ms)
    )
    return () => ids.forEach(clearInterval)
  }, [running, spec])
  return toggled
}

function layerStyle(base, override, spec, toggled, layerKey) {
  const l = { ...base, ...override }
  const flip = l.flip ? ' rotateY(180deg)' : ''
  const loop = spec.loops?.find((x) => x.layer === layerKey)
  const rotate = loop ? (toggled[layerKey] ? loop.to : base.rotate) : base.rotate
  const rot = rotate != null ? ` rotate(${rotate}deg)` : ''
  const translate = l.translate ? `translate(${l.translate})` : ''
  const transform = `${translate}${rot}${flip}`.trim()

  return {
    width: l.w != null ? `${l.w}px` : 'auto',
    height: l.h != null ? `${l.h}px` : 'auto',
    left: l.left, right: l.right, top: l.top, bottom: l.bottom,
    zIndex: l.z ?? 0,
    opacity: l.opacity ?? 1,
    backgroundColor: l.color,
    transform: transform || undefined,
    transition: 'none',
  }
}

/**
 * Replays one of the seven Framer portrait components inside a 110×110 slot.
 * See portraitAnimations.js for the step model.
 */
export default function PortraitAnimation({ slug, alt }) {
  const spec = portraitSpec(slug)
  const ref = useRef(null)
  const inView = useInView(ref)
  const running = inView && !reducedMotion()

  const step = useStepCycle(spec, running)
  const toggled = useLoops(spec, running)

  if (!spec) return null

  const visible = new Set(step?.show ?? Object.keys(spec.layers))
  const rootFlip = step?.root?.flip

  return (
    <div className="portrait-slot" ref={ref}>
      <div
        className="portrait-box"
        style={{
          width: spec.box.w,
          height: spec.box.h,
          overflow: spec.clip ? 'clip' : 'visible',
          transform: rootFlip ? 'rotateY(180deg)' : undefined,
        }}
      >
        {Object.entries(spec.layers).map(([key, base], i) => {
          const style = layerStyle(base, step?.layers?.[key], spec, toggled, key)
          const shown = visible.has(key)
          const common = {
            key,
            className: 'portrait-layer',
            style: { ...style, visibility: shown ? 'visible' : 'hidden' },
          }
          // Every layer stays mounted so frames never re-fetch mid-loop.
          return base.src
            ? <img {...common} src={base.src} alt={i === 0 && shown ? alt : ''} aria-hidden={i !== 0 || !shown || undefined} draggable="false" />
            : <div {...common} aria-hidden="true" />
        })}
      </div>
    </div>
  )
}
