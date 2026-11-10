import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'virtual:tokens.css'
import './index.css'
import App from './App.jsx'
import { Analytics } from '@vercel/analytics/react'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* Vercel Web Analytics: page views, without cookies (PrivacyPage.jsx says so). */}
    <Analytics />
  </StrictMode>,
)
