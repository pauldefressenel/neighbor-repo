import { StyleSheet, Text, View } from 'react-native'
import { colors, fonts } from './theme'

// Three asterisks in a row (a dinkus), the old section break, closing a page
// title and setting it apart from the first card.
export default function Dinkus({ style }) {
  return (
    <View style={[styles.dinkus, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Text style={styles.star}>*</Text>
      <Text style={styles.star}>*</Text>
      <Text style={styles.star}>*</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  // 20pt between the asterisks themselves (measured): each glyph's own side
  // bearings add 4pt to the gap.
  dinkus: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  // A full line box: iOS clips a glyph to its box, and the asterisk sits at
  // the top of it.
  star: {
    fontFamily: fonts.averiaSerif,
    fontSize: 26,
    lineHeight: 26,
    color: colors.ink,
  },
})
