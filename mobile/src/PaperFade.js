import { StyleSheet, View } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { headerFade } from '../../shared/tokens'
import { colors } from './theme'

// The paper fading out over headerFade (shared/tokens.js, as under the
// website's header), from a bar's line into the page, so the page scrolling
// beneath dissolves rather than being cut off at the line. `edge` is the
// bar's side of the page: 'top' hangs below a bar at the top (the
// masthead), 'bottom' stands above one at the bottom (the tab bar). It is
// drawn over the page, so the bar needs a zIndex above it, and lets touches
// through.
export default function PaperFade({ edge = 'top' }) {
  const id = `paper-fade-${edge}`
  return (
    <View style={[styles.fade, edge === 'top' ? styles.below : styles.above]} pointerEvents="none">
      <Svg width="100%" height={headerFade}>
        <Defs>
          <LinearGradient id={id} x1="0" y1={edge === 'top' ? 0 : 1} x2="0" y2={edge === 'top' ? 1 : 0}>
            <Stop offset="0" stopColor={colors.paper} stopOpacity={1} />
            <Stop offset="1" stopColor={colors.paper} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height={headerFade} fill={`url(#${id})`} />
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: headerFade,
  },
  below: {
    top: '100%',
  },
  above: {
    bottom: '100%',
  },
})
