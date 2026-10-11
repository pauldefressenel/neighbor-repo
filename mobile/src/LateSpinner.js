import { useEffect, useState } from 'react'
import { ActivityIndicator } from 'react-native'
import { colors } from './theme'

// How long a page waits for its content before showing a spinner. Shown at
// once, it flashed for an instant before the articles took its place; a
// usual load is in well before this, so only a slow one shows it.
export const SPINNER_DELAY = 700

// A loading spinner that shows only once loading has taken SPINNER_DELAY.
// It is mounted while the content loads and goes when it arrives, so each
// load waits afresh.
export default function LateSpinner({ style }) {
  const [late, setLate] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setLate(true), SPINNER_DELAY)
    return () => clearTimeout(timer)
  }, [])
  return late ? <ActivityIndicator style={style} color={colors.ink} /> : null
}
