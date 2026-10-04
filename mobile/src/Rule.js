import { useState } from 'react'
import { View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { colors } from './theme'

const HEIGHT = 3

// The hand-drawn rule from assets/path.svg: a 390-wide line that sags
// slightly left of centre. It is stretched to whatever width it is given, so
// the masthead's full-width rule and the shorter rules between rubriques are
// the same line at different sizes.
function rulePath(width) {
  const s = width / 390
  return `M 0 1.5 C 0 1.5 ${30.104 * s} -0.142 ${140 * s} 1.5 C ${249.896 * s} 3.142 ${width} 1.5 ${width} 1.5`
}

export default function Rule({ style }) {
  const [width, setWidth] = useState(0)
  return (
    <View style={[{ height: HEIGHT }, style]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <Svg width={width} height={HEIGHT}>
          <Path d={rulePath(width)} fill="none" stroke={colors.ink} strokeWidth={1} />
        </Svg>
      ) : null}
    </View>
  )
}
