// TEMPORARY: a comparison sheet of footers, at /:lang/footers. Each letter
// is shown at the page's width and in a 390px phone frame; the footers answer
// to their own box (container queries), so the frame shows the phone layout
// on any screen. Built only from what the site has while The Neighborhood and
// About are closed: the wordmark, A La Une and the rubriques, the submission
// e-mail, the language and the year.
// A — the page title's ending: an asterisk, the wordmark and the year,
//     centred, as the app closes a page;
// B — the same, with A La Une and the rubriques in one row of capitals;
// C — the header again: the wordmark on the left, the rubriques on the
//     right, on one baseline; the year and the e-mail under it, faint;
// D — a colophon: the wordmark, then a short paragraph in Garamond saying
//     what the paper is and where to send a piece, centred;
// E — the wordmark at the full width of the page, a slim row under it.
// Delete this file, FooterSheet.css and the route in Layout.jsx once a
// letter is chosen.
import { Link, useParams } from 'react-router-dom'
import { i18n } from './i18n'
import Rule from './Rule'
import './FooterSheet.css'

const WORDS = {
  en: {
    about: 'Essays, prose, poetry and portraits, in French and English.',
    send: 'To submit a piece, write to',
    desktop: 'Desktop',
    phone: 'Phone',
  },
  fr: {
    about: 'Essais, prose, poésie et portraits, en français et en anglais.',
    send: 'Pour proposer un texte, écrire à',
    desktop: 'Ordinateur',
    phone: 'Téléphone',
  },
}

function useFooter() {
  const { lang } = useParams()
  const t = i18n[lang] ?? i18n.en
  const w = WORDS[lang] ?? WORDS.en
  const links = [{ label: t.latest, to: `/${lang}` }, ...t.sections.map(({ label, value }) => ({ label, to: `/${lang}/${value}` }))]
  const rights = `© ${new Date().getFullYear()} The Neighbor`
  return { lang, t, w, links, rights, email: t.footer.email }
}

const Links = ({ links }) =>
  links.map(({ label, to }) => (
    <Link key={to} to={to} className="fs-caps">
      {label}
    </Link>
  ))

const Wordmark = ({ className = '' }) => {
  const { lang } = useParams()
  return <Link to={`/${lang}`} className={`fs-wordmark ${className}`}>The Neighbor</Link>
}

function FooterA() {
  const { rights } = useFooter()
  return (
    <footer className="fs-a">
      <span className="fs-asterisk">*</span>
      <Wordmark />
      <p className="fs-faint fs-small">{rights}</p>
    </footer>
  )
}

function FooterB() {
  const { links, rights } = useFooter()
  return (
    <footer className="fs-a">
      <span className="fs-asterisk">*</span>
      <Wordmark />
      <nav className="fs-b-links"><Links links={links} /></nav>
      <p className="fs-faint fs-small">{rights}</p>
    </footer>
  )
}

function FooterC() {
  const { links, rights, email } = useFooter()
  return (
    <footer className="fs-c">
      <Rule />
      <div className="fs-c-row">
        <Wordmark />
        <nav className="fs-c-links"><Links links={links} /></nav>
      </div>
      <div className="fs-c-row fs-c-under">
        <p className="fs-faint fs-small">{rights}</p>
        <a href={`mailto:${email}`} className="fs-faint fs-small fs-mail">{email}</a>
      </div>
    </footer>
  )
}

function FooterD() {
  const { w, rights, email } = useFooter()
  return (
    <footer className="fs-d">
      <Rule />
      <Wordmark />
      <p className="fs-d-text">
        {w.about} {w.send} <a href={`mailto:${email}`}>{email}</a>.
      </p>
      <p className="fs-faint fs-small">{rights}</p>
    </footer>
  )
}

function FooterE() {
  const { links, rights } = useFooter()
  return (
    <footer className="fs-e">
      <Rule />
      <Wordmark className="fs-e-wordmark" />
      <div className="fs-e-row">
        <p className="fs-faint fs-small">{rights}</p>
        <nav className="fs-e-links"><Links links={links} /></nav>
      </div>
    </footer>
  )
}

const OPTIONS = [['A', FooterA], ['B', FooterB], ['C', FooterC], ['D', FooterD], ['E', FooterE]]

export default function FooterSheet() {
  const { w } = useFooter()
  return (
    <main className="main fs">
      {OPTIONS.map(([letter, Footer]) => (
        <section key={letter} className="fs-option">
          <div className="fs-letter">{letter}</div>
          <p className="fs-label">{w.desktop}</p>
          <div className="fs-frame">
            <div className="fs-filler" />
            <Footer />
          </div>
          <p className="fs-label">{w.phone}</p>
          <div className="fs-frame fs-frame--phone">
            <div className="fs-filler" />
            <Footer />
          </div>
        </section>
      ))}
    </main>
  )
}
