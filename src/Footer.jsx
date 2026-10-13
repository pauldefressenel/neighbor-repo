import { Link } from 'react-router-dom'
import './Footer.css'

// Centred, as the app closes a page: the page title's asterisk, the
// wordmark, and the year in faint capitals under it (A on the footer
// comparison sheet). (It had two newspaper columns, the sections and the
// paper's own pages with the submission e-mail, chosen on an earlier sheet;
// they went while The Neighborhood and About are closed. Their words are
// still `footer` in i18n.js.)
export default function Footer({ lang }) {
  return (
    <footer className="site-footer">
      <span className="footer-mark" aria-hidden="true">*</span>
      <Link to={`/${lang}`} className="footer-wordmark">
        The Neighbor
      </Link>
      <p className="footer-rights">© {new Date().getFullYear()} The Neighbor</p>
    </footer>
  )
}
