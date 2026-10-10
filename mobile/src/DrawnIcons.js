import Svg, { Path } from 'react-native-svg'
import tabIcons from './tabIcons'
import { colors } from './theme'

// One of the tab bar's icons (a-la-une, rubriques, voisinage, a-propos): a
// crown, a tilted ticket, three people and a painter's palette, with gently
// bent lines so they look drawn by hand. They are generated, with their
// sizes and stroke widths, by assets/icons/make-icons.py into tabIcons.js;
// change the script and run it again rather than editing that file. Every
// stroke comes out about 1.7pt thick at the drawn size.
export function TabIcon({ name, color = colors.ink }) {
  const icon = tabIcons[name]
  return (
    <Svg width={icon.width} height={icon.height} viewBox={icon.viewBox}>
      <Path
        d={icon.d}
        stroke={color}
        strokeWidth={icon.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  )
}

// A drawn tick box, ticked in red.
export function CheckBox({ checked, size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3.6 4.4 C3.7 3.9 4 3.6 4.6 3.6 L19.4 3.4 C20 3.4 20.4 3.8 20.4 4.4 L20.6 19.5 C20.6 20.1 20.2 20.5 19.6 20.5 L4.5 20.7 C3.9 20.7 3.6 20.3 3.5 19.7 Z"
        stroke={colors.ink}
        strokeWidth={1.3}
        strokeLinejoin="round"
      />
      {checked ? (
        <Path
          d="M6.6 12.4 C8 13.6 9.2 15 10.2 16.9 C12.6 11.6 15.6 7.6 19.8 4.3"
          stroke={colors.red}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </Svg>
  )
}
