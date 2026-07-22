export const STATUSSEN = ['Aangevraagd', 'Bevestigd', 'Afgerond', 'Geannuleerd'] as const

// Spiegelt Easy2Move.Contracts.Models.BookingStatus (C# enum). De backend
// serialiseert die als tekst (JsonStringEnumConverter), dus dit is nog
// steeds gewoon een string over de lijn - enkel hier strenger getypeerd
// zodat een typfout een TS-compilefout wordt i.p.v. een stille bug.
export type BookingStatus = (typeof STATUSSEN)[number]

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
  status: BookingStatus
  aangemaaktOp: string
}

// Wat de klant instuurt: id/status/aangemaaktOp bepaalt de backend zelf.
export type NewBooking = Omit<BookingDto, 'id' | 'status' | 'aangemaaktOp'>
