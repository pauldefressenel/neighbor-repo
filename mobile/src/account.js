import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'

// The reader's account, from Supabase Auth: signed in or not, and whether
// they get the newsletter (their profile's `newsletter`). Signing up and
// signing in are the same two steps, an address and then the six-digit code
// e-mailed to it (`sendCode`, `verifyCode`); only signing up may create the
// account. The session survives closing the app (supabase.js). Signing in
// opens the Voisinage tab's games. Provided in app/_layout.js, above the
// [lang] segment, so changing language doesn't sign the reader out.
const AccountContext = createContext(null)

export function AccountProvider({ children }) {
  const [user, setUser] = useState(null)
  // undefined while it loads, null for an account without one yet.
  const [profile, setProfile] = useState(undefined)

  // The saved session on launch, then every sign-in and sign-out.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => data.subscription.unsubscribe()
  }, [])

  // The profile, once signed in. A new neighbour has none yet: it is made
  // by the sign-up steps that follow the code (still to be built).
  useEffect(() => {
    if (!user) {
      setProfile(undefined)
      return
    }
    let live = true
    setProfile(undefined)
    supabase
      .from('profiles')
      .select('first_name, newsletter')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => live && setProfile(data))
    return () => {
      live = false
    }
  }, [user])

  const value = useMemo(
    () => ({
      member: user
        ? {
            email: user.email,
            firstName: profile?.first_name ?? null,
            newsletter: !!profile?.newsletter,
            // A new neighbour, whose code was accepted but who hasn't
            // filled in the sign-up yet.
            needsProfile: profile === null,
          }
        : null,
      // The sign-up's answers (SignUpForm.js). The photo, if any, goes to
      // the private `photos` bucket under the neighbour's id, under a new
      // name each time (the bucket lets a neighbour add, not replace); the
      // avatar drawn from it comes later. Returns null, or the message.
      saveProfile: async ({ firstName, lastName, country, activity, photo }) => {
        if (!user) return 'Vous n’êtes pas connecté.'
        let photo_path = null
        if (photo) {
          photo_path = `${user.id}/${Date.now()}.jpg`
          const bytes = Uint8Array.from(atob(photo), (c) => c.charCodeAt(0))
          const { error } = await supabase.storage.from('photos').upload(photo_path, bytes, { contentType: 'image/jpeg' })
          if (error) return 'La photo n’a pas pu être envoyée. Réessayez.'
        }
        const row = { id: user.id, first_name: firstName, last_name: lastName, location: country, activity: activity || null }
        if (photo_path) row.photo_path = photo_path
        const { data, error } = await supabase.from('profiles').upsert(row).select('first_name, newsletter').single()
        if (error) return 'Votre inscription n’a pas pu être enregistrée. Réessayez.'
        setProfile(data)
        return null
      },
      // Each returns null when it worked, else the message to show.
      // `lang` ('fr' or 'en', the app's) picks the e-mail's language: the
      // send-email function (supabase/functions/send-email) reads it from
      // the user's metadata. It is stored on a new account
      // as it is created, and on a known one once its code is accepted, so
      // the next e-mail follows; until then a known account keeps the
      // language it had (none for the imported neighbours: French).
      sendCode: async (email, mode, lang) => {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: mode === 'up', data: { lang } },
        })
        return error ? sendError(error, mode) : null
      },
      verifyCode: async (email, token, lang) => {
        const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
        if (error) return codeError(error)
        if (data.user?.user_metadata?.lang !== lang) supabase.auth.updateUser({ data: { lang } })
        return null
      },
      // The newsletter starts off: it will be asked for in the sign-up
      // steps, never ticked in advance. Only a neighbour with a profile can
      // change it.
      setNewsletter: async (newsletter) => {
        if (!user || !profile) return
        setProfile((p) => ({ ...p, newsletter }))
        await supabase.from('profiles').update({ newsletter }).eq('id', user.id)
      },
      signOut: () => supabase.auth.signOut(),
    }),
    [user, profile],
  )

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

// Supabase's errors, in the reader's words. Signing in with an address it
// doesn't know is refused (`otp_disabled`, since the account may not be
// created then).
function sendError(error, mode) {
  if (error.code === 'otp_disabled' && mode === 'in') return "Cette adresse n'est pas encore voisine. Choisissez S'inscrire."
  if (error.status === 429 || error.code === 'over_email_send_rate_limit')
    return 'Trop de codes demandés. Réessayez dans une minute.'
  if (error.code === 'email_address_invalid') return "Cette adresse n'est pas valide."
  return "Le code n'a pas pu partir. Réessayez."
}

function codeError(error) {
  if (error.code === 'otp_expired') return 'Ce code ne fonctionne pas ou a expiré.'
  if (error.status === 429) return 'Trop d’essais. Réessayez dans une minute.'
  return 'Ce code ne fonctionne pas.'
}

export const useAccount = () => useContext(AccountContext)

// Loose on purpose: the server will have the last word.
export const isEmail = (text) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text.trim())

// The code sent by e-mail: six digits.
export const CODE_LENGTH = 6
