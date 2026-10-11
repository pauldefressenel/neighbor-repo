import icons from './menuIcons'
import './MenuIcon.css'

// The phone header's menu icon, drawn by hand like the app's tab icons: a
// list, three dots each with a line (assets/icons/make-icons.py). When the
// menu opens, its top and bottom lines swing into a cross while the dots and
// the middle line go, and back on closing (MenuIcon.css). The cross they
// make is `close` in menuIcons.js, which the script builds the same way; it
// sets where they cross and the room the icon takes, and is not drawn.

const SCALE = icons.menu.height / Number(icons.menu.viewBox.split(' ')[3]) // px per unit
const box = (name) => {
  const [x, y] = icons[name].viewBox.split(' ').map(Number)
  return { x, y }
}
const LIST = box('menu')
const CROSS = box('close')
const SIZE = {
  width: Math.max(icons.menu.width, icons.close.width),
  height: Math.max(icons.menu.height, icons.close.height),
}

// Where the cross crosses (50, 50 in its own units), in the list's units,
// the two standing on the same foot.
const crossing = {
  x: 50 - CROSS.x + LIST.x,
  y: ((50 - CROSS.y) * SCALE + (SIZE.height - icons.close.height) - (SIZE.height - icons.menu.height)) / SCALE + LIST.y,
}
// The list's lines run 28 to 94 at these heights; the cross's arms are 58
// units each way (make-icons.py, CROSS_ARM).
const LINES_Y = [26, 50, 74]
const STRETCH = (58 * Math.SQRT2) / (94 - 28)

// A stroke's transform: the dots (0–2) shrink where they are, the middle
// line (4) goes, the top and bottom lines (3, 5) swing into the cross.
const stroke = (i, open) => {
  if (i < 3) return { transformOrigin: `12px ${LINES_Y[i]}px` }
  const k = i - 3
  const origin = { transformOrigin: `61px ${LINES_Y[k]}px` }
  if (!open) return origin
  const move = `translate(${crossing.x - 61}px, ${crossing.y - LINES_Y[k]}px)`
  if (k === 1) return { ...origin, transform: `${move} scaleX(0)`, opacity: 0 }
  return { ...origin, transform: `${move} rotate(${k === 0 ? 45 : -45}deg) scaleX(${STRETCH})` }
}

export default function MenuIcon({ open }) {
  const icon = icons.menu
  return (
    <span className={`menu-icon${open ? ' menu-icon--open' : ''}`} style={SIZE}>
      <svg width={icon.width} height={icon.height} viewBox={icon.viewBox} fill="none" aria-hidden="true">
        {icon.d.split(/(?=M)/).map((d, i) => (
          <path
            key={i}
            d={d.trim()}
            style={stroke(i, open)}
            stroke="currentColor"
            strokeWidth={icon.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </span>
  )
}
