import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Slot } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'
import { EBGaramond_400Regular, EBGaramond_400Regular_Italic, EBGaramond_500Medium_Italic, EBGaramond_500Medium } from '@expo-google-fonts/eb-garamond'
import { GeistMono_500Medium, GeistMono_700Bold } from '@expo-google-fonts/geist-mono'
import { NewAmsterdam_400Regular } from '@expo-google-fonts/new-amsterdam'
import { Paprika_400Regular } from '@expo-google-fonts/paprika'
import { LondrinaSolid_300Light } from '@expo-google-fonts/londrina-solid'
import { colors } from '../theme'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'NeighborFont-Regular': require('../../assets/fonts/NeighborFont-Regular.otf'),
    'NeighborFont-Medium': require('../../assets/fonts/NeighborFont-Medium.otf'),
    EBGaramond_400Regular,
    EBGaramond_400Regular_Italic,
    EBGaramond_500Medium_Italic,
    EBGaramond_500Medium,
    GeistMono_500Medium,
    GeistMono_700Bold,
    NewAmsterdam_400Regular,
    Paprika_400Regular,
    LondrinaSolid_300Light,
  })

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync()
  }, [loaded, error])

  // A font that fails to load falls back to the system font rather than
  // leaving the splash screen up forever.
  if (!loaded && !error) return null

  return (
    <>
      <StatusBar style="dark" />
      {/* A Slot, not a Stack: nothing above the tabs should slide. With a
          Stack here, opening a rubrique pushed a whole new copy of the tabs,
          masthead and tab bar included. The gesture root lets the
          Rubriques stack's swipe-back work. */}
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.paper }}>
        <Slot />
      </GestureHandlerRootView>
    </>
  )
}
