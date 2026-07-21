import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type DropdownOptie = { waarde: string; label: string }

type DropdownProps = {
  waarde: string
  opties: DropdownOptie[]
  onChange: (waarde: string) => void
  placeholder?: string
  className?: string
}

// Volledig eigen dropdown i.p.v. een native <select>: zowel de gesloten
// knop als de geopende lijst met opties krijgen onze eigen styling (een
// native <select> laat de open lijst nooit herstylen). Werkt via een
// portal, zoals StatusMenu, zodat het nooit wordt afgeknipt.
export default function Dropdown({
  waarde,
  opties,
  onChange,
  placeholder = 'Kies…',
  className = '',
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [positie, setPositie] = useState({ top: 0, left: 0, width: 0 })
  const knopRef = useRef<HTMLButtonElement>(null)
  const lijstRef = useRef<HTMLDivElement>(null)
  const actieveRef = useRef<HTMLButtonElement>(null)

  const huidige = opties.find((o) => o.waarde === waarde)

  useLayoutEffect(() => {
    if (!open || !knopRef.current) return

    const bijwerken = () => {
      const rect = knopRef.current!.getBoundingClientRect()
      setPositie({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
    bijwerken()

    // Meebewegen i.p.v. sluiten bij scroll: dit vangt ook het scrollen
    // ín de lijst zelf op (scroll-events bubbelen niet, maar worden via
    // de capture-fase op window toch doorgegeven) - de knop is dan niet
    // verschoven, dus dit is dan gewoon een no-op herberekening.
    window.addEventListener('scroll', bijwerken, true)
    window.addEventListener('resize', bijwerken)
    return () => {
      window.removeEventListener('scroll', bijwerken, true)
      window.removeEventListener('resize', bijwerken)
    }
  }, [open])

  useEffect(() => {
    if (open) actieveRef.current?.scrollIntoView({ block: 'nearest' })
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
        className={`dropdown ${className}`}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
      >
        <span className={huidige ? undefined : 'dropdown__placeholder'}>
          {huidige?.label ?? placeholder}
        </span>
        <svg className="dropdown__pijl" viewBox="0 0 12 8" aria-hidden="true">
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
            className="dropdown__lijst"
            style={{ top: positie.top, left: positie.left, width: positie.width }}
          >
            {opties.map((optie) => (
              <button
                key={optie.waarde}
                ref={optie.waarde === waarde ? actieveRef : undefined}
                type="button"
                className={`dropdown__item ${optie.waarde === waarde ? 'dropdown__item--actief' : ''}`}
                onClick={() => {
                  onChange(optie.waarde)
                  setOpen(false)
                }}
              >
                {optie.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  )
}
