// Nagebootste backend voor de portfolio-demo.
//
// Hetzelfde idee als een mock-server, maar dan als vervanger van `fetch`:
// demoFetch krijgt dezelfde (url, init) als de echte fetch en geeft echte
// Response-objecten terug. client.ts hoeft dus niets te weten over de demo,
// en alle bestaande foutafhandeling (ApiError, 401/409/429, ...) blijft
// exact hetzelfde werken.
//
// De regels spiegelen Easy2Move.Application/Services/BookingService.cs en
// BlockedDateService.cs + de DataAnnotations op BookingDto.cs. Alles wordt
// per bezoeker bewaard in localStorage; er verlaat niets de browser.

import { STATUSSEN, type BookingDto, type BookingStatus } from '../types/booking'
import type { BlockedDateDto } from '../types/blockedDate'

const OPSLAG_SLEUTEL = 'easy2move_demo_store_v1'
// Na deze tijd wordt de demo opnieuw gezaaid, zodat "Aankomend" nooit leeg is.
const MAX_LEEFTIJD_DAGEN = 14

type Store = {
  gezaaidOp: string
  volgendBookingId: number
  volgendBlockedId: number
  bookings: BookingDto[]
  blocked: BlockedDateDto[]
}

// -----------------------------------------------------------------
// Datum-hulpjes (lokale tijd, nooit via toISOString: dat schuift een dag)
// -----------------------------------------------------------------
const pad = (n: number) => String(n).padStart(2, '0')

function naarIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// dd/MM/yyyy, zoals de backend-foutmeldingen (datum:dd/MM/yyyy)
function ddMmJjjj(iso: string): string {
  const [j, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${j}`
}

function vanIso(iso: string): Date {
  const [j, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(j, m - 1, d)
}

function dagenVanNu(offset: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offset)
  return `${naarIso(d)}T00:00:00`
}

// .NET serialiseert DateTime.UtcNow zonder "Z" (zie BookingDbContext).
const nuAlsBackend = () => new Date().toISOString().slice(0, -1)

// -----------------------------------------------------------------
// Zaaidata: verzonnen klanten, relatief aan vandaag
// -----------------------------------------------------------------
type Zaad = Omit<BookingDto, 'id' | 'datum' | 'aangemaaktOp' | 'verdieping' | 'geschatteDuurUren'> & {
  dag: number
  verdieping: number
  uren: number
}

const KLANTEN: Zaad[] = [
  {
    dag: 1, tijdslot: '09:00 - 12:00', uren: 3, verdieping: 3, status: 'Bevestigd',
    klantNaam: 'Sofie Janssens', email: 'sofie.janssens@example.com', telefoon: '0400 00 00 01',
    straat: 'Nationalestraat', huisnummer: '112', postcode: '2000', gemeente: 'Antwerpen',
    opmerkingen: 'Zetel en twee kasten. Smalle straat, parkeren kan voor de deur.',
  },
  {
    dag: 1, tijdslot: '14:00 - 16:00', uren: 2, verdieping: 4, status: 'Aangevraagd',
    klantNaam: 'Karim El Amrani', email: 'karim.elamrani@example.com', telefoon: '0400 00 00 02',
    straat: 'Turnhoutsebaan', huisnummer: '245 bus 2', postcode: '2140', gemeente: 'Borgerhout',
    opmerkingen: '',
  },
  {
    dag: 3, tijdslot: '10:00 - 13:00', uren: 3, verdieping: 5, status: 'Bevestigd',
    klantNaam: 'Lotte Van den Berghe', email: 'lotte.vdberghe@example.com', telefoon: '0400 00 00 03',
    straat: 'Mechelsesteenweg', huisnummer: '87', postcode: '2018', gemeente: 'Antwerpen',
    opmerkingen: 'Dozen en een bureau.',
  },
  {
    dag: 4, tijdslot: '08:00 - 10:00', uren: 2, verdieping: 2, status: 'Aangevraagd',
    klantNaam: 'Tom Willems', email: 'tom.willems@example.com', telefoon: '0400 00 00 04',
    straat: 'Bredabaan', huisnummer: '410', postcode: '2170', gemeente: 'Merksem',
    opmerkingen: '',
  },
  {
    dag: 6, tijdslot: '13:30 - 16:30', uren: 3, verdieping: 7, status: 'Bevestigd',
    klantNaam: 'Nadia Benali', email: 'nadia.benali@example.com', telefoon: '0400 00 00 05',
    straat: 'Leopoldstraat', huisnummer: '15', postcode: '2000', gemeente: 'Antwerpen',
    opmerkingen: 'Zware eikenhouten kast, graag met twee man.',
  },
  {
    dag: 8, tijdslot: '09:00 - 11:00', uren: 2, verdieping: 6, status: 'Aangevraagd',
    klantNaam: 'Pieter De Smet', email: 'pieter.desmet@example.com', telefoon: '0400 00 00 06',
    straat: 'Carnotstraat', huisnummer: '60', postcode: '2060', gemeente: 'Antwerpen',
    opmerkingen: '',
  },
  {
    dag: 10, tijdslot: '15:00 - 19:00', uren: 4, verdieping: 8, status: 'Bevestigd',
    klantNaam: 'Emma Claes', email: 'emma.claes@example.com', telefoon: '0400 00 00 07',
    straat: 'Italiëlei', huisnummer: '201', postcode: '2000', gemeente: 'Antwerpen',
    opmerkingen: 'Volledige studio, ook de fiets.',
  },
  {
    dag: 13, tijdslot: '11:00 - 12:00', uren: 1, verdieping: 1, status: 'Aangevraagd',
    klantNaam: 'Yassine Bouzid', email: 'yassine.bouzid@example.com', telefoon: '0400 00 00 08',
    straat: 'Kammenstraat', huisnummer: '9', postcode: '2000', gemeente: 'Antwerpen',
    opmerkingen: 'Eén bank en een tv-meubel.',
  },
  {
    dag: -2, tijdslot: '10:00 - 13:00', uren: 3, verdieping: 4, status: 'Afgerond',
    klantNaam: 'Marie Peeters', email: 'marie.peeters@example.com', telefoon: '0400 00 00 09',
    straat: 'Lange Nieuwstraat', huisnummer: '34', postcode: '2000', gemeente: 'Antwerpen',
    opmerkingen: '',
  },
  {
    dag: -5, tijdslot: '14:00 - 17:00', uren: 3, verdieping: 6, status: 'Afgerond',
    klantNaam: 'Dries Maes', email: 'dries.maes@example.com', telefoon: '0400 00 00 10',
    straat: 'Cogels-Osylei', huisnummer: '72', postcode: '2600', gemeente: 'Berchem',
    opmerkingen: 'Piano via het raam.',
  },
  {
    dag: -9, tijdslot: '09:00 - 11:00', uren: 2, verdieping: 3, status: 'Geannuleerd',
    klantNaam: 'Ines Hermans', email: 'ines.hermans@example.com', telefoon: '0400 00 00 11',
    straat: 'Frankrijklei', huisnummer: '18', postcode: '2000', gemeente: 'Antwerpen',
    opmerkingen: 'Verhuis uitgesteld.',
  },
  {
    dag: -14, tijdslot: '16:00 - 19:00', uren: 3, verdieping: 5, status: 'Afgerond',
    klantNaam: 'Wout Jacobs', email: 'wout.jacobs@example.com', telefoon: '0400 00 00 12',
    straat: 'Statiestraat', huisnummer: '140', postcode: '2600', gemeente: 'Berchem',
    opmerkingen: '',
  },
]

function maakZaad(): Store {
  const bookings: BookingDto[] = KLANTEN.map(({ dag, uren, ...b }, i) => ({
    ...b,
    id: i + 1,
    datum: dagenVanNu(dag),
    geschatteDuurUren: uren,
    // Aanvragen komen enkele dagen voor de verhuisdatum binnen.
    aangemaaktOp: `${dagenVanNu(Math.min(dag, 0) - 6).slice(0, 10)}T10:15:00`,
  }))

  const blocked: BlockedDateDto[] = [{ id: 1, datum: dagenVanNu(16), reden: 'Onderhoud ladderlift' }]
  for (let dag = 21; dag <= 27; dag++) {
    blocked.push({ id: blocked.length + 1, datum: dagenVanNu(dag), reden: 'Vakantie' })
  }

  return {
    gezaaidOp: new Date().toISOString(),
    volgendBookingId: bookings.length + 1,
    volgendBlockedId: blocked.length + 1,
    bookings,
    blocked,
  }
}

// -----------------------------------------------------------------
// Opslag: localStorage, met een geheugenvalback (privévenster, geblokkeerde
// site-data) zodat de demo ook dan blijft werken, alleen niet bewaard.
// -----------------------------------------------------------------
let geheugen: Store | null = null

function geldigeStore(data: unknown): data is Store {
  const s = data as Store | null
  return Boolean(s && Array.isArray(s.bookings) && Array.isArray(s.blocked) && s.gezaaidOp)
}

function laadStore(): Store {
  if (geheugen) return geheugen
  try {
    const ruw = localStorage.getItem(OPSLAG_SLEUTEL)
    if (ruw) {
      const data: unknown = JSON.parse(ruw)
      if (geldigeStore(data)) {
        const leeftijdDagen = (Date.now() - new Date(data.gezaaidOp).getTime()) / 86_400_000
        if (leeftijdDagen <= MAX_LEEFTIJD_DAGEN) {
          geheugen = data
          return data
        }
      }
    }
  } catch {
    // negeren: we zaaien hieronder opnieuw
  }
  geheugen = maakZaad()
  bewaar()
  return geheugen
}

function bewaar() {
  try {
    localStorage.setItem(OPSLAG_SLEUTEL, JSON.stringify(geheugen))
  } catch {
    // geen opslag beschikbaar: de demo draait gewoon in het geheugen
  }
}

// -----------------------------------------------------------------
// Antwoorden
// -----------------------------------------------------------------
const STATUS_TEKST: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  404: 'Not Found',
  409: 'Conflict',
  429: 'Too Many Requests',
}

function antwoord(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    statusText: STATUS_TEKST[status],
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
  })
}

const fout = (status: number, message: string) => antwoord(status, { message })
// De echte API geeft bij ongeldige invoer een ProblemDetails zonder "message".
const ongeldig = (errors: Record<string, string[]>) =>
  antwoord(400, { title: 'One or more validation errors occurred.', status: 400, errors })

// -----------------------------------------------------------------
// Tijdsloten en conflicten (zelfde regels als BookingService.cs)
// -----------------------------------------------------------------
const TIJDSLOT_REGEX = /^\d{2}:\d{2} - \d{2}:\d{2}$/

function naarMinuten(hhmm: string): number {
  const [u, m] = hhmm.split(':').map(Number)
  return u * 60 + m
}

// Sloten over middernacht ("23:00 - 01:00") krijgen een eindtijd na 24:00.
function parseTijdslot(tijdslot: string): { start: number; eind: number } {
  const [s, e] = tijdslot.split('-').map((x) => x.trim())
  const start = naarMinuten(s)
  let eind = naarMinuten(e)
  if (eind <= start) eind += 24 * 60
  return { start, eind }
}

class ConflictFout extends Error {}

function garandeerNietGeblokkeerd(store: Store, datum: string) {
  if (store.blocked.some((d) => d.datum.slice(0, 10) === datum.slice(0, 10))) {
    throw new ConflictFout(
      `Easy2Move is niet beschikbaar op ${ddMmJjjj(datum)}.`,
    )
  }
}

function garandeerGeenConflict(store: Store, datum: string, tijdslot: string, negeerId?: number) {
  const nieuw = parseTijdslot(tijdslot)
  const opDezelfdeDag = store.bookings.filter(
    (b) => b.datum.slice(0, 10) === datum.slice(0, 10) && b.status !== 'Geannuleerd',
  )
  for (const bestaand of opDezelfdeDag) {
    if (bestaand.id === negeerId) continue
    const { start, eind } = parseTijdslot(bestaand.tijdslot)
    if (nieuw.start < eind && start < nieuw.eind) {
      throw new ConflictFout(
        `Er is al een boeking op ${ddMmJjjj(datum)} tussen ${bestaand.tijdslot}.`,
      )
    }
  }
}

// -----------------------------------------------------------------
// Validatie (DataAnnotations op BookingDto.cs)
// -----------------------------------------------------------------
function valideer(b: Partial<BookingDto>): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  const voeg = (veld: string, bericht: string) => (errors[veld] ??= []).push(bericht)
  const tekst = (v: unknown) => (typeof v === 'string' ? v : '')

  const naam = tekst(b.klantNaam)
  if (naam.length < 2 || naam.length > 100) voeg('KlantNaam', 'Naam moet 2 tot 100 tekens zijn.')
  const email = tekst(b.email)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200)
    voeg('Email', 'Ongeldig e-mailadres.')
  const tel = tekst(b.telefoon)
  if (tel.length < 8 || tel.length > 20) voeg('Telefoon', 'Telefoon moet 8 tot 20 tekens zijn.')
  const straat = tekst(b.straat)
  if (!straat || straat.length > 150) voeg('Straat', 'Straat is verplicht.')
  const nr = tekst(b.huisnummer)
  if (!nr || nr.length > 10) voeg('Huisnummer', 'Huisnummer is verplicht.')
  if (!/^\d{4}$/.test(tekst(b.postcode))) voeg('Postcode', 'Postcode moet 4 cijfers zijn.')
  const gemeente = tekst(b.gemeente)
  if (!gemeente || gemeente.length > 100) voeg('Gemeente', 'Gemeente is verplicht.')
  const verdieping = Number(b.verdieping)
  if (!Number.isInteger(verdieping) || verdieping < 0 || verdieping > 10)
    voeg('Verdieping', 'Verdieping moet tussen 0 en 10 liggen.')
  if (!TIJDSLOT_REGEX.test(tekst(b.tijdslot))) voeg('Tijdslot', 'Ongeldig tijdslot-formaat.')
  const duur = Number(b.geschatteDuurUren)
  if (!Number.isInteger(duur) || duur < 1 || duur > 24)
    voeg('GeschatteDuurUren', 'Duur moet tussen 1 en 24 uur liggen.')
  if (tekst(b.opmerkingen).length > 1000) voeg('Opmerkingen', 'Opmerkingen zijn te lang.')
  if (!/^\d{4}-\d{2}-\d{2}/.test(tekst(b.datum))) voeg('Datum', 'Ongeldige datum.')
  if (b.status !== undefined && !STATUSSEN.includes(b.status as BookingStatus))
    voeg('Status', 'Ongeldige status.')
  return errors
}

// -----------------------------------------------------------------
// Rate limit op de publieke POST: 5 per minuut (zoals Program.cs)
// -----------------------------------------------------------------
const pogingen: number[] = []

function teVeelPogingen(): boolean {
  const nu = Date.now()
  while (pogingen.length && nu - pogingen[0] > 60_000) pogingen.shift()
  if (pogingen.length >= 5) return true
  pogingen.push(nu)
  return false
}

// -----------------------------------------------------------------
// Router
// -----------------------------------------------------------------
function leesBody<T>(init?: RequestInit): T {
  try {
    return JSON.parse(String(init?.body ?? '{}')) as T
  } catch {
    return {} as T
  }
}

function leesHeader(init: RequestInit | undefined, naam: string): string {
  const h = init?.headers
  if (!h) return ''
  if (h instanceof Headers) return h.get(naam) ?? ''
  if (Array.isArray(h)) return h.find(([k]) => k.toLowerCase() === naam.toLowerCase())?.[1] ?? ''
  const gevonden = Object.entries(h).find(([k]) => k.toLowerCase() === naam.toLowerCase())
  return gevonden ? String(gevonden[1]) : ''
}

const wacht = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function demoFetch(input: string, init?: RequestInit): Promise<Response> {
  // Een beetje vertraging, zodat laadstatussen ("Versturen…") net zo
  // voelen als bij een echte server.
  await wacht(120 + Math.random() * 160)

  const url = new URL(input, window.location.origin)
  const route = url.pathname.replace(/\/+$/, '')
  const methode = (init?.method ?? 'GET').toUpperCase()
  const isAdmin = leesHeader(init, 'X-Admin-Key').trim() !== ''
  const store = laadStore()
  const geweigerd = () => fout(401, 'Ongeldige of ontbrekende admin-sleutel.')

  try {
    // ---- /api/bookings -------------------------------------------
    if (route === '/api/bookings') {
      if (methode === 'GET') {
        return isAdmin ? antwoord(200, store.bookings) : geweigerd()
      }
      if (methode === 'POST') {
        if (teVeelPogingen())
          return fout(429, 'Te veel boekingspogingen. Probeer het over een minuutje opnieuw.')
        const body = leesBody<BookingDto>(init)
        const errors = valideer(body)
        if (Object.keys(errors).length) return ongeldig(errors)
        // Een klant mag nooit zelf een status meesturen.
        return antwoord(201, maakBooking(store, { ...body, status: 'Aangevraagd' }))
      }
    }

    if (route === '/api/bookings/bezet' && methode === 'GET') {
      const datum = url.searchParams.get('datum') ?? ''
      const sloten = store.bookings
        .filter((b) => b.datum.slice(0, 10) === datum.slice(0, 10) && b.status !== 'Geannuleerd')
        .map((b) => b.tijdslot)
      return antwoord(200, sloten)
    }

    if (route === '/api/bookings/admin' && methode === 'POST') {
      if (!isAdmin) return geweigerd()
      const body = leesBody<BookingDto>(init)
      const errors = valideer(body)
      if (Object.keys(errors).length) return ongeldig(errors)
      return antwoord(201, maakBooking(store, { ...body, status: body.status ?? 'Aangevraagd' }))
    }

    const bookingMatch = route.match(/^\/api\/bookings\/(\d+)$/)
    if (bookingMatch) {
      if (!isAdmin) return geweigerd()
      const id = Number(bookingMatch[1])
      const bestaand = store.bookings.find((b) => b.id === id)
      if (!bestaand) return antwoord(404)

      if (methode === 'GET') return antwoord(200, bestaand)

      if (methode === 'PUT') {
        const body = leesBody<BookingDto>(init)
        const errors = valideer(body)
        if (Object.keys(errors).length) return ongeldig(errors)
        // Enkel op blokkades controleren als de datum echt verandert, anders
        // zou een nadien geblokkeerde dag het beheer van de boeking blokkeren.
        if (body.datum.slice(0, 10) !== bestaand.datum.slice(0, 10))
          garandeerNietGeblokkeerd(store, body.datum)
        garandeerGeenConflict(store, body.datum, body.tijdslot, id)

        Object.assign(bestaand, {
          klantNaam: body.klantNaam,
          email: body.email,
          telefoon: body.telefoon,
          straat: body.straat,
          huisnummer: body.huisnummer,
          postcode: body.postcode,
          gemeente: body.gemeente,
          verdieping: body.verdieping,
          datum: body.datum,
          tijdslot: body.tijdslot,
          geschatteDuurUren: body.geschatteDuurUren,
          opmerkingen: body.opmerkingen ?? '',
          status: body.status,
        })
        bewaar()
        return antwoord(200, bestaand)
      }

      if (methode === 'DELETE') {
        store.bookings = store.bookings.filter((b) => b.id !== id)
        bewaar()
        return antwoord(204)
      }
    }

    // ---- /api/blocked-dates --------------------------------------
    if (route === '/api/blocked-dates') {
      if (methode === 'GET') {
        const gesorteerd = [...store.blocked].sort((a, b) => a.datum.localeCompare(b.datum))
        return antwoord(200, gesorteerd)
      }
      if (methode === 'POST') {
        if (!isAdmin) return geweigerd()
        const { datum, reden } = leesBody<{ datum: string; reden?: string }>(init)
        const bestaat = store.blocked.find((d) => d.datum.slice(0, 10) === datum.slice(0, 10))
        if (bestaat) return antwoord(200, bestaat)
        const nieuw = { id: store.volgendBlockedId++, datum, reden: reden ?? '' }
        store.blocked.push(nieuw)
        bewaar()
        return antwoord(200, nieuw)
      }
    }

    if (route === '/api/blocked-dates/range' && methode === 'POST') {
      if (!isAdmin) return geweigerd()
      const { van, tot, reden } = leesBody<{ van: string; tot: string; reden?: string }>(init)
      const [start, eind] = van.slice(0, 10) <= tot.slice(0, 10) ? [van, tot] : [tot, van]
      const nieuwe: BlockedDateDto[] = []
      for (let d = vanIso(start); naarIso(d) <= eind.slice(0, 10); d.setDate(d.getDate() + 1)) {
        const dag = `${naarIso(d)}T00:00:00`
        if (store.blocked.some((x) => x.datum.slice(0, 10) === dag.slice(0, 10))) continue
        const rij = { id: store.volgendBlockedId++, datum: dag, reden: reden ?? '' }
        store.blocked.push(rij)
        nieuwe.push(rij)
      }
      bewaar()
      return antwoord(200, nieuwe)
    }

    const blockedMatch = route.match(/^\/api\/blocked-dates\/(\d+)$/)
    if (blockedMatch && methode === 'DELETE') {
      if (!isAdmin) return geweigerd()
      const id = Number(blockedMatch[1])
      if (!store.blocked.some((d) => d.id === id)) return antwoord(404)
      store.blocked = store.blocked.filter((d) => d.id !== id)
      bewaar()
      return antwoord(204)
    }
  } catch (err) {
    if (err instanceof ConflictFout) return fout(409, err.message)
    throw err
  }

  return antwoord(404)
}

function maakBooking(store: Store, b: BookingDto): BookingDto {
  garandeerNietGeblokkeerd(store, b.datum)
  garandeerGeenConflict(store, b.datum, b.tijdslot)

  const nieuw: BookingDto = {
    ...b,
    id: store.volgendBookingId++,
    opmerkingen: b.opmerkingen ?? '',
    aangemaaktOp: nuAlsBackend(),
  }
  store.bookings.push(nieuw)
  bewaar()
  return nieuw
}
