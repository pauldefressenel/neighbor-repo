import { StyleSheet, Text, View } from 'react-native'
import Masthead from './Masthead'
import { colors, fonts, pageTitle } from './theme'

// Stand-in for the tabs that don't have their own screen yet.
export default function ComingSoon({ title }) {
  return (
    <View style={styles.screen}>
      <Masthead />
      <Text style={pageTitle}>{title}</Text>
      <Text style={styles.message}>Bientôt ici.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  message: {
    fontFamily: fonts.garamond,
    fontSize: 20,
    color: colors.ink,
    textAlign: 'center',
  },
})
