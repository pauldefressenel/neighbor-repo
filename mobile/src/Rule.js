import { useState } from 'react'
import { View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { colors } from './theme'

// The hand-drawn rule from assets/path.svg: a 390-wide line that sags
// slightly left of centre. It is stretched to whatever width it is given, so
// the masthead's full-width rule and the shorter rules between rubriques are
// the same line at different sizes. `mid` is the line's resting height; `inset`
// keeps round ends inside the box.
function rulePath(width, mid, inset) {
  const w = width - 2 * inset
  const s = w / 390
  const dip = 1.642 * s
  const x = (v) => inset + v
  return `M ${x(0)} ${mid} C ${x(0)} ${mid} ${x(30.104 * s)} ${mid - dip} ${x(140 * s)} ${mid} C ${x(249.896 * s)} ${mid + dip} ${x(w)} ${mid} ${x(w)} ${mid}`
}

// `weight` is the stroke width; the box grows with it so a heavier line
// isn't clipped. `round` gives the line round ends instead of square ones.
export default function Rule({ style, weight = 1, round = false }) {
  const [width, setWidth] = useState(0)
  const height = 2 + weight
  return (
    <View style={[{ height }, style]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Path
            d={rulePath(width, height / 2, round ? weight / 2 : 0)}
            fill="none"
            stroke={colors.ink}
            strokeWidth={weight}
            strokeLinecap={round ? 'round' : 'butt'}
          />
        </Svg>
      ) : null}
    </View>
  )
}
