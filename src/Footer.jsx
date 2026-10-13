import { Link } from 'react-router-dom'
import Rule from './Rule'
import './Footer.css'

// Under a drawn line, the wordmark with the year in grey under it, and
// nothing else for now. (It had two newspaper columns beside them, the
// sections and the paper's own pages with the submission e-mail, chosen on a
// comparison sheet (C); they went while The Neighborhood and About are
// closed. Their words are still `footer` in i18n.js.)
export default function Footer({ lang }) {
  return (
    <footer className="site-footer">
      <Rule />
      <div className="footer-grid">
        <div className="footer-intro">
          <Link to={`/${lang}`} className="footer-wordmark">
            The Neighbor
          </Link>
          <p className="footer-rights">© {new Date().getFullYear()} The Neighbor</p>
        </div>
      </div>
    </footer>
  )
}
