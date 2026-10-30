type LogoProps = {
  lockup?: boolean
  className?: string
}

export default function Logo({ lockup = false, className = '' }: LogoProps) {
  if (!lockup) {
    return (
      <span className={`logo ${className}`}>
        LIFT<span className="logo__accent">UP</span>
      </span>
    )
  }

  return (
    <div className={`lockup ${className}`}>
      <span className="logo logo--lockup" aria-label="LiftUp">
        LIFT<span className="logo__accent">UP</span>
      </span>
      <span className="lockup__rule" aria-hidden="true" />
      <span className="lockup__sub">Ladderlift verhuur</span>
    </div>
  )
}
