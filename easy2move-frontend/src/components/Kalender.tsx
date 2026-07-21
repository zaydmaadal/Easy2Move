import { useState } from 'react'

type KalenderProps = {
  value: string
  onChange: (iso: string) => void
  geblokkeerdeDagen?: string[]
}

const MAANDEN_VOORUIT = 12
const WEEKDAGEN = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']

// Lokale datum als yyyy-mm-dd (toISOString zou naar UTC verschuiven)
function lokaleIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

// Custom maandkalender: elke datum tot een jaar vooruit kiesbaar,
// verleden uitgeschakeld, zondagen gemarkeerd (+20% toeslag).
export default function Kalender({ value, onChange, geblokkeerdeDagen = [] }: KalenderProps) {
  const vandaag = new Date()
  vandaag.setHours(0, 0, 0, 0)

  const [zicht, setZicht] = useState({
    jaar: vandaag.getFullYear(),
    maand: vandaag.getMonth(),
  })

  const eerste = new Date(zicht.jaar, zicht.maand, 1)
  const label = eerste.toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' })
  const startLeeg = (eerste.getDay() + 6) % 7 // maandag = kolom 0
  const aantalDagen = new Date(zicht.jaar, zicht.maand + 1, 0).getDate()

  const bijStart =
    zicht.jaar === vandaag.getFullYear() && zicht.maand === vandaag.getMonth()
  const max = new Date(vandaag.getFullYear(), vandaag.getMonth() + MAANDEN_VOORUIT, 1)
  const bijEinde = zicht.jaar === max.getFullYear() && zicht.maand === max.getMonth()

  function vorige() {
    setZicht((z) =>
      z.maand === 0 ? { jaar: z.jaar - 1, maand: 11 } : { jaar: z.jaar, maand: z.maand - 1 },
    )
  }

  function volgende() {
    setZicht((z) =>
      z.maand === 11 ? { jaar: z.jaar + 1, maand: 0 } : { jaar: z.jaar, maand: z.maand + 1 },
    )
  }

  return (
    <div className="kalender">
      <div className="kalender__kop">
        <button type="button" aria-label="Vorige maand" disabled={bijStart} onClick={vorige}>
          ‹
        </button>
        <span className="kalender__label">{label}</span>
        <button type="button" aria-label="Volgende maand" disabled={bijEinde} onClick={volgende}>
          ›
        </button>
      </div>

      <div className="kalender__weekdagen">
        {WEEKDAGEN.map((dag) => (
          <span key={dag}>{dag}</span>
        ))}
      </div>

      <div className="kalender__dagen">
        {Array.from({ length: startLeeg }, (_, i) => (
          <span key={`leeg-${i}`} />
        ))}
        {Array.from({ length: aantalDagen }, (_, i) => {
          const datum = new Date(zicht.jaar, zicht.maand, i + 1)
          const iso = lokaleIso(datum)
          const verleden = datum < vandaag
          const geblokkeerd = geblokkeerdeDagen.includes(iso)
          const actief = value === iso
          const zondag = datum.getDay() === 0
          return (
            <button
              key={iso}
              type="button"
              disabled={verleden || geblokkeerd}
              aria-pressed={actief}
              title={geblokkeerd ? 'Niet beschikbaar' : undefined}
              className={`kdag ${actief ? 'kdag--actief' : ''} ${zondag ? 'kdag--zondag' : ''} ${geblokkeerd ? 'kdag--geblokkeerd' : ''}`}
              onClick={() => onChange(iso)}
            >
              {i + 1}
            </button>
          )
        })}
      </div>

      <div className="kalender__legende">
        <span>
          <span className="kalender__stip" /> zondag: +20% toeslag
        </span>
        <span>
          <span className="kalender__stip kalender__stip--geblokkeerd" /> niet beschikbaar
        </span>
      </div>
    </div>
  )
}
