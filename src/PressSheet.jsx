// TEMPORARY: a comparison sheet of press effects for the phone's Rubriques
// switch (RubriqueSwitch.jsx), at /:lang/presses. Each letter is the same row
// of names with a different press; hold a name to try it (nothing opens).
// Delete this file, PressSheet.css and the route in Layout.jsx once one is
// chosen.
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { i18n } from './i18n'
import Rule from './Rule'
import './PressSheet.css'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

function Row({ letter, names }) {
  const [pressed, setPressed] = useState(null)
  const release = () => setPressed(null)
  return (
    <section className="press-option">
      <p className="press-letter">{letter}</p>
      <div className={`press-switch press-${letter}`}>
        <div className="press-row">
          {names.map((name, i) => (
            <button
              key={name}
              type="button"
              className={`press-link${i === 0 ? ' press-link--current' : ''}${pressed === i ? ' press-link--pressed' : ''}`}
              onPointerDown={() => setPressed(i)}
              onPointerUp={release}
              onPointerLeave={release}
              onPointerCancel={release}
            >
              <span className="press-label">{name}</span>
            </button>
          ))}
        </div>
        <Rule className="press-rule" drawn />
      </div>
    </section>
  )
}

export default function PressSheet() {
  const { lang } = useParams()
  const t = i18n[lang] ?? i18n.en
  const names = [t.latest, ...t.sections.filter((s) => s.value !== 'portraits').map((s) => s.label)]
  return (
    <main className="press-sheet">
      {LETTERS.map((letter) => <Row key={letter} letter={letter} names={names} />)}
    </main>
  )
}
