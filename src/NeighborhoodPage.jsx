import { useState, useEffect, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom'

const API_URL = 'https://the-neighbor.onrender.com/community'
const IMG_W = 50
const IMG_H = 70        // conservative height estimate for collision
const SPINNER_SIZE = 25
const SPINNER_STROKE = 1.5
const HEADER_HEIGHT = 100
const FRICTION = 0.92
const HOVER_SCALE = 1.08

function generatePlacements(members) {
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))  // ~137.508°
  const MIN_RADIUS = 280
  const SPREAD = 75

  return members.map((member, k) => {
    const angle = k * GOLDEN_ANGLE
    const r = MIN_RADIUS + SPREAD * Math.sqrt(k)
    return { member, x: r * Math.cos(angle), y: r * Math.sin(angle) }
  })
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
  } catch { return '' }
}

function Overlay({ rect, person }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const since = formatDate(person.created_at)
  const parts = [
    person.nationality || person.location,
    person.activity,
    since ? `Since ${since}` : null,
  ].filter(Boolean)

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      top: rect.bottom + 6,
      left: rect.left + rect.width / 2,
      transform: 'translateX(-50%)',
      borderRadius: 10,
      background: '#FFC7C7',
      border: '1px solid #000',
      padding: '5px 8px',
      width: 140,
      zIndex: 99999,
      pointerEvents: 'none',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.15s ease',
    }}>
      <span style={{
        fontFamily: 'Geist Mono, monospace',
        fontSize: 11,
        letterSpacing: '0.02em',
        color: '#000',
        textAlign: 'center',
        lineHeight: 1.3,
        display: 'block',
        wordBreak: 'break-word',
      }}>
        {parts.join(' · ') || '—'}
      </span>
    </div>,
    document.body
  )
}

function MemberPin({ placement }) {
  const { member, x, y } = placement
  const [hovered, setHovered] = useState(false)
  const [rect, setRect] = useState(null)
  const imgRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!hovered) { if (rafRef.current) cancelAnimationFrame(rafRef.current); return }
    const loop = () => {
      if (imgRef.current) setRect(imgRef.current.getBoundingClientRect())
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [hovered])

  return (
    <div
      style={{
        position: 'absolute',
        left: x - IMG_W / 2,
        top: y - IMG_H / 2,
        pointerEvents: 'auto',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        ref={imgRef}
        src={member.image_url}
        alt=""
        loading="lazy"
        draggable={false}
        style={{
          width: IMG_W,
          height: 'auto',
          display: 'block',
          transform: hovered ? `scale(${HOVER_SCALE})` : 'scale(1)',
          transition: 'transform 0.25s ease',
        }}
      />
      {hovered && rect && <Overlay rect={rect} person={member} />}
    </div>
  )
}

function Spinner() {
  const r = SPINNER_SIZE / 2 - SPINNER_STROKE
  const circ = 2 * Math.PI * r
  return (
    <div style={{
      position: 'fixed', top: HEADER_HEIGHT, left: 0, right: 0, bottom: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={SPINNER_SIZE} height={SPINNER_SIZE}
        viewBox={`0 0 ${SPINNER_SIZE} ${SPINNER_SIZE}`} fill="none"
        style={{ animation: 'wall-spin 1.1s linear infinite' }}>
        <defs>
          <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1a1a1a" stopOpacity="1" />
            <stop offset="100%" stopColor="#1a1a1a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx={SPINNER_SIZE / 2} cy={SPINNER_SIZE / 2} r={r}
          stroke="url(#sg)" strokeWidth={SPINNER_STROKE}
          strokeLinecap="round" fill="none"
          strokeDasharray={`${circ * 0.78} ${circ * 0.22}`} />
      </svg>
    </div>
  )
}

export default function NeighborhoodPage() {
  const [status, setStatus] = useState('loading')
  const [placements, setPlacements] = useState([])
  const [isDragging, setIsDragging] = useState(false)

  const containerRef = useRef(null)
  const cameraRef = useRef({ x: 0, y: 0 })
  const [camera, setCamera] = useState({ x: 0, y: 0 })
  const dragRef = useRef(null)
  const velRef = useRef({ x: 0, y: 0 })
  const lastRef = useRef({ x: 0, y: 0, t: 0 })
  const rafRef = useRef(null)

  useEffect(() => {
    fetch(API_URL)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => {
        const filtered = (data || []).filter(p => p.image_url)
        if (!filtered.length) { setStatus('error'); return }
        setPlacements(generatePlacements(filtered))
        setStatus('done')
      })
      .catch(() => setStatus('error'))
  }, [])

  useEffect(() => {
    if (status !== 'done' || !containerRef.current) return
    const { offsetWidth: w, offsetHeight: h } = containerRef.current
    const c = { x: w / 2, y: h / 2 }
    cameraRef.current = c
    setCamera(c)
  }, [status])

  const stopMomentum = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
  }, [])

  const startMomentum = useCallback(() => {
    stopMomentum()
    const tick = () => {
      velRef.current.x *= FRICTION
      velRef.current.y *= FRICTION
      if (Math.abs(velRef.current.x) < 0.3 && Math.abs(velRef.current.y) < 0.3) {
        stopMomentum(); return
      }
      cameraRef.current = {
        x: cameraRef.current.x + velRef.current.x,
        y: cameraRef.current.y + velRef.current.y,
      }
      setCamera({ ...cameraRef.current })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [stopMomentum])

  const onPointerDown = useCallback((e) => {
    stopMomentum()
    dragRef.current = {
      startX: e.clientX, startY: e.clientY,
      startCamX: cameraRef.current.x, startCamY: cameraRef.current.y,
    }
    velRef.current = { x: 0, y: 0 }
    lastRef.current = { x: e.clientX, y: e.clientY, t: performance.now() }
    setIsDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [stopMomentum])

  const onPointerMove = useCallback((e) => {
    if (!dragRef.current) return
    cameraRef.current = {
      x: dragRef.current.startCamX + e.clientX - dragRef.current.startX,
      y: dragRef.current.startCamY + e.clientY - dragRef.current.startY,
    }
    setCamera({ ...cameraRef.current })
    const now = performance.now()
    const dt = now - lastRef.current.t
    if (dt > 0) {
      velRef.current = {
        x: (e.clientX - lastRef.current.x) / dt * 16,
        y: (e.clientY - lastRef.current.y) / dt * 16,
      }
    }
    lastRef.current = { x: e.clientX, y: e.clientY, t: now }
  }, [])

  const onPointerUp = useCallback(() => {
    if (!dragRef.current) return
    dragRef.current = null
    setIsDragging(false)
    startMomentum()
  }, [startMomentum])

  if (status === 'loading') return <Spinner />
  if (status !== 'done') return null

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{
        position: 'fixed',
        top: HEADER_HEIGHT,
        left: 0, right: 0, bottom: 0,
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
    >
      <div style={{
        position: 'absolute',
        left: camera.x,
        top: camera.y,
        pointerEvents: 'none',
      }}>
        {/* Title centered at world origin */}
        <div style={{
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          fontFamily: "'NeighborFont', serif",
          fontWeight: 400,
          fontSize: 40,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          color: '#1a1a1a',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>
          Welcome to the<br />Neighborhood
        </div>

        {placements.map((p, i) => (
          <MemberPin key={p.member.id || i} placement={p} />
        ))}
      </div>
    </div>
  )
}
