import { Redirect, useLocalSearchParams } from 'expo-router'
import { Tabs } from 'expo-router/js-tabs'
import TabBar from '../../TabBar'
import { i18n } from '../../i18n'
import { colors } from '../../theme'

// The three tabs. Each screen draws its own masthead; the order here is the
// order of the bar.
export default function TabsLayout() {
  const { lang } = useLocalSearchParams()
  if (!i18n[lang]) return <Redirect href="/fr" />

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.paper } }}
    >
      {/* Each tab starts out knowing the language: a tab first opened from
          the bar otherwise has no params at all. */}
      <Tabs.Screen name="(couverture)" initialParams={{ lang }} />
      <Tabs.Screen name="rubriques" initialParams={{ lang }} />
      <Tabs.Screen name="a-propos" initialParams={{ lang }} />
    </Tabs>
  )
}
