import { i18n } from './i18n'
import './Footer.css'

// Framer pins this to the bottom of every page, 10px in from the edges.
export default function Footer({ lang }) {
  const t = i18n[lang] ?? i18n.en
  return (
    <footer className="site-footer">
      {t.footer.submit} <a href={`mailto:${t.footer.email}`}>{t.footer.email}</a>
    </footer>
  )
}
