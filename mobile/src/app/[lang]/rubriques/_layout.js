import { Stack } from 'expo-router'
import { colors } from '../../../theme'

// The Rubriques list, with each rubrique pushed on top of it. Pressing the
// Rubriques tab again pops back to the list.
export default function RubriquesLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }} />
}
