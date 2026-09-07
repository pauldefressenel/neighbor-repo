import { useState, useEffect } from 'react'
import { client, urlFor } from './sanity/client'
import './BroadsheetPage.css'

const PAL = { cream: '#FFFFF2', ink: '#1a1a1a', faint: '#888', red: '#FF1919', rule: '#ccccc4' }

const ISSUE = {
  season: 'Spring', year: '2026',
  tagline: '"By those who live here, for those who would."',
  number: 'Issue 14 — №271',
}
const SECTIONS = ['Fiction & Poetry', 'Literature Review', 'The Arts', 'Portraits', 'The Neighborhood']

function Img({ image, title, isLead = false }) {
  const h = isLead ? 326 : 132
  const mb = isLead ? 18 : 12
  if (image) {
    return (
      <img
        src={urlFor(image).width(900).url()} alt={title}
        style={{ width: '100%', height: h, objectFit: 'cover', display: 'block', marginBottom: mb }}
      />
    )
  }
  return (
    <div style={{ width: '100%', height: h, background: '#e0e0d8', marginBottom: mb }} />
  )
}

// --- Utility components ---

function Rule({ weight = 1 }) {
  return <div style={{ height: weight === 2 ? 2.5 : 1, background: PAL.ink }} />
}

function Kicker({ children }) {
  return (
    <p style={{
      fontFamily: '"Geist Mono", monospace', fontWeight: 700, fontSize: 12,
      letterSpacing: '0.08em', textTransform: 'uppercase', color: PAL.red, margin: 0,
    }}>{children}</p>
  )
}

function Dinkus() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{ fontSize: 10, color: PAL.ink, lineHeight: 1 }}>♦</span>
      ))}
    </div>
  )
}

// --- Extract plain text from Portable Text blocks ---
function blocksToText(blocks = []) {
  return blocks
    .filter(b => b._type === 'block' && b.children)
    .map(b => b.children.map(c => c.text || '').join(''))
    .filter(Boolean)
}

// --- Article sub-components ---

function SecondaryItem({ a, showImg = true }) {
  return (
    <article>
      {showImg && <Img image={a.mainImage} title={a.title} />}
      <Kicker>{a.category}</Kicker>
      <h3 style={{
        fontFamily: '"NeighborFont", serif', fontWeight: 500, fontSize: 25,
        lineHeight: 1.08, letterSpacing: '-0.02em', margin: '6px 0', color: PAL.ink,
      }}>{a.title}</h3>
      <p style={{ fontFamily: '"EB Garamond", serif', fontSize: 16.5, lineHeight: 1.28, color: PAL.ink, margin: '0 0 6px' }}>
        {a.excerpt}
      </p>
      <p style={{ fontFamily: '"EB Garamond", serif', fontStyle: 'italic', fontSize: 16, color: PAL.faint, margin: 0 }}>
        by {a.author}
      </p>
    </article>
  )
}

function RegisterItem({ a }) {
  return (
    <article>
      <Kicker>{a.category}</Kicker>
      <h4 style={{
        fontFamily: '"NeighborFont", serif', fontWeight: 500, fontSize: 21,
        lineHeight: 1.08, letterSpacing: '-0.02em', margin: '5px 0', color: PAL.ink,
      }}>{a.title}</h4>
      <p style={{ fontFamily: '"EB Garamond", serif', fontSize: 15.5, lineHeight: 1.3, color: PAL.ink, margin: '0 0 5px' }}>
        {a.excerpt}
      </p>
      <p style={{ fontFamily: '"EB Garamond", serif', fontStyle: 'italic', fontSize: 15, color: PAL.faint, margin: 0 }}>
        {a.author}
      </p>
    </article>
  )
}

// --- Main page ---

export default function BroadsheetPage() {
  const [articles, setArticles] = useState([])

  useEffect(() => {
    client.fetch(
      `*[_type == "article" && language == "en"] | order(publishedAt desc) [0...12] {
        _id, title, slug, section, language, category, author, excerpt, mainImage, publishedAt, body
      }`
    ).then(setArticles)
  }, [])

  if (articles.length === 0) return null

  const lead = articles[0]
  const rail = articles.slice(1, 4)
  const register = articles.slice(4, 12)
  const leadParagraphs = blocksToText(lead.body)

  return (
    <div style={{
      width: 1280, background: PAL.cream, color: PAL.ink,
      padding: '40px 56px 52px', boxSizing: 'border-box', margin: '0 auto',
    }}>

      {/* Masthead */}
      <header style={{ textAlign: 'center' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: '"Geist Mono", monospace', fontSize: 11, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: PAL.faint, paddingBottom: 14,
        }}>
          <span>{ISSUE.season} {ISSUE.year}</span>
          <span>Established in the neighborhood</span>
          <span>{ISSUE.number}</span>
        </div>
        <Rule weight={2} />
        <h1 style={{
          fontFamily: '"NeighborFont", serif', fontWeight: 400, fontSize: 92,
          letterSpacing: '-0.02em', lineHeight: 1, margin: '20px 0 10px', color: PAL.ink,
        }}>The Neighbor</h1>
        <p style={{
          fontFamily: '"EB Garamond", serif', fontStyle: 'italic',
          fontSize: 18, color: PAL.faint, margin: '0 0 18px',
        }}>{ISSUE.tagline}</p>
        <Rule weight={1} />
        <nav style={{
          display: 'flex', justifyContent: 'center', gap: 40, padding: '11px 0',
          fontFamily: '"Geist Mono", monospace', fontWeight: 500,
          fontSize: 12.5, letterSpacing: '-0.02em', color: PAL.ink,
        }}>
          {SECTIONS.map(s => <span key={s}>{s}</span>)}
        </nav>
        <Rule weight={2} />
      </header>

      {/* Lead row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 396px', gap: 34, paddingTop: 30 }}>

        {/* Feature */}
        <article>
          <Img image={lead.mainImage} title={lead.title} isLead />
          <Kicker>{lead.category} · The Lead</Kicker>
          <h2 style={{
            fontFamily: '"NeighborFont", serif', fontWeight: 400, fontSize: 58,
            lineHeight: 1.0, letterSpacing: '-0.03em', margin: '10px 0 12px', color: PAL.ink,
          }}>{lead.title}</h2>
          <p style={{
            fontFamily: '"EB Garamond", serif', fontStyle: 'italic', fontSize: 22,
            lineHeight: 1.25, color: PAL.ink, margin: '0 0 14px',
          }}>{lead.excerpt}</p>
          <p style={{ fontFamily: '"EB Garamond", serif', fontSize: 17, color: PAL.faint, margin: '0 0 16px' }}>
            by <span style={{ fontStyle: 'italic' }}>{lead.author}</span>
          </p>
          {leadParagraphs.length > 0 && (
            <div className="broadsheet-lead-body">
              {leadParagraphs.map((text, i) => <p key={i}>{text}</p>)}
            </div>
          )}
        </article>

        {/* Vertical rule */}
        <div style={{ background: PAL.rule }} />

        {/* Rail */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rail.map((a, i) => (
            <div key={a._id}>
              {i > 0 && <div style={{ margin: '20px 0' }}><Rule weight={1} /></div>}
              <SecondaryItem a={a} showImg={i < 2} />
            </div>
          ))}
        </div>
      </div>

      {/* Register band */}
      <div style={{ margin: '38px 0 22px' }}>
        <Rule weight={2} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, padding: '13px 0' }}>
          <Dinkus />
          <span style={{
            fontFamily: '"Geist Mono", monospace', fontSize: 13,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: PAL.ink,
          }}>In This Issue</span>
          <Dinkus />
        </div>
        <Rule weight={2} />
      </div>

      {/* Register grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {register.map((a, i) => (
          <div key={a._id} style={{
            padding: i % 4 === 0 ? '0 24px 0 0' : '0 24px',
            borderLeft: i % 4 === 0 ? 'none' : `1px solid ${PAL.rule}`,
            marginBottom: 26,
          }}>
            <RegisterItem a={a} />
          </div>
        ))}
      </div>

      {/* Footer */}
      <Rule weight={1} />
      <div style={{
        display: 'flex', justifyContent: 'space-between', paddingTop: 12,
        fontFamily: '"Geist Mono", monospace', fontSize: 11,
        letterSpacing: '0.04em', textTransform: 'uppercase', color: PAL.faint,
      }}>
        <span>theneighbor.review</span>
        <span>Fiction · Poetry · Criticism</span>
        <span>{ISSUE.number}</span>
      </div>
    </div>
  )
}
