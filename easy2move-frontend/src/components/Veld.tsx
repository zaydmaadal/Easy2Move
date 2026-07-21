import { useId, useState, type InputHTMLAttributes } from 'react'
import type { Validator } from '../lib/validatie'

type VeldProps = {
  label: string
  waarde: string
  onChange: (waarde: string) => void
  validator?: Validator
  forceer?: boolean
  className?: string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'className'>

function CheckIcon() {
  return (
    <svg className="field__icoon field__icoon--ok" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3 8.5l3 3 7-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Tekstveld met live validatie: de fout- of geldig-status verschijnt pas
// nadat de gebruiker uit het veld klikt (blur), niet bij elke toetsaanslag.
// Geen foutbanner, enkel een gekleurde rand plus een korte bijschrift.
export default function Veld({
  label,
  waarde,
  onChange,
  validator,
  forceer = false,
  className = '',
  ...rest
}: VeldProps) {
  const [aangeraakt, setAangeraakt] = useState(false)
  const foutId = useId()

  const toonStatus = aangeraakt || forceer
  const fout = toonStatus && validator ? validator(waarde) : null
  const geldig = toonStatus && validator && !fout && waarde.trim() !== ''

  return (
    <label className={`field ${className} ${fout ? 'field--fout' : ''} ${geldig ? 'field--geldig' : ''}`}>
      <span>{label}</span>
      <div className="field__invoer">
        <input
          {...rest}
          value={waarde}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setAangeraakt(true)}
          aria-invalid={Boolean(fout)}
          aria-describedby={fout ? foutId : undefined}
        />
        {geldig && <CheckIcon />}
      </div>
      {fout && (
        <span className="field__fout" id={foutId}>
          {fout}
        </span>
      )}
    </label>
  )
}
