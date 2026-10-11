// The neighbours' Supabase project (see the root CLAUDE.md and
// supabase/migrations). Articles stay in Sanity (sanity.js); this is only
// for the readers. The key is the project's public one, made to ship inside
// apps: it can read only what the database's rules let anyone read, here
// the `neighbours` view (first name, avatar, country, activity, in French
// and English too, date) and
// the public avatars, and a signed-in neighbour their own profile. The
// neighbours are read over plain REST; signing in goes through supabase-js.
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { AppState } from 'react-native'

const URL = 'https://btwgwcmxercrdrncqerp.supabase.co'
const KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0d2d3Y214ZXJjcmRybmNxZXJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NDY1NjgsImV4cCI6MjEwNzIyMjU2OH0.zO6bUbvaVXJsnw3_SG5Xui5U8vLJ_IHcNFvy5NAx8RM'

export const avatarUrl = (path) => `${URL}/storage/v1/object/public/avatars/${path}`

export async function getNeighbours() {
  const res = await fetch(`${URL}/rest/v1/neighbours?select=id,first_name,avatar_path,activity,activity_fr,activity_en,created_at`, {
    headers: { apikey: KEY },
  })
  if (!res.ok) throw new Error(`neighbours: ${res.status}`)
  return res.json()
}

// The session is kept in AsyncStorage, so a neighbour stays signed in when
// the app is closed. (Supabase's guide also shows an encrypted store, with
// expo-secure-store and aes-js; worth it before the app ships.) There are no
// links to open in the app: sign-in is by a code typed in, so
// detectSessionInUrl is off.
export const supabase = createClient(URL, KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// The session's token is refreshed only while the app is in front, as
// Supabase recommends for React Native: a phone suspends timers in the
// background.
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh()
  else supabase.auth.stopAutoRefresh()
})
