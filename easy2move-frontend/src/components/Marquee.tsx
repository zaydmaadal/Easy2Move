import { useEffect, useRef } from 'react'

const ITEMS = [
  'Ladderlift service',
  'Verhuizingen',
  '24/24 beschikbaar',
  'Sinds 2007',
  'Tot de 10de verdieping',
]

function Row() {
  return (
    <div className="marquee__row">
      {ITEMS.map((item) => (
        <span key={item} className="marquee__item">
          {item}
          <span className="marquee__star">✦</span>
        </span>
      ))}
    </div>
  )
}

// Vier identieke rijen zodat er op elk schermformaat altijd content
// zichtbaar is; we schuiven één rijbreedte op en wrappen naadloos.
// Scrollen geeft een impuls: omlaag = sneller, omhoog = achteruit.
const RIJEN = 4

export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let pos = 0
    let vel = 0
    let lastY = window.scrollY
    let raf = 0

    const tick = () => {
      const y = window.scrollY
      vel += (y - lastY) * 0.045
      lastY = y
      vel = Math.max(-9, Math.min(9, vel)) * 0.92

      pos -= 0.8 + vel
      const rij = track.children[0] as HTMLElement | undefined
      const breedte = rij?.offsetWidth ?? 0
      if (breedte > 0) {
        // wrap naar (-breedte, 0] — rijen zijn identiek, dus naadloos
        pos = -((((-pos % breedte) + breedte) % breedte))
      }
      track.style.transform = `translate3d(${pos}px, 0, 0)`
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="marquee-zone">
      <div className="marquee" aria-hidden="true">
        <div ref={trackRef} className="marquee__track">
          {Array.from({ length: RIJEN }, (_, i) => (
            <Row key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
