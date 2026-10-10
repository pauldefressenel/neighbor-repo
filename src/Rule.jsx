import { useLayoutEffect, useRef, useState } from 'react'

// The hand-drawn rule from the repo's assets/path.svg, as in the app
// (mobile/src/Rule.js): a 390-wide line that sags slightly left of centre.
// That drawing, stretched across a desktop row, flattened into a ruled line,
// so a rule wider than LONG is drawn as a pen stroke instead: a filled shape
// that drifts about a pixel up and down along its length and swells and
// thins slightly, as ink does. (Twice that drift and swell looked too
// hand-drawn.) Narrower rules (a phone's) are the drawing itself.
const LONG = 600
const HEIGHT = 8
const MID = HEIGHT / 2

const original = (w) => {
  const s = w / 390
  const dip = 1.642
  return `M 0 ${MID} C 0 ${MID} ${30.104 * s} ${MID - dip} ${140 * s} ${MID} C ${249.896 * s} ${MID + dip} ${w} ${MID} ${w} ${MID}`
}

// The stroke's centre and thickness at x: a few slow waves of different
// lengths, so they never line up into a visible pattern. Fixed, so a rule of
// a given width is drawn the same on every render. Both ends come back to
// the middle.
const centre = (x, width) => {
  const ends = Math.sin((Math.PI * x) / width)
  return MID + ends * (0.7 * Math.sin(x / 173 + 0.6) + 0.4 * Math.sin(x / 61 + 2.1) + 0.1 * Math.sin(x / 19 + 1.3))
}
const thickness = (x, width) => {
  // Tapers over the first and last 30px, like a pen landing and lifting.
  const taper = Math.min(1, x / 30, (width - x) / 30)
  return (1 + 0.15 * Math.sin(x / 97 + 0.4) + 0.05 * Math.sin(x / 23)) * (0.5 + 0.5 * taper)
}

function penStroke(width) {
  const step = 4
  const xs = []
  for (let x = 0; x < width; x += step) xs.push(x)
  xs.push(width)
  const top = xs.map((x) => `${x.toFixed(1)} ${(centre(x, width) - thickness(x, width) / 2).toFixed(2)}`)
  const bottom = xs.reverse().map((x) => `${x.toFixed(1)} ${(centre(x, width) + thickness(x, width) / 2).toFixed(2)}`)
  return `M ${top.join(' L ')} L ${bottom.join(' L ')} Z`
}

export default function Rule({ className = '' }) {
  const ref = useRef(null)
  const [width, setWidth] = useState(390)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setWidth(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <svg ref={ref} className={`rule ${className}`} viewBox={`0 0 ${width} ${HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
      {width > LONG
        ? <path d={penStroke(width)} fill="currentColor" />
        : <path d={original(width)} fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
    </svg>
  )
}
