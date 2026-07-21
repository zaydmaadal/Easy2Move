function naarMinuten(hhmm: string): number {
  const [u, m] = hhmm.split(':').map(Number)
  return u * 60 + m
}

function naarHhMm(minuten: number): string {
  const u = Math.floor(minuten / 60) % 24
  const m = minuten % 60
  return `${String(u).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// "14:30" + 2 uur -> "14:30 - 16:30"
export function tijdslotVan(start: string, duurUren: number): string {
  const eindMin = naarMinuten(start) + duurUren * 60
  return `${start} - ${naarHhMm(eindMin)}`
}

// "14:30 - 16:30" -> begin/eind in minuten sinds middernacht. Sloten die
// over middernacht heen gaan (bv. "23:00 - 01:00") krijgen een eindtijd
// na 24:00 zodat overlap-vergelijkingen correct blijven.
export function parseTijdslot(tijdslot: string): { startMin: number; eindMin: number } {
  const [startStr, eindStr] = tijdslot.split('-').map((s) => s.trim())
  const startMin = naarMinuten(startStr)
  let eindMin = naarMinuten(eindStr)
  if (eindMin <= startMin) eindMin += 24 * 60
  return { startMin, eindMin }
}

export function tijdslotenOverlappen(a: string, b: string): boolean {
  const A = parseTijdslot(a)
  const B = parseTijdslot(b)
  return A.startMin < B.eindMin && B.startMin < A.eindMin
}
