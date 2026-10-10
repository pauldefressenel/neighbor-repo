import { createContext, useContext, useMemo, useState } from 'react'

// The reader's account: signed up or not, and whether they get the
// newsletter. Signing up opens the Voisinage tab's games. For now this only
// lives in memory, to try out the design: nothing is sent anywhere, and
// closing the app signs the reader out. Provided in app/_layout.js, above
// the [lang] segment, so changing language doesn't sign the reader out.
const AccountContext = createContext(null)

export function AccountProvider({ children }) {
  const [member, setMember] = useState(null)

  const value = useMemo(
    () => ({
      member,
      // Stands in for the request to the server, so the form's waiting
      // state can be seen.
      signUp: (email, newsletter) =>
        new Promise((resolve) => {
          setTimeout(() => {
            setMember({ email, newsletter })
            resolve()
          }, 700)
        }),
      setNewsletter: (newsletter) => setMember((m) => (m ? { ...m, newsletter } : m)),
      signOut: () => setMember(null),
    }),
    [member],
  )

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
}

export const useAccount = () => useContext(AccountContext)

// Loose on purpose: the server will have the last word.
export const isEmail = (text) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text.trim())
