// Een validator geeft null terug als de waarde geldig is,
// of een korte foutmelding als dat niet zo is.
export type Validator = (waarde: string) => string | null

export const nietLeeg: Validator = (w) => (w.trim() ? null : 'Verplicht veld.')

export const geldigeEmail: Validator = (w) => {
  if (!w.trim()) return 'Verplicht veld.'
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(w.trim()) ? null : 'Ongeldig e-mailadres.'
}

export const geldigTelefoonnummer: Validator = (w) => {
  if (!w.trim()) return 'Verplicht veld.'
  const cijfers = w.replace(/\D/g, '')
  return cijfers.length >= 8 && cijfers.length <= 12 ? null : 'Ongeldig telefoonnummer.'
}

export const geldigePostcode: Validator = (w) => {
  if (!w.trim()) return 'Verplicht veld.'
  return /^[0-9]{4}$/.test(w.trim()) ? null : 'Postcode moet 4 cijfers zijn.'
}
