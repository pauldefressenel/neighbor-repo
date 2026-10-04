import { Redirect, useLocalSearchParams } from 'expo-router'
import { Tabs } from 'expo-router/js-tabs'
import TabBar from '../../TabBar'
import { i18n } from '../../i18n'
import { colors } from '../../theme'

// The four tabs. Each screen draws its own masthead; the order here is the
// order of the bar.
export default function TabsLayout() {
  const { lang } = useLocalSearchParams()
  if (!i18n[lang]) return <Redirect href="/fr" />

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.paper } }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="rubriques" />
      <Tabs.Screen name="voisinage" />
      <Tabs.Screen name="a-propos" />
    </Tabs>
  )
}
