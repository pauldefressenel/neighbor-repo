// The little rivers that separate articles in the list.
//
// Each shape is a centreline across a 400-wide, RIVER_HEIGHT-tall box, as
// [x, y, half-width] points. Every shape runs downhill from left to right;
// odd separators are mirrored so the river seems to wind back and forth down
// the page, leaving one article on the right and re-entering the next from
// the right.
export const RIVER_HEIGHT = 110

// Set to true to bring back the rivers between articles and rubriques;
// while false they are separated by blank space.
export const SHOW_RIVERS = false

export const RIVER_SHAPES = [
  // Long gentle slope, like a river seen from a hillside.
  [[-10, 14, 8], [90, 22, 9], [190, 44, 10], [290, 70, 8], [410, 92, 6]],
  // Holds its line, then drops through an S-bend.
  [[-10, 18, 6], [100, 18, 8], [200, 56, 11], [300, 86, 7], [410, 92, 6]],
  // Early dip, a slow pool, then on down.
  [[-10, 10, 7], [110, 48, 6], [220, 60, 10], [320, 68, 7], [410, 98, 8]],
  // A small wobble upstream before it descends.
  [[-10, 24, 7], [70, 34, 9], [150, 30, 7], [250, 68, 10], [340, 86, 6], [410, 96, 7]],
  // Steep in the middle, flattening towards the bank.
  [[-10, 12, 6], [100, 20, 7], [170, 52, 9], [260, 82, 8], [410, 94, 6]],
]

// Catmull-Rom through the centreline, sampled densely enough that the banks
// can be drawn as polylines without visible corners.
function sample(points, steps = 16) {
  const out = []
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    for (let s = 0; s < steps; s++) {
      const t = s / steps
      const t2 = t * t
      const t3 = t2 * t
      out.push(p1.map((_, k) => 0.5 * (
        2 * p1[k] +
        (-p0[k] + p2[k]) * t +
        (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 +
        (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3
      )))
    }
  }
  out.push(points[points.length - 1])
  return out
}

const line = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('')

// SVG paths for one river drawn `width` wide: the water, and its two banks.
export function riverPaths(shape, width, mirrored) {
  const scale = width / 400
  const centre = sample(shape.map(([x, y, w]) => [mirrored ? 400 - x : x, y, w]))
  const left = []
  const right = []
  centre.forEach(([x, y, w], i) => {
    const [ax, ay] = centre[Math.max(i - 1, 0)]
    const [bx, by] = centre[Math.min(i + 1, centre.length - 1)]
    const dx = (bx - ax) * scale
    const dy = by - ay
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len
    const ny = dx / len
    left.push([x * scale + nx * w, y + ny * w])
    right.push([x * scale - nx * w, y - ny * w])
  })
  return {
    water: `${line(left)}${line([...right].reverse()).replace('M', 'L')}Z`,
    banks: [line(left), line(right)],
  }
}

// A shape index per separator, picked afresh on every load, never repeating
// the one just above it.
export function pickRivers(count) {
  const picks = []
  for (let i = 0; i < count; i++) {
    let n
    do n = Math.floor(Math.random() * RIVER_SHAPES.length)
    while (RIVER_SHAPES.length > 1 && n === picks[i - 1])
    picks.push(n)
  }
  return picks
}
