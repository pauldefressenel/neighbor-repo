import { useWindowDimensions, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { RIVER_HEIGHT, RIVER_SHAPES, SHOW_RIVERS, riverPaths } from './rivers'
import { colors } from './theme'

// A separator between two articles; see rivers.js. It bleeds past the list's
// 20px gutter so the water runs off both edges of the screen.
export default function River({ shape, mirrored }) {
  const { width } = useWindowDimensions()
  const { water, banks } = riverPaths(RIVER_SHAPES[shape], width, mirrored)
  return (
    <View style={{ marginHorizontal: -20, marginBottom: 20 }}>
      <Svg width={width} height={RIVER_HEIGHT}>
        <Path d={water} fill={colors.water} />
        {banks.map((d, i) => <Path key={i} d={d} fill="none" stroke={colors.bank} strokeWidth={1} />)}
      </Svg>
    </View>
  )
}

// What goes between item n and n + 1 of a list. Separator n runs downhill
// left to right when n is even and right to left when odd, so the rivers
// read as one winding down the page. `shapes` comes from pickRivers().
export function Separator({ index, shapes }) {
  if (!SHOW_RIVERS) return <View style={{ height: 30 }} />
  return <River shape={shapes[index]} mirrored={index % 2 === 1} />
}
