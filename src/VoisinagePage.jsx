import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmail, useAccount } from './account'
import { i18n } from './i18n'
import PageTitle from './PageTitle'
import Rule from './Rule'
import './VoisinagePage.css'

// The page's words, French as in the app (mobile/src/app/[lang]/voisinage.js).
const COPY = {
  fr: {
    intro: 'Inscrivez-vous pour rejoindre le voisinage : les jeux du Neighbor et, si vous le voulez, notre lettre.',
    emailLabel: 'Votre adresse e-mail',
    placeholder: 'vous@exemple.fr',
    invalid: 'Cette adresse ne semble pas valide.',
    newsletter: 'Recevoir la lettre du Neighbor',
    newsletterNote: 'Les nouveaux textes et les nouvelles du journal, par e-mail.',
    submit: "S'inscrire",
    free: 'Gratuit. Vous pourrez vous désinscrire à tout moment.',
    games: 'Jeux',
    soon: 'Bientôt',
    account: 'Votre compte',
    signOut: 'Se déconnecter',
  },
  en: {
    intro: "Sign up to join the neighborhood: the Neighbor's games and, if you like, our letter.",
    emailLabel: 'Your e-mail address',
    placeholder: 'you@example.com',
    invalid: "This address doesn't look right.",
    newsletter: "Get the Neighbor's letter",
    newsletterNote: 'New pieces and news from the paper, by e-mail.',
    submit: 'Sign up',
    free: 'Free. You can unsubscribe at any time.',
    games: 'Games',
    soon: 'Soon',
    account: 'Your account',
    signOut: 'Sign out',
  },
}

// The games, for readers who have signed up. They don't exist yet: the list
// is laid out like the app's Rubriques list, with names to be decided.
const GAMES = {
  fr: [
    { name: 'Mots croisés', subtitle: 'Une grille par numéro' },
    { name: 'Qui a écrit ?', subtitle: "Retrouver l'auteur d'une phrase" },
    { name: 'Le Mot juste', subtitle: 'Un mot par jour' },
  ],
  en: [
    { name: 'Crossword', subtitle: 'One grid per issue' },
    { name: 'Who Wrote It?', subtitle: 'Find the author of a sentence' },
    { name: 'The Right Word', subtitle: 'One word a day' },
  ],
}

// The Neighborhood, the app's Voisinage: signed out, the sign-up form (an
// e-mail address and the newsletter); signed up, the games, then the
// reader's account. A mock-up: see account.jsx.
export default function VoisinagePage() {
  const { lang } = useParams()
  const { member } = useAccount()
  const copy = COPY[lang] ?? COPY.en
  const t = i18n[lang] ?? i18n.en
  return (
    <main className="main voisinage">
      <PageTitle>{t.neighborhood}</PageTitle>
      {/* Keyed so the new content rises in when signing up or out swaps it. */}
      {member
        ? <Neighbourhood key="member" copy={copy} games={GAMES[lang] ?? GAMES.en} />
        : <SignUp key="signup" copy={copy} />}
    </main>
  )
}

function SignUp({ copy }) {
  const { signUp } = useAccount()
  const [email, setEmail] = useState('')
  const [newsletter, setNewsletter] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (event) => {
    event.preventDefault()
    if (!isEmail(email)) {
      setError(copy.invalid)
      return
    }
    setError(null)
    setSending(true)
    await signUp(email.trim(), newsletter)
  }

  return (
    <form className="voisinage-content" onSubmit={submit} noValidate>
      <p className="voisinage-intro">{copy.intro}</p>

      <label className="voisinage-field">
        <span className="voisinage-label">{copy.emailLabel}</span>
        <input
          className="voisinage-input"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError(null)
          }}
          placeholder={copy.placeholder}
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          disabled={sending}
        />
        <Rule className="voisinage-input-rule" />
        {error && <span className="voisinage-error">{error}</span>}
      </label>

      <NewsletterBox copy={copy} checked={newsletter} onToggle={() => setNewsletter(!newsletter)} />

      <button className="voisinage-button" type="submit" disabled={sending}>
        {sending ? '…' : copy.submit}
      </button>
      <p className="voisinage-small">{copy.free}</p>
    </form>
  )
}

function Neighbourhood({ copy, games }) {
  const { member, setNewsletter, signOut } = useAccount()
  return (
    <div className="voisinage-content">
      <p className="voisinage-section-label">{copy.games}</p>
      {games.map((game, i) => (
        <div key={game.name} className="voisinage-game">
          <div className="voisinage-game-line">
            <span className="voisinage-game-name">{i + 1}. {game.name}</span>
            <span className="voisinage-soon">{copy.soon}</span>
          </div>
          <p className="voisinage-game-subtitle">{game.subtitle}</p>
          <Rule className="voisinage-game-rule" />
        </div>
      ))}

      <p className="voisinage-section-label">{copy.account}</p>
      <p className="voisinage-email">{member.email}</p>
      <NewsletterBox copy={copy} checked={member.newsletter} onToggle={() => setNewsletter(!member.newsletter)} />
      <button type="button" className="voisinage-sign-out" onClick={signOut}>{copy.signOut}</button>
    </div>
  )
}

function NewsletterBox({ copy, checked, onToggle }) {
  return (
    <button type="button" className="voisinage-option" role="checkbox" aria-checked={checked} onClick={onToggle}>
      <CheckBox checked={checked} />
      <span className="voisinage-option-text">
        <span className="voisinage-option-title">{copy.newsletter}</span>
        <span className="voisinage-option-note">{copy.newsletterNote}</span>
      </span>
    </button>
  )
}

// The app's drawn tick box (mobile/src/DrawnIcons.js), ticked in red.
function CheckBox({ checked }) {
  return (
    <svg className="voisinage-checkbox" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3.6 4.4 C3.7 3.9 4 3.6 4.6 3.6 L19.4 3.4 C20 3.4 20.4 3.8 20.4 4.4 L20.6 19.5 C20.6 20.1 20.2 20.5 19.6 20.5 L4.5 20.7 C3.9 20.7 3.6 20.3 3.5 19.7 Z"
        stroke="#1a1a1a"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      {checked && (
        <path
          d="M6.6 12.4 C8 13.6 9.2 15 10.2 16.9 C12.6 11.6 15.6 7.6 19.8 4.3"
          stroke="#FF1919"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}
