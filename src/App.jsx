import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/en/literature-review" replace />} />
        <Route path="/:lang" element={<Navigate to="literature-review" replace />} />
        <Route path="/:lang/*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  )
}
