// TypeScript-spiegel van Easy2Move.Contracts/Models/BookingDto.cs.
// .NET serialiseert PascalCase properties standaard naar camelCase JSON:
// KlantNaam -> klantNaam, AangemaaktOp -> aangemaaktOp, enz.
export interface BookingDto {
  id: number
  klantNaam: string
  email: string
  telefoon: string
  straat: string
  huisnummer: string
  postcode: string
  gemeente: string
  verdieping: number
  datum: string
  tijdslot: string
  geschatteDuurUren: number
  opmerkingen: string
  status: string
  aangemaaktOp: string
}

// Wat de klant instuurt: id/status/aangemaaktOp bepaalt de backend zelf.
export type NewBooking = Omit<BookingDto, 'id' | 'status' | 'aangemaaktOp'>

export const STATUSSEN = ['Aangevraagd', 'Bevestigd', 'Afgerond', 'Geannuleerd'] as const
