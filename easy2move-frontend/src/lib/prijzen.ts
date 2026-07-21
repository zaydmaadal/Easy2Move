// Tarieven inclusief btw, van easy2move.be
export function richtprijsPerUur(verdieping: number): number {
  if (verdieping <= 5) return 80
  if (verdieping <= 7) return 90
  if (verdieping === 8) return 100
  if (verdieping === 9) return 130
  return 150
}

// yyyy-mm-dd lokaal interpreteren, anders schuift new Date(iso) een dag op
export function isZondag(isoDatum: string): boolean {
  if (!isoDatum) return false
  const [j, m, d] = isoDatum.split('-').map(Number)
  return new Date(j, m - 1, d).getDay() === 0
}

export function berekenTotaal(verdieping: number, duurUren: number, isoDatum: string): number {
  const basis = richtprijsPerUur(verdieping) * duurUren
  const toeslag = isZondag(isoDatum) ? basis * 0.2 : 0
  return Math.round(basis + toeslag)
}
