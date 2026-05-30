import { useState, useEffect, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom'

const API_URL = 'https://the-neighbor.onrender.com/community'
const IMG_W = 47
const BUBBLE_R = 45
const TITLE_W = 155  // half-width of title exclusion rectangle
const TITLE_H = 70   // half-height
const SPEED = 0.3
const MAX_SPEED = 0.8
const SPINNER_SIZE = 25
const SPINNER_STROKE = 1.5
const HEADER_HEIGHT = 100

// Mutates particles in place — no allocations per frame
function stepPhysics(ps, halfW, halfH) {
  const n = ps.length

  for (let i = 0; i < n; i++) {
    ps[i].x += ps[i].vx
    ps[i].y += ps[i].vy
  }

  // Wall bounce
  for (let i = 0; i < n; i++) {
    const p = ps[i]
    if (p.x - BUBBLE_R < -halfW) { p.x = -halfW + BUBBLE_R; p.vx = Math.abs(p.vx) }
    if (p.x + BUBBLE_R >  halfW) { p.x =  halfW - BUBBLE_R; p.vx = -Math.abs(p.vx) }
    if (p.y - BUBBLE_R < -halfH) { p.y = -halfH + BUBBLE_R; p.vy = Math.abs(p.vy) }
    if (p.y + BUBBLE_R >  halfH) { p.y =  halfH - BUBBLE_R; p.vy = -Math.abs(p.vy) }
  }

  // Title zone bounce (static rectangle at origin)
  for (let i = 0; i < n; i++) {
    const p = ps[i]
    if (Math.abs(p.x) < TITLE_W && Math.abs(p.y) < TITLE_H) {
      // Inside rect — push to nearest edge
      const dists = [p.x + TITLE_W, TITLE_W - p.x, p.y + TITLE_H, TITLE_H - p.y]
      const mi = dists.indexOf(Math.min(...dists))
      if (mi === 0) { p.x = -(TITLE_W + BUBBLE_R); p.vx = -Math.abs(p.vx) }
      else if (mi === 1) { p.x = TITLE_W + BUBBLE_R; p.vx = Math.abs(p.vx) }
      else if (mi === 2) { p.y = -(TITLE_H + BUBBLE_R); p.vy = -Math.abs(p.vy) }
      else { p.y = TITLE_H + BUBBLE_R; p.vy = Math.abs(p.vy) }
    } else {
      // Outside — closest point on rect edge
      const cx = Math.max(-TITLE_W, Math.min(TITLE_W, p.x))
      const cy = Math.max(-TITLE_H, Math.min(TITLE_H, p.y))
      const dx = p.x - cx, dy = p.y - cy
      const dist = Math.hypot(dx, dy)
      if (dist < BUBBLE_R && dist > 0.001) {
        const nx = dx / dist, ny = dy / dist
        p.x = cx + nx * BUBBLE_R; p.y = cy + ny * BUBBLE_R
        const dot = p.vx * nx + p.vy * ny
        if (dot < 0) { p.vx -= 2 * dot * nx; p.vy -= 2 * dot * ny }
      }
    }
  }

  // Particle–particle elastic collisions
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = ps[i], b = ps[j]
      const dx = b.x - a.x, dy = b.y - a.y
      const d2 = dx * dx + dy * dy
      const min = BUBBLE_R * 2
      if (d2 < min * min && d2 > 0.001) {
        const d = Math.sqrt(d2)
        const nx = dx / d, ny = dy / d
        const overlap = (min - d) / 2
        a.x -= nx * overlap; a.y -= ny * overlap
        b.x += nx * overlap; b.y += ny * overlap
        const dvx = a.vx - b.vx, dvy = a.vy - b.vy
        const dot = dvx * nx + dvy * ny
        if (dot > 0) {
          a.vx -= dot * nx * 0.7; a.vy -= dot * ny * 0.3
          b.vx += dot * nx * 0.7; b.vy += dot * ny * 0.3
        }
      }
    }
  }

  // Clamp speed
  for (let i = 0; i < n; i++) {
    const s = Math.hypot(ps[i].vx, ps[i].vy)
    if (s > MAX_SPEED) { ps[i].vx *= MAX_SPEED / s; ps[i].vy *= MAX_SPEED / s }
    if (s < SPEED * 0.4 && s > 0) { ps[i].vx *= SPEED * 0.4 / s; ps[i].vy *= SPEED * 0.4 / s }
  }
}

function initParticles(members, w, h) {
  const halfW = w / 2, halfH = h / 2
  const cols = Math.ceil(Math.sqrt(members.length * w / h)) + 2
  const rows = Math.ceil(members.length / cols) + 2
  const cellW = w / cols, cellH = h / rows
  const ps = []
  let k = 0

  for (let r = 0; r < rows && k < members.length; r++) {
    for (let c = 0; c < cols && k < members.length; c++) {
      const x = (c + 0.5) * cellW - halfW
      const y = (r + 0.5) * cellH - halfH
      if (Math.abs(x) < TITLE_W + BUBBLE_R * 1.5 && Math.abs(y) < TITLE_H + BUBBLE_R * 1.5) continue
      const angle = k * 2.39996
      ps.push({ id: k, member: members[k], x, y, vx: Math.cos(angle) * SPEED, vy: Math.sin(angle) * SPEED })
      k++
    }
  }
  while (k < members.length) {
    const angle = k * 0.618 * Math.PI * 2
    ps.push({ id: k, member: members[k], x: (halfW - BUBBLE_R * 2) * Math.cos(angle), y: (halfH - BUBBLE_R * 2) * Math.sin(angle), vx: -Math.cos(angle) * SPEED, vy: -Math.sin(angle) * SPEED })
    k++
  }
  return ps
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try { return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) }
  catch { return '' }
}

function Overlay({ rect, person }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const id = requestAnimationFrame(() => setVisible(true)); return () => cancelAnimationFrame(id) }, [])
  const since = formatDate(person.created_at)
  const parts = [person.nationality || person.location, person.activity, since ? `Since ${since}` : null].filter(Boolean)
  return ReactDOM.createPortal(
    <div style={{ position: 'fixed', top: rect.bottom + 6, left: rect.left + rect.width / 2, transform: 'translateX(-50%)', borderRadius: 10, background: '#FFC7C7', border: '1px solid #000', padding: '5px 8px', width: 140, zIndex: 99999, pointerEvents: 'none', opacity: visible ? 1 : 0, transition: 'opacity 0.15s ease' }}>
      <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, letterSpacing: '0.02em', color: '#000', textAlign: 'center', lineHeight: 1.3, display: 'block', wordBreak: 'break-word' }}>
        {parts.join(' · ') || '—'}
      </span>
    </div>,
    document.body
  )
}

function MemberPin({ member, initX, initY, onMount }) {
  const [hovered, setHovered] = useState(false)
  const [rect, setRect] = useState(null)
  const imgRef = useRef(null)
  const rafRef = useRef(null)
  const mountRef = useCallback(el => { if (el) onMount(el) }, [onMount])

  useEffect(() => {
    if (!hovered) { if (rafRef.current) cancelAnimationFrame(rafRef.current); return }
    const loop = () => { if (imgRef.current) setRect(imgRef.current.getBoundingClientRect()); rafRef.current = requestAnimationFrame(loop) }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [hovered])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute', left: 0, top: 0,
        width: BUBBLE_R * 2, height: BUBBLE_R * 2,
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: `translate(${initX}px, ${initY}px)`,
        willChange: 'transform',
        pointerEvents: 'auto',
        cursor: 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img ref={imgRef} src={member.image_url} alt="" loading="lazy" draggable={false}
        style={{ width: IMG_W, height: 'auto', display: 'block', transform: hovered ? 'scale(1.08)' : 'scale(1)', transition: 'transform 0.25s ease' }}
      />
      {hovered && rect && <Overlay rect={rect} person={member} />}
    </div>
  )
}

const PORCH_PROMPT = 'What sentence stayed with you this week?'
const PORCH_RESPONSES = [
  { name: 'Clara M.', text: 'The world is so full of a number of things, I\'m sure we should all be as happy as kings.' },
  { name: 'Théo R.', text: 'What is done in love is done well.' },
  { name: 'Yuki S.', text: 'To live is the rarest thing in the world. Most people exist, that is all.' },
]

function PorchNotes({ avatars }) {
  return (
    <section style={{ background: '#FFFFF2', borderTop: '1px solid #1a1a1a', padding: '60px 80px 80px' }}>
      <p style={{ fontFamily: 'Geist Mono, monospace', fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#FF1919', marginBottom: 16 }}>
        Overheard in the Neighborhood
      </p>
      <h2 style={{ fontFamily: "'NeighborFont', serif", fontWeight: 400, fontSize: 38, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 52 }}>
        "{PORCH_PROMPT}"
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0 60px' }}>
        {PORCH_RESPONSES.map((r, i) => (
          <div key={i} style={{ borderTop: '1px solid #1a1a1a', paddingTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                {avatars[i]
                  ? <img src={avatars[i].image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: '100%', background: '#FFC7C7' }} />
                }
              </div>
              <span style={{ fontFamily: 'Geist Mono, monospace', fontWeight: 500, fontSize: 13, letterSpacing: '-0.04em' }}>{r.name}</span>
            </div>
            <p style={{ fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontWeight: 400, fontSize: 20, lineHeight: 1.35 }}>
              "{r.text}"
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Spinner() {
  const r = SPINNER_SIZE / 2 - SPINNER_STROKE
  const circ = 2 * Math.PI * r
  return (
    <div style={{ position: 'fixed', top: HEADER_HEIGHT, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={SPINNER_SIZE} height={SPINNER_SIZE} viewBox={`0 0 ${SPINNER_SIZE} ${SPINNER_SIZE}`} fill="none" style={{ animation: 'wall-spin 1.1s linear infinite' }}>
        <defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#1a1a1a" stopOpacity="1" /><stop offset="100%" stopColor="#1a1a1a" stopOpacity="0" /></linearGradient></defs>
        <circle cx={SPINNER_SIZE / 2} cy={SPINNER_SIZE / 2} r={r} stroke="url(#sg)" strokeWidth={SPINNER_STROKE} strokeLinecap="round" fill="none" strokeDasharray={`${circ * 0.78} ${circ * 0.22}`} />
      </svg>
    </div>
  )
}

export default function NeighborhoodPage() {
  const [status, setStatus] = useState('loading')
  const [totalCount, setTotalCount] = useState(0)
  const particlesRef = useRef([])
  const pinElsRef = useRef({})
  const rafRef = useRef(null)
  const dimRef = useRef({ halfW: 0, halfH: 0, cx: 0, cy: 0 })

  useEffect(() => {
    fetch(API_URL)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => {
        const all = data || []
        const filtered = all.filter(p => p.image_url)
        if (!filtered.length) { setStatus('error'); return }
        setTotalCount(all.length)
        const w = window.innerWidth, h = window.innerHeight - HEADER_HEIGHT
        dimRef.current = { halfW: w / 2, halfH: h / 2, cx: w / 2, cy: h / 2 }
        const ps = initParticles(filtered, w, h)
        const hw = w / 2, hh = h / 2
        for (let i = 0; i < 600; i++) stepPhysics(ps, hw, hh)
        particlesRef.current = ps
        setStatus('done')
      })
      .catch(() => setStatus('error'))
  }, [])

  useEffect(() => {
    if (status !== 'done') return
    const { halfW, halfH, cx, cy } = dimRef.current
    const animate = () => {
      stepPhysics(particlesRef.current, halfW, halfH)
      for (const p of particlesRef.current) {
        const el = pinElsRef.current[p.id]
        if (el) el.style.transform = `translate(${cx + p.x - BUBBLE_R}px, ${cy + p.y - BUBBLE_R}px)`
      }
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [status])

  const handleMount = useCallback((id, el) => { pinElsRef.current[id] = el }, [])

  if (status !== 'done') return <Spinner />

  const { cx, cy } = dimRef.current
  const avatars = particlesRef.current.slice(0, 3).map(p => p.member)

  return (
    <>
    <div style={{ marginTop: HEADER_HEIGHT, height: `calc(100vh - ${HEADER_HEIGHT}px)`, position: 'relative', overflow: 'hidden', userSelect: 'none' }}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none', zIndex: 10, whiteSpace: 'nowrap' }}>
        <div style={{ fontFamily: "'NeighborFont', serif", fontWeight: 400, fontSize: 40, letterSpacing: '-0.02em', lineHeight: 1.1, color: '#1a1a1a' }}>
          Welcome to the<br />Neighborhood
        </div>
        <div style={{ marginTop: 8, fontFamily: "'EB Garamond', serif", fontWeight: 400, fontSize: 20, letterSpacing: 0, lineHeight: 1.1, color: '#1a1a1a' }}>
          We are currently {totalCount} neighbors!
        </div>
      </div>
      {particlesRef.current.map(p => (
        <MemberPin
          key={p.id}
          member={p.member}
          initX={cx + p.x - BUBBLE_R}
          initY={cy + p.y - BUBBLE_R}
          onMount={el => handleMount(p.id, el)}
        />
      ))}
    </div>
    <PorchNotes avatars={avatars} />
    </>
  )
}
