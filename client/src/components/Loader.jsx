import { useEffect, useRef, useState } from 'react'

// Helper đọc/ghi sessionStorage an toàn (tránh crash trên Safari private, iframe, v.v.)
const storage = {
  get: (key) => {
    try { return sessionStorage.getItem(key) } catch { return null }
  },
  set: (key, value) => {
    try { sessionStorage.setItem(key, value) } catch { /* bỏ qua */ }
  },
}

export default function Loader() {
  const canvasRef = useRef(null)
  const [slideY, setSlideY] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  const [isFirstTime] = useState(() => {
    if (typeof window === 'undefined') return false
    return !storage.get('hasSeenArumeLoader')
  })

  const slideRef = useRef(0)
  const dismissedRef = useRef(false)

  const handleDismiss = () => {
    if (dismissedRef.current) return
    dismissedRef.current = true
    setDismissed(true)
    setSlideY(100)
    storage.set('hasSeenArumeLoader', 'true')
  }

  // Tự động tắt loader sau 4.5 giây
  useEffect(() => {
    if (!isFirstTime) return
    const timer = setTimeout(() => handleDismiss(), 4500)
    return () => clearTimeout(timer)
  }, [isFirstTime])

  // Lắng nghe Cuộn / Vuốt
  useEffect(() => {
    if (!isFirstTime) return

    let startY = null

    const onWheel = (e) => {
      if (dismissedRef.current) return
      if (e.deltaY < 0) {
        slideRef.current = Math.min(100, slideRef.current + Math.abs(e.deltaY) * 0.15)
        setSlideY(slideRef.current)
        if (slideRef.current >= 100) handleDismiss()
      }
    }

    const onTouchStart = (e) => { startY = e.touches[0].clientY }

    const onTouchMove = (e) => {
      if (dismissedRef.current || startY === null) return
      const dy = e.touches[0].clientY - startY
      if (dy > 0) {
        slideRef.current = Math.min(100, slideRef.current + dy * 0.5)
        setSlideY(slideRef.current)
        if (slideRef.current >= 100) handleDismiss()
      }
      startY = e.touches[0].clientY
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [isFirstTime])

  // Canvas crystal animation
  useEffect(() => {
    if (!isFirstTime) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const el = canvas.parentElement
    canvas.width = el.offsetWidth
    canvas.height = el.offsetHeight

    const W = canvas.width
    const H = canvas.height
    const CX = W / 2
    const CY = H / 2

    const C = {
      ice:    'rgba(220,235,248,',
      gold:   'rgba(196,154,40,',
      frost:  'rgba(200,220,240,',
      silver: 'rgba(180,190,200,',
    }

    const lerp = (a, b, t) => a + (b - a) * t
    const easeOut = t => 1 - Math.pow(1 - t, 3)
    const easeInOut = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t

    class Shard {
      constructor(id) {
        this.id = id
        const cols = 14, rows = 10
        const col = id % cols
        const row = Math.floor(id / cols) % rows
        this.tx = (col / (cols - 1)) * W
        this.ty = (row / (rows - 1)) * H
        const sides = 3 + Math.floor(Math.random() * 4)
        this.pts = []
        const baseR = 6 + Math.random() * 14
        for (let i = 0; i < sides; i++) {
          const a = (i / sides) * Math.PI * 2 + Math.random() * 0.7
          const r = baseR * (0.55 + Math.random() * 0.9)
          this.pts.push([Math.cos(a) * r, Math.sin(a) * r])
        }
        const dx = this.tx - CX, dy = this.ty - CY
        const dist = Math.hypot(dx, dy) || 1
        const speed = 4 + Math.random() * 5
        this.vx = (dx / dist) * speed + (Math.random() - 0.5) * 3
        this.vy = (dy / dist) * speed + (Math.random() - 0.5) * 3
        this.vRot = (Math.random() - 0.5) * 0.22
        this.x = CX; this.y = CY
        this.angle = Math.random() * Math.PI * 2
        this.delay = Math.floor(Math.random() * 25)
        const roll = Math.random()
        this.color = roll < 0.45 ? C.ice : roll < 0.72 ? C.frost : roll < 0.88 ? C.silver : C.gold
        this.alpha = 0; this.size = 1
        this.facetBright = 0.4 + Math.random() * 0.6
        this.facetIdx = Math.floor(Math.random() * Math.max(1, this.pts.length - 1))
      }
      _draw(x, y, angle, alpha, size) {
        if (alpha <= 0.005) return
        ctx.save()
        ctx.translate(x, y); ctx.rotate(angle); ctx.scale(size, size)
        ctx.globalAlpha = alpha
        ctx.beginPath()
        this.pts.forEach(([px, py], i) => i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py))
        ctx.closePath()
        const bb = this.pts.reduce(
          (acc, [px, py]) => ({ minX: Math.min(acc.minX, px), maxX: Math.max(acc.maxX, px), minY: Math.min(acc.minY, py), maxY: Math.max(acc.maxY, py) }),
          { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
        )
        try {
          const grd = ctx.createLinearGradient(bb.minX, bb.minY, bb.maxX, bb.maxY)
          grd.addColorStop(0, this.color + (0.08 + this.facetBright * 0.18) + ')')
          grd.addColorStop(0.45, this.color + (0.18 + this.facetBright * 0.25) + ')')
          grd.addColorStop(1, this.color + '0.04)')
          ctx.fillStyle = grd
        } catch { ctx.fillStyle = this.color + '0.12)' }
        ctx.fill()
        ctx.strokeStyle = this.color + (0.55 + this.facetBright * 0.35) + ')'
        ctx.lineWidth = 0.8; ctx.stroke()
        if (this.pts.length > 2) {
          const p0 = this.pts[this.facetIdx], p1 = this.pts[(this.facetIdx + 1) % this.pts.length]
          ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1])
          ctx.strokeStyle = this.color + (this.facetBright * 0.9) + ')'
          ctx.lineWidth = 1.2; ctx.stroke()
        }
        ctx.restore()
      }
      update(tick) {
        if (tick < this.delay) return
        const t = tick - this.delay
        if (t < 80) {
          const p = easeOut(t / 80)
          this.x = CX + this.vx * t * 0.6; this.y = CY + this.vy * t * 0.6
          this.angle += this.vRot; this.alpha = p * 0.82; this.size = 0.3 + p * 0.7
        } else if (t < 220) {
          this.x += Math.sin(tick * 0.018 + this.id) * 0.18
          this.y += Math.cos(tick * 0.014 + this.id * 0.7) * 0.15
          this.angle += this.vRot * 0.12; this.alpha = 0.82; this.size = 1
        } else if (t < 360) {
          const p = easeInOut((t - 220) / 140)
          this.x = lerp(this.x, this.tx, p * 0.08); this.y = lerp(this.y, this.ty, p * 0.08)
          this.angle = lerp(this.angle, 0, p * 0.06)
          this.alpha = lerp(0.82, 0.35, p); this.size = lerp(1, 0.7, p)
        } else {
          this.x = lerp(this.x, this.tx, 0.04); this.y = lerp(this.y, this.ty, 0.04)
          this.angle *= 0.97
          this.alpha = 0.22 + Math.sin(tick * 0.04 + this.id) * 0.06; this.size = 0.7
        }
      }
      draw() { this._draw(this.x, this.y, this.angle, this.alpha, this.size) }
    }

    class Splinter {
      constructor() { this.reset() }
      reset() {
        const a = Math.random() * Math.PI * 2, speed = 1.5 + Math.random() * 4
        this.x = CX + (Math.random() - 0.5) * 40; this.y = CY + (Math.random() - 0.5) * 40
        this.vx = Math.cos(a) * speed; this.vy = Math.sin(a) * speed
        this.len = 4 + Math.random() * 12; this.angle = a
        this.alpha = 0.7 + Math.random() * 0.3
        const roll = Math.random()
        this.color = roll < 0.5 ? C.ice : roll < 0.8 ? C.frost : C.gold
      }
      update(tick) {
        if (tick < 5 || tick > 60) return
        this.x += this.vx; this.y += this.vy
        this.vx *= 0.94; this.vy *= 0.94; this.alpha *= 0.93
      }
      draw(tick) {
        if (tick < 5 || tick > 60 || this.alpha < 0.02) return
        ctx.save(); ctx.globalAlpha = this.alpha
        ctx.strokeStyle = this.color + '1)'; ctx.lineWidth = 0.8
        ctx.beginPath(); ctx.moveTo(this.x, this.y)
        ctx.lineTo(this.x - Math.cos(this.angle) * this.len, this.y - Math.sin(this.angle) * this.len)
        ctx.stroke(); ctx.restore()
      }
    }

    class Mote {
      constructor() {
        this.x = Math.random() * W; this.y = Math.random() * H
        this.r = 0.5 + Math.random() * 1.5; this.alpha = 0; this.alphaDir = 1
        this.maxA = 0.08 + Math.random() * 0.18; this.speed = 0.003 + Math.random() * 0.006
        this.color = Math.random() < 0.6 ? C.ice : C.gold
        this.delay = Math.floor(Math.random() * 200)
      }
      update(tick) {
        if (tick < this.delay) return
        this.alpha += this.speed * this.alphaDir
        if (this.alpha >= this.maxA) this.alphaDir = -1
        if (this.alpha <= 0) { this.alphaDir = 1; this.x = Math.random() * W; this.y = Math.random() * H }
      }
      draw() {
        if (this.alpha < 0.01) return
        ctx.save(); ctx.globalAlpha = this.alpha
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        ctx.fillStyle = this.color + '1)'; ctx.fill(); ctx.restore()
      }
    }

    const shards = Array.from({ length: 140 }, (_, i) => new Shard(i))
    const splinters = Array.from({ length: 80 }, () => new Splinter())
    const motes = Array.from({ length: 60 }, () => new Mote())
    let shockwaves = [
      { r: 0, alpha: 0.9, speed: 6, color: C.ice },
      { r: 0, alpha: 0.6, speed: 3.5, color: C.gold, delay: 8 },
    ]
    let tick = 0, animId

    const frame = () => {
      ctx.clearRect(0, 0, W, H)
      const bg = ctx.createRadialGradient(CX, CY, 0, CX, CY, Math.max(W, H) * 0.7)
      bg.addColorStop(0, 'rgba(225,232,240,0.18)')
      bg.addColorStop(1, 'rgba(242,237,227,0)')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)
      shockwaves = shockwaves.filter(s => s.alpha > 0.01)
      shockwaves.forEach(s => {
        if (s.delay && s.delay > 0) { s.delay--; return }
        s.r += s.speed; s.alpha *= 0.965; s.speed *= 0.98
        ctx.beginPath(); ctx.arc(CX, CY, s.r, 0, Math.PI * 2)
        ctx.strokeStyle = s.color + s.alpha + ')'; ctx.lineWidth = 1.2; ctx.stroke()
      })
      motes.forEach(m => { m.update(tick); m.draw() })
      splinters.forEach(s => { s.update(tick); s.draw(tick) })
      shards.forEach(s => { s.update(tick); s.draw() })
      tick++
      animId = requestAnimationFrame(frame)
    }
    animId = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(animId)
  }, [isFirstTime])

  if (!isFirstTime) return null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Cormorant+Garamond:ital,wght@0,300;1,300&display=swap');

        .loader {
          position: fixed;
          inset: 0;
          background: #F2EDE3;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          will-change: transform;
          cursor: pointer;
        }
        .loader.dismissed {
          pointer-events: none;
          transform: translateY(-100vh) !important;
        }
        .loader-canvas {
          position: absolute; inset: 0; width: 100%; height: 100%;
        }
        .loader-content {
          position: relative; z-index: 10; text-align: center;
        }
        .loader-title {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: clamp(72px, 11vw, 110px);
          font-weight: 700;
          letter-spacing: 0.08em;
          line-height: 1;
          opacity: 0;
          transform: scale(0.08);
          animation: titleReveal 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
        }
        .title-aru {
          color: #C49A28;
          text-shadow:
            0 -1px 0 rgba(255,240,180,0.9),
            0  1px 0 rgba(140,90,10,0.4),
            0  3px 8px rgba(196,154,40,0.25),
            0  0 40px rgba(196,154,40,0.15);
        }
        .title-me {
          color: #A8C4D8;
          text-shadow:
            0 -1px 0 rgba(240,250,255,0.95),
            0  1px 0 rgba(80,120,160,0.3),
            0  3px 8px rgba(160,210,240,0.2),
            0  0 40px rgba(200,230,248,0.2);
        }
        .loader-line {
          width: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(200,225,245,0.6) 20%, #C49A28 50%, rgba(200,225,245,0.6) 80%, transparent);
          margin: 20px auto;
          animation: lineExpand 1.1s cubic-bezier(0.16,1,0.3,1) 1.2s forwards;
        }
        .loader-tagline {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic; font-weight: 300; font-size: 13px;
          letter-spacing: 0.42em; color: rgba(139,104,28,0.8);
          text-transform: uppercase; opacity: 0;
          animation: taglineIn 1s ease 1.6s forwards;
        }
        .loader-scroll-hint {
          position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
          z-index: 10; text-align: center; opacity: 0;
          animation: taglineIn 0.8s ease 2.4s forwards;
        }
        .loader-scroll-hint p {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic; font-size: 11px; letter-spacing: 0.35em;
          color: rgba(100,75,20,0.4); text-transform: uppercase; margin-bottom: 8px;
        }
        .loader-arrow {
          width: 1px; height: 32px;
          background: linear-gradient(to top, rgba(196,154,40,0.65), transparent);
          margin: 0 auto;
          animation: arrowPulse 1.5s ease-in-out 2.6s infinite;
        }
        @keyframes titleReveal {
          0%   { opacity: 0; transform: scale(0.08); }
          30%  { opacity: 1; }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes taglineIn  { to { opacity: 1; } }
        @keyframes lineExpand { to { width: 200px; } }
        @keyframes arrowPulse {
          0%, 100% { opacity: 0.35; }
          50%      { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .loader-title   { animation: none; opacity: 1; transform: scale(1); }
          .loader-line    { animation: none; width: 200px; }
          .loader-tagline { animation: none; opacity: 1; }
          .loader-scroll-hint { animation: none; opacity: 1; }
          .loader-arrow   { animation: none; }
          .loader         { transition: none; }
        }
      `}</style>

      <div
        className={`loader${dismissed ? ' dismissed' : ''}`}
        style={{ transform: `translateY(-${slideY}vh)` }}
        onClick={handleDismiss}
      >
        <canvas ref={canvasRef} className="loader-canvas" />
        <div className="loader-content">
          <h1 className="loader-title">
            <span className="title-aru">ARU</span>
            <span className="title-me">me</span>
          </h1>
          <div className="loader-line" />
          <p className="loader-tagline">Fine Jewelry · Est. 2024</p>
        </div>
        <div className="loader-scroll-hint">
          <p>Cuộn hoặc nhấp để khám phá</p>
          <div className="loader-arrow" />
        </div>
      </div>
    </>
  )
}