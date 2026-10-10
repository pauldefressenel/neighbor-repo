import { createContext, useContext, useMemo, useState } from 'react'

// The reader's account, as in the app (mobile/src/account.js): signed up or
// not, and whether they get the newsletter. Signing up opens The
// Neighborhood's games. A design mock-up for now: it lives in memory, nothing
// is sent anywhere, and reloading the page signs the reader out. Provided in
// App.jsx, above the language, so switching language keeps it.
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

// eslint-disable-next-line react-refresh/only-export-components
export const useAccount = () => useContext(AccountContext)

// Loose on purpose: the server will have the last word.
// eslint-disable-next-line react-refresh/only-export-components
export const isEmail = (text) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text.trim())
