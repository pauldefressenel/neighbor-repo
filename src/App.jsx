import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AccountProvider } from './account'
import Layout from './Layout'
import BroadsheetPage from './BroadsheetPage'

// The language for the bare address when middleware.js hasn't already
// picked one (in development): the reader's last choice, else English.
const chosenLanguage = () => document.cookie.match(/(?:^|;\s*)lang=(en|fr)\b/)?.[1] ?? 'en'

export default function App() {
  return (
    <AccountProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to={`/${chosenLanguage()}`} replace />} />
          <Route path="/broadsheet" element={<BroadsheetPage />} />
          <Route path="/:lang/*" element={<Layout />} />
        </Routes>
      </BrowserRouter>
    </AccountProvider>
  )
}
