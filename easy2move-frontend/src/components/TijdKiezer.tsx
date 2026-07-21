import Dropdown from './Dropdown'
import { tijdslotVan, tijdslotenOverlappen } from '../lib/tijd'

// Elk half uur, de klok rond: 00:00, 00:30, 01:00, ... 23:30
const TIJD_OPTIES = Array.from({ length: 48 }, (_, i) => {
  const totaalMin = i * 30
  const waarde = `${String(Math.floor(totaalMin / 60)).padStart(2, '0')}:${String(totaalMin % 60).padStart(2, '0')}`
  return { waarde, label: waarde }
})

type TijdKiezerProps = {
  start: string
  duurUren: number
  bezet: string[]
  onStartChange: (start: string) => void
}

// Eén exact tijdstip kiezen (stap van 30 minuten) i.p.v. een vaste lijst
// sloten, via onze eigen Dropdown i.p.v. de native time-picker.
export default function TijdKiezer({ start, duurUren, bezet, onStartChange }: TijdKiezerProps) {
  const tijdslot = start ? tijdslotVan(start, duurUren) : null
  const conflict = tijdslot ? bezet.find((b) => tijdslotenOverlappen(b, tijdslot)) : undefined

  return (
    <div>
      <Dropdown
        className="tijd-dropdown"
        waarde={start}
        opties={TIJD_OPTIES}
        onChange={onStartChange}
        placeholder="Kies een uur"
      />
      {tijdslot && (
        <p className={`tijd-preview ${conflict ? 'tijd-preview--conflict' : ''}`}>
          {conflict
            ? `Dat tijdstip botst met een boeking tussen ${conflict}. Kies een ander uur.`
            : `Duurt van ${tijdslot.replace(' - ', ' tot ')}, geschat.`}
        </p>
      )}
    </div>
  )
}
