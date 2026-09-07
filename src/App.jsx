import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout'
import BroadsheetPage from './BroadsheetPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/en" replace />} />
        <Route path="/broadsheet" element={<BroadsheetPage />} />
        <Route path="/:lang/*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  )
}
