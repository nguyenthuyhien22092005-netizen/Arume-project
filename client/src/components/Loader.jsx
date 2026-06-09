import { useEffect, useRef } from 'react'

export default function Loader() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
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

    // tick chạy từ 0 → MAX_TICK, scroll điều khiển tốc độ & chiều
    const MAX_TICK = 500
    let tick = 0
    let tickDir = 1  // 1 = tiến, -1 = lùi
    let animId

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
      update(t) {
        if (t < this.delay) {
          this.x = CX; this.y = CY; this.alpha = 0; this.size = 0.3
          return
        }
        const tt = t - this.delay
        if (tt < 80) {
          const p = easeOut(tt / 80)
          this.x = CX + this.vx * tt * 0.6; this.y = CY + this.vy * tt * 0.6
          this.angle = this.vRot * tt; this.alpha = p * 0.82; this.size = 0.3 + p * 0.7
        } else if (tt < 220) {
          this.x = CX + this.vx * 80 * 0.6 + Math.sin(t * 0.018 + this.id) * 4
          this.y = CY + this.vy * 80 * 0.6 + Math.cos(t * 0.014 + this.id * 0.7) * 3
          this.angle = this.vRot * 80; this.alpha = 0.82; this.size = 1
        } else if (tt < 360) {
          const p = easeInOut((tt - 220) / 140)
          this.x = lerp(CX + this.vx * 80 * 0.6, this.tx, p)
          this.y = lerp(CY + this.vy * 80 * 0.6, this.ty, p)
          this.angle = lerp(this.vRot * 80, 0, p)
          this.alpha = lerp(0.82, 0.35, p); this.size = lerp(1, 0.7, p)
        } else {
          this.x = this.tx; this.y = this.ty; this.angle = 0
          this.alpha = 0.22 + Math.sin(t * 0.04 + this.id) * 0.06; this.size = 0.7
        }
      }
      draw() { this._draw(this.x, this.y, this.angle, this.alpha, this.size) }
    }

    class Mote {
      constructor() {
        this.x = Math.random() * W; this.y = Math.random() * H
        this.r = 0.5 + Math.random() * 1.5
        this.maxA = 0.08 + Math.random() * 0.18
        this.color = Math.random() < 0.6 ? C.ice : C.gold
        this.offset = Math.random() * 1000
        this.speed = 0.008 + Math.random() * 0.012
      }
      draw(t) {
        const alpha = this.maxA * (0.5 + 0.5 * Math.sin((t + this.offset) * this.speed))
        if (alpha < 0.01) return
        ctx.save(); ctx.globalAlpha = alpha
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        ctx.fillStyle = this.color + '1)'; ctx.fill(); ctx.restore()
      }
    }

    const shards = Array.from({ length: 140 }, (_, i) => new Shard(i))
    const motes = Array.from({ length: 60 }, () => new Mote())

    // Shockwave chỉ vẽ khi tick gần 0
    const drawShockwave = (t) => {
      if (t > 80) return
      const r1 = t * 6; const a1 = Math.max(0, 0.9 - t * 0.012)
      const r2 = Math.max(0, t - 8) * 3.5; const a2 = Math.max(0, 0.6 - (t - 8) * 0.018)
      if (a1 > 0.01) {
        ctx.beginPath(); ctx.arc(CX, CY, r1, 0, Math.PI * 2)
        ctx.strokeStyle = C.ice + a1 + ')'; ctx.lineWidth = 1.2; ctx.stroke()
      }
      if (t > 8 && a2 > 0.01) {
        ctx.beginPath(); ctx.arc(CX, CY, r2, 0, Math.PI * 2)
        ctx.strokeStyle = C.gold + a2 + ')'; ctx.lineWidth = 1.2; ctx.stroke()
      }
    }

    const frame = () => {
      ctx.clearRect(0, 0, W, H)
      const bg = ctx.createRadialGradient(CX, CY, 0, CX, CY, Math.max(W, H) * 0.7)
      bg.addColorStop(0, 'rgba(225,232,240,0.18)')
      bg.addColorStop(1, 'rgba(242,237,227,0)')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

      drawShockwave(tick)
      motes.forEach(m => m.draw(tick))
      shards.forEach(s => { s.update(tick); s.draw() })

      // auto advance khi không scroll (idle)
      tick = Math.max(0, Math.min(MAX_TICK, tick + tickDir))

      // khi đến cuối thì dừng
      if (tick >= MAX_TICK) tickDir = 0
      if (tick <= 0) tickDir = 0

      animId = requestAnimationFrame(frame)
    }

    // Bắt đầu chạy tự động
    tickDir = 1
    animId = requestAnimationFrame(frame)

    // Scroll điều khiển chiều & tốc độ
    let scrollTimeout
    const onWheel = (e) => {
      e.preventDefault()
      // deltaY > 0 = scroll xuống → chạy tới; deltaY < 0 = scroll lên → chạy lùi
      const delta = e.deltaY * 0.4
      tick = Math.max(0, Math.min(MAX_TICK, tick + delta))
      tickDir = delta > 0 ? 1 : -1

      // Sau 400ms không scroll thì dừng
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => { tickDir = 0 }, 400)
    }

    let touchStartY = null
    const onTouchStart = (e) => { touchStartY = e.touches[0].clientY }
    const onTouchMove = (e) => {
      e.preventDefault()
      if (touchStartY === null) return
      const dy = touchStartY - e.touches[0].clientY  // kéo lên = tiến
      tick = Math.max(0, Math.min(MAX_TICK, tick + dy * 0.8))
      tickDir = dy > 0 ? 1 : -1
      touchStartY = e.touches[0].clientY
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => { tickDir = 0 }, 400)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: false })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Cormorant+Garamond:ital,wght@0,300;1,300&display=swap');
        .loader {
          position: fixed; inset: 0; background: #F2EDE3;
          display: flex; align-items: center; justify-content: center;
          z-index: 999999; overflow: hidden;
        }
        .loader-canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
        .loader-content { position: relative; z-index: 10; text-align: center; }
        .loader-title {
          font-family: 'Playfair Display', serif; font-style: italic;
          font-size: clamp(72px, 11vw, 110px); font-weight: 700;
          letter-spacing: 0.08em; line-height: 1;
          opacity: 0; transform: scale(0.08);
          animation: titleReveal 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
        }
        .title-aru {
          color: #C49A28;
          text-shadow: 0 -1px 0 rgba(255,240,180,0.9), 0 1px 0 rgba(140,90,10,0.4),
            0 3px 8px rgba(196,154,40,0.25), 0 0 40px rgba(196,154,40,0.15);
        }
        .title-me {
          color: #A8C4D8;
          text-shadow: 0 -1px 0 rgba(240,250,255,0.95), 0 1px 0 rgba(80,120,160,0.3),
            0 3px 8px rgba(160,210,240,0.2), 0 0 40px rgba(200,230,248,0.2);
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
          background: linear-gradient(to bottom, rgba(196,154,40,0.65), transparent);
          margin: 0 auto; animation: arrowPulse 1.5s ease-in-out 2.6s infinite;
        }
        @keyframes titleReveal {
          0% { opacity: 0; transform: scale(0.08); }
          30% { opacity: 1; }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes taglineIn { to { opacity: 1; } }
        @keyframes lineExpand { to { width: 200px; } }
        @keyframes arrowPulse { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
      `}</style>

      <div className="loader">
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
          <p>Cuộn để khám phá</p>
          <div className="loader-arrow" />
        </div>
      </div>
    </>
  )
}