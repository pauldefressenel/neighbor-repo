import { View } from 'react-native'
import { router, useGlobalSearchParams, useSegments } from 'expo-router'
import Stack from 'expo-router/js-stack'
import { useReducedMotion } from 'react-native-reanimated'
import Masthead from '../../../Masthead'
import { PAGE, PAGE_REDUCED, pageTransition } from '../../../motion'
import { colors } from '../../../theme'

// The Rubriques list, with each rubrique pushed on top of it. Pressing the
// Rubriques tab again pops back to the list. The masthead lives here rather
// than in each screen so it stays put while a rubrique fades in; it shows
// the back arrow once a rubrique is open.
//
// A JS stack rather than the native one, because the transition (motion.js)
// needs its own easing. The stack keeps the outgoing screen
// mounted until its animation ends, and makes unfocused screens untouchable
// and hidden from VoiceOver.
export default function RubriquesLayout() {
  // From the URL: this stack's screens don't inherit the tab's params.
  const { lang } = useGlobalSearchParams() // from the URL, as in index.js
  const inSection = useSegments().at(-1) === '[section]'
  const back = () => (router.canGoBack() ? router.back() : router.replace(`/${lang}/rubriques`))
  const reduceMotion = useReducedMotion()

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <Masthead onBack={inSection ? back : undefined} backLabel="Retour aux rubriques" />
      <Stack
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.paper },
          ...pageTransition(reduceMotion ? PAGE_REDUCED : PAGE),
        }}
      />
    </View>
  )
}
