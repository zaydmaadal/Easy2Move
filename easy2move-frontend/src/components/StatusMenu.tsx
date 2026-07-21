import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { STATUSSEN } from '../types/booking'

type StatusMenuProps = {
  status: string
  onChange: (status: string) => void
}

// Eigen dropdown i.p.v. een native <select>. Het menu wordt via een
// portal rechtstreeks in <body> gerenderd (fixed positie t.o.v. de knop),
// zodat het nooit wordt afgeknipt door een scrollende ouder zoals de
// tabel, en die ouder zelf geen ongewenste scrollbalk krijgt.
export default function StatusMenu({ status, onChange }: StatusMenuProps) {
  const [open, setOpen] = useState(false)
  const [positie, setPositie] = useState({ top: 0, left: 0 })
  const knopRef = useRef<HTMLButtonElement>(null)
  const lijstRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!open || !knopRef.current) return

    const bijwerken = () => {
      const rect = knopRef.current!.getBoundingClientRect()
      setPositie({ top: rect.bottom + 6, left: rect.left })
    }
    bijwerken()

    // Meebewegen i.p.v. sluiten bij scroll (zie Dropdown.tsx voor de
    // volledige uitleg): zo blijft het menu open terwijl je erin scrolt
    // of terwijl je de pagina eromheen scrolt.
    window.addEventListener('scroll', bijwerken, true)
    window.addEventListener('resize', bijwerken)
    return () => {
      window.removeEventListener('scroll', bijwerken, true)
      window.removeEventListener('resize', bijwerken)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function sluitBuitenKlik(e: MouseEvent) {
      const target = e.target as Node
      if (knopRef.current?.contains(target) || lijstRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', sluitBuitenKlik)
    return () => document.removeEventListener('mousedown', sluitBuitenKlik)
  }, [open])

  return (
    <>
      <button
        ref={knopRef}
        type="button"
        className={`status status--${status.toLowerCase()}`}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
      >
        {status}
        <svg className="status__pijl" viewBox="0 0 12 8" aria-hidden="true">
          <path
            d="M1 1l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open &&
        createPortal(
          <div
            ref={lijstRef}
            className="status-menu__lijst"
            style={{ top: positie.top, left: positie.left }}
            onClick={(e) => e.stopPropagation()}
          >
            {STATUSSEN.map((s) => (
              <button
                key={s}
                type="button"
                className={`status-menu__item ${s === status ? 'status-menu__item--actief' : ''}`}
                onClick={() => {
                  onChange(s)
                  setOpen(false)
                }}
              >
                <span className={`status-menu__stip status-menu__stip--${s.toLowerCase()}`} />
                {s}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  )
}
