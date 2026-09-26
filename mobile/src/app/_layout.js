import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'
import { EBGaramond_400Regular, EBGaramond_500Medium } from '@expo-google-fonts/eb-garamond'
import { GeistMono_500Medium, GeistMono_700Bold } from '@expo-google-fonts/geist-mono'
import { colors } from '../theme'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'NeighborFont-Regular': require('../../assets/fonts/NeighborFont-Regular.otf'),
    'NeighborFont-Medium': require('../../assets/fonts/NeighborFont-Medium.otf'),
    EBGaramond_400Regular,
    EBGaramond_500Medium,
    GeistMono_500Medium,
    GeistMono_700Bold,
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
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }} />
    </>
  )
}
