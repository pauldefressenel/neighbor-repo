import Svg, { Path } from 'react-native-svg'
import { colors } from './theme'

// Stand-ins for hand-drawn icons, drawn as slightly uneven SVG strokes so
// they sit with the PNG ones. Replace them with drawn PNGs (assets/icons/)
// once they exist.

// A house: the Voisinage tab.
export function HouseIcon({ size = 22, color = colors.ink }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2.6 11.4 C5.6 8.6 8.8 5.8 12.1 2.9 C15.3 5.7 18.5 8.5 21.5 11.3"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.1 9.6 L5.3 20.6 L18.9 20.8 L18.8 9.4"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 20.7 L10.1 14.6 C10.1 14.1 10.4 13.8 10.9 13.8 L13.2 13.8 C13.7 13.8 14 14.1 14 14.6 L14.1 20.7"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
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
