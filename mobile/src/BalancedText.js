import { useState } from 'react'
import { Text, View } from 'react-native'

// Text with balanced lines, like CSS `text-wrap: balance` (Framer's
// "Balance"), which React Native lacks. The text is laid out invisibly at the
// full width to count its lines, then at narrower and narrower widths (a
// binary search, a few frames) for the narrowest that keeps that count. It is
// shown at that width, so its lines come out about the same length. Until the
// search ends it shows at the full width. For centred text.
//
// With `maxFill` (a fraction, e.g. 0.8), a single line wider than that share
// of the width is broken into two balanced lines instead.
export default function BalancedText({ style, children, maxFill }) {
  const [full, setFull] = useState(0) // the width available
  const [count, setCount] = useState(0) // lines at the full width
  const [range, setRange] = useState(null) // [too narrow, wide enough]
  const [width, setWidth] = useState(null) // the answer

  const onLayout = (e) => {
    const w = Math.floor(e.nativeEvent.layout.width)
    if (w === full) return
    setFull(w)
    setCount(0)
    setRange(null)
    setWidth(null)
  }

  // The width being tried, or the full width while the lines are counted.
  const probe = !full || width ? null : range ? Math.floor((range[0] + range[1]) / 2) : full

  const onProbe = (e) => {
    const lines = e.nativeEvent.lines.length
    if (!range) {
      if (lines <= 1) {
        const line = e.nativeEvent.lines[0]
        const tooLong = maxFill && line && line.width > maxFill * full && /\s/.test(line.text.trim())
        if (!tooLong) return setWidth(full)
        // Search for the narrowest width that keeps it to two lines.
        setCount(2)
        return setRange([Math.floor(full / 2), full])
      }
      setCount(lines)
      return setRange([Math.floor(full / lines), full])
    }
    const next = lines > count ? [probe, range[1]] : [range[0], probe]
    if (next[1] - next[0] <= 2) setWidth(next[1])
    else setRange(next)
  }

  return (
    <View onLayout={onLayout}>
      <Text style={[style, width ? { width, alignSelf: 'center' } : null]}>{children}</Text>
      {probe ? (
        <Text
          key={probe}
          style={[style, { position: 'absolute', width: probe, opacity: 0 }]}
          onTextLayout={onProbe}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {children}
        </Text>
      ) : null}
    </View>
  )
}
