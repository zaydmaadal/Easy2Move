type LogoProps = {
  lockup?: boolean
  className?: string
}

// De "O" van MOVE met de ladder erin, zoals in het originele logo.
function LadderO() {
  return (
    <svg className="logo__o" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="41" fill="none" stroke="currentColor" strokeWidth="15" />
      <g stroke="var(--gold)" strokeWidth="7" strokeLinecap="round">
        <line x1="41" y1="27" x2="41" y2="73" />
        <line x1="59" y1="27" x2="59" y2="73" />
        <line x1="41" y1="38" x2="59" y2="38" />
        <line x1="41" y1="50" x2="59" y2="50" />
        <line x1="41" y1="62" x2="59" y2="62" />
      </g>
    </svg>
  )
}

export default function Logo({ lockup = false, className = '' }: LogoProps) {
  if (!lockup) {
    return (
      <span className={`logo ${className}`}>
        EASY<span className="logo__2">2</span>MOVE
      </span>
    )
  }

  return (
    <div className={`lockup ${className}`}>
      <span className="logo logo--lockup" aria-label="Easy2Move">
        EASY<span className="logo__2">2</span>M<LadderO />VE
      </span>
      <span className="lockup__rule" aria-hidden="true" />
      <span className="lockup__sub">Ladderlift service &amp; verhuizing</span>
    </div>
  )
}
