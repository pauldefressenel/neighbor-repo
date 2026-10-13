// TEMPORARY: a comparison sheet of ways for the phone's Rubriques switch
// (RubriqueSwitch.jsx) to appear, its line included, at /:lang/switch-appear.
// Each letter is the switch at phone width; "Rejouer" plays them all again, a
// tap on a switch replays that one.
// A — as now: the names one after another, then the arrow and line rise 5px;
// B — the names one after another, then the line draws itself left to right;
// C — the line draws itself first, then the names rise onto it;
// D — the line draws from the middle outwards as the names rise;
// E — names and line rise together, as one block;
// F — the line draws left to right, each name rising as the pen passes it.
// Delete this file, SwitchAppearSheet.css and the route in Layout.jsx once
// one is chosen.
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { i18n } from './i18n'
import Rule from './Rule'
import './SwitchAppearSheet.css'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

function Switch({ letter, names }) {
  const [run, setRun] = useState(0)
  return (
    <button type="button" className={`sa-switch sa-${letter}`} key={run} onClick={() => setRun((n) => n + 1)}>
      <span className="sa-bar">
        <span className="sa-row">
          {names.map((name, i) => (
            <span key={name} className={`sa-name${i === 1 ? ' sa-name--active' : ''}`} style={{ '--i': i }}>
              {name}
            </span>
          ))}
        </span>
        <span className="sa-arrow">
          <svg width="10" height="16" viewBox="0 0 16 26" fill="none" aria-hidden="true">
            <path d="M12.1 3.1 C10.9 4.6 9.2 6.6 7.6 8.2 C6 9.9 4.4 11.4 2.9 12.8 C2.6 13.1 2.6 13.4 2.9 13.7 C4.6 15.3 6.4 17 8 18.8 C9.6 20.5 11.2 22.3 12.8 23.7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
      <Rule className="sa-rule" drawn />
    </button>
  )
}

export default function SwitchAppearSheet() {
  const { lang } = useParams()
  const t = i18n[lang] ?? i18n.en
  const names = [t.latest, ...t.sections.map((s) => s.label)]
  const [round, setRound] = useState(0)
  return (
    <main className="sa-sheet">
      <button type="button" className="sa-replay" onClick={() => setRound((n) => n + 1)}>Rejouer</button>
      {LETTERS.map((letter) => (
        <section key={`${letter}-${round}`} className="sa-option">
          <p className="sa-letter">{letter}</p>
          <Switch letter={letter} names={names} />
        </section>
      ))}
    </main>
  )
}
