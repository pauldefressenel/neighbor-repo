import { View } from 'react-native'
import { router, useGlobalSearchParams, useSegments } from 'expo-router'
import Stack from 'expo-router/js-stack'
import { useReducedMotion } from 'react-native-reanimated'
import Masthead from './Masthead'
import { PAGE, PAGE_REDUCED, pageTransition } from './motion'
import { colors } from './theme'

// A tab whose pages slide in on top of one another: En Couverture (then an
// article) and Rubriques (then a rubrique, then an article). Pressing the tab
// again pops back to its first page. The masthead lives here rather than in
// each screen so it stays put while a page slides in; it shows the back arrow
// on every page but the first.
//
// A JS stack rather than the native one, because the transition (motion.js)
// needs its own easing. The stack keeps the outgoing screen mounted until its
// animation ends, and makes unfocused screens untouchable and hidden from
// VoiceOver.
//
// `root` is the tab's first page, for a back arrow on a page opened straight
// from a link, with nothing to go back to. `backLabel` names the arrow for
// VoiceOver, given the current route's segments.
export default function PageStack({ root, backLabel = () => 'Retour' }) {
  // From the URL: the stack's screens don't inherit the tab's params.
  const { lang } = useGlobalSearchParams()
  const segments = useSegments()
  // [lang] and the tab's own segment, then one more per page on top.
  const deeper = segments.length > 2
  const back = () => (router.canGoBack() ? router.back() : router.replace(`/${lang}${root}`))
  const reduceMotion = useReducedMotion()

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <Masthead onBack={deeper ? back : undefined} backLabel={backLabel(segments)} />
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
