import { useCallback, useEffect, useMemo, useState, type FormEvent, type MouseEvent } from 'react'
import {
  ApiError,
  controleerAdminKey,
  createBookingAlsAdmin,
  deleteBooking,
  getAdminKey,
  getBezetteTijdsloten,
  getBookings,
  updateBooking,
  wisAdminKey,
} from '../api/bookings'
import {
  createBlockedDate,
  createBlockedDateRange,
  deleteBlockedDate,
  getBlockedDates,
} from '../api/blockedDates'
import type { BookingDto } from '../types/booking'
import type { BlockedDateDto } from '../types/blockedDate'
import { tijdslotVan } from '../lib/tijd'
import { geldigTelefoonnummer, geldigeEmail, geldigePostcode, nietLeeg } from '../lib/validatie'
import StatusMenu from '../components/StatusMenu'
import TijdKiezer from '../components/TijdKiezer'
import Kalender from '../components/Kalender'
import Dropdown from '../components/Dropdown'
import Seo from '../components/Seo'
import Veld from '../components/Veld'

type VeldenState = {
  klantNaam: string
  email: string
  telefoon: string
  straat: string
  huisnummer: string
  postcode: string
  gemeente: string
  verdieping: number
  datum: string
  startTijd: string
  geschatteDuurUren: number
  opmerkingen: string
  status: string
}

const LEGE_VELDEN: VeldenState = {
  klantNaam: '',
  email: '',
  telefoon: '',
  straat: '',
  huisnummer: '',
  postcode: '',
  gemeente: '',
  verdieping: 1,
  datum: '',
  startTijd: '',
  geschatteDuurUren: 1,
  opmerkingen: '',
  status: 'Bevestigd',
}

function naarVelden(b: BookingDto): VeldenState {
  return {
    klantNaam: b.klantNaam,
    email: b.email,
    telefoon: b.telefoon,
    straat: b.straat,
    huisnummer: b.huisnummer,
    postcode: b.postcode,
    gemeente: b.gemeente,
    verdieping: b.verdieping,
    datum: b.datum.slice(0, 10),
    startTijd: b.tijdslot.split('-')[0].trim(),
    geschatteDuurUren: b.geschatteDuurUren,
    opmerkingen: b.opmerkingen,
    status: b.status,
  }
}

function naarPayload(v: VeldenState) {
  return {
    klantNaam: v.klantNaam,
    email: v.email,
    telefoon: v.telefoon,
    straat: v.straat,
    huisnummer: v.huisnummer,
    postcode: v.postcode,
    gemeente: v.gemeente,
    verdieping: v.verdieping,
    datum: `${v.datum}T00:00:00`,
    tijdslot: tijdslotVan(v.startTijd, v.geschatteDuurUren),
    geschatteDuurUren: v.geschatteDuurUren,
    opmerkingen: v.opmerkingen,
    status: v.status,
  }
}

function datumKort(iso: string) {
  return new Date(iso).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function datumLang(iso: string) {
  return new Date(iso).toLocaleString('nl-BE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isVandaagOfLater(iso: string) {
  const vandaag = new Date()
  vandaag.setHours(0, 0, 0, 0)
  return new Date(iso) >= vandaag
}

function useBezetteTijdsloten(datum: string, negeer?: string) {
  const [bezet, setBezet] = useState<string[]>([])
  useEffect(() => {
    if (!datum) {
      setBezet([])
      return
    }
    let actief = true
    getBezetteTijdsloten(datum)
      .then((data) => actief && setBezet(negeer ? data.filter((t) => t !== negeer) : data))
      .catch(() => actief && setBezet([]))
    return () => {
      actief = false
    }
  }, [datum, negeer])
  return bezet
}

function useGeblokkeerdeDagen() {
  const [dagen, setDagen] = useState<string[]>([])
  useEffect(() => {
    let actief = true
    getBlockedDates()
      .then((data) => actief && setDagen(data.map((d) => d.datum.slice(0, 10))))
      .catch(() => actief && setDagen([]))
    return () => {
      actief = false
    }
  }, [])
  return dagen
}

function CallIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  )
}

// -----------------------------------------------------------------
// Gedeelde velden voor "nieuwe boeking" en "boeking bewerken"
// -----------------------------------------------------------------
function BoekingVelden({
  waarde,
  onChange,
  bezet,
  geblokkeerdeDagen,
  submitPoging = false,
}: {
  waarde: VeldenState
  onChange: (patch: Partial<VeldenState>) => void
  bezet: string[]
  geblokkeerdeDagen: string[]
  submitPoging?: boolean
}) {
  return (
    <div className="admin-form">
      <div className="form__grid">
        <Veld
          className="field--wide"
          label="Naam *"
          waarde={waarde.klantNaam}
          onChange={(v) => onChange({ klantNaam: v })}
          validator={nietLeeg}
          forceer={submitPoging}
        />
        <Veld
          label="E-mail *"
          type="email"
          waarde={waarde.email}
          onChange={(v) => onChange({ email: v })}
          validator={geldigeEmail}
          forceer={submitPoging}
        />
        <Veld
          label="Telefoon *"
          type="tel"
          waarde={waarde.telefoon}
          onChange={(v) => onChange({ telefoon: v })}
          validator={geldigTelefoonnummer}
          forceer={submitPoging}
        />
      </div>

      <div className="form__grid">
        <Veld
          className="field--groot"
          label="Straat *"
          waarde={waarde.straat}
          onChange={(v) => onChange({ straat: v })}
          validator={nietLeeg}
          forceer={submitPoging}
        />
        <Veld
          className="field--klein"
          label="Nr *"
          waarde={waarde.huisnummer}
          onChange={(v) => onChange({ huisnummer: v })}
          validator={nietLeeg}
          forceer={submitPoging}
        />
        <Veld
          className="field--klein"
          label="Postcode *"
          waarde={waarde.postcode}
          onChange={(v) => onChange({ postcode: v })}
          validator={geldigePostcode}
          forceer={submitPoging}
          inputMode="numeric"
        />
        <Veld
          className="field--groot"
          label="Gemeente *"
          waarde={waarde.gemeente}
          onChange={(v) => onChange({ gemeente: v })}
          validator={nietLeeg}
          forceer={submitPoging}
        />
        <div className="veld-blok field field--klein">
          <span className="veld-blok__label">Verdieping</span>
          <div className="stepper stepper--compact">
            <button
              type="button"
              aria-label="Verdieping lager"
              disabled={waarde.verdieping <= 0}
              onClick={() => onChange({ verdieping: waarde.verdieping - 1 })}
            >
              −
            </button>
            <span className="stepper__waarde">{waarde.verdieping}</span>
            <button
              type="button"
              aria-label="Verdieping hoger"
              disabled={waarde.verdieping >= 10}
              onClick={() => onChange({ verdieping: waarde.verdieping + 1 })}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="veld-blok">
        <span className="veld-blok__label">Datum *</span>
        <Kalender
          value={waarde.datum}
          onChange={(iso) => onChange({ datum: iso })}
          geblokkeerdeDagen={geblokkeerdeDagen}
        />
      </div>

      <div className="form__grid">
        <div className="field field--groot">
          <span>Starttijd *</span>
          <TijdKiezer
            start={waarde.startTijd}
            duurUren={waarde.geschatteDuurUren}
            bezet={bezet}
            onStartChange={(t) => onChange({ startTijd: t })}
          />
        </div>
        <label className="field field--klein">
          <span>Duur</span>
          <Dropdown
            waarde={String(waarde.geschatteDuurUren)}
            opties={[1, 2, 3, 4, 5, 6].map((u) => ({ waarde: String(u), label: `${u} uur` }))}
            onChange={(v) => onChange({ geschatteDuurUren: Number(v) })}
          />
        </label>
      </div>

      <label className="field field--wide">
        <span>Opmerkingen</span>
        <textarea rows={2} value={waarde.opmerkingen} onChange={(e) => onChange({ opmerkingen: e.target.value })} />
      </label>

      <div className="veld-blok">
        <span className="veld-blok__label">Status</span>
        <StatusMenu status={waarde.status} onChange={(status) => onChange({ status })} />
      </div>
    </div>
  )
}

// -----------------------------------------------------------------
// Inlogscherm
// -----------------------------------------------------------------
function InlogScherm({ onIngelogd }: { onIngelogd: () => void }) {
  const [wachtwoord, setWachtwoord] = useState('')
  const [bezig, setBezig] = useState(false)
  const [submitPoging, setSubmitPoging] = useState(false)
  const [onjuist, setOnjuist] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitPoging(true)
    if (!wachtwoord.trim()) return
    setBezig(true)
    setOnjuist(false)
    const ok = await controleerAdminKey(wachtwoord)
    setBezig(false)
    if (ok) onIngelogd()
    else setOnjuist(true)
  }

  return (
    <section className="page section">
      <Seo titel="Admin: Easy2Move" beschrijving="Beheeromgeving voor Easy2Move." pad="/admin" noIndex />
      <div className="container container--narrow admin-login">
        <p className="overline">Admin</p>
        <h1 className="section__title">Inloggen</h1>
        <p className="page__lead">Enkel voor Easy2Move zelf. Vraag het wachtwoord aan de eigenaar.</p>
        <form onSubmit={onSubmit} className="admin-login__form" noValidate>
          <Veld
            className="field--wide"
            label="Wachtwoord"
            type="password"
            autoFocus
            waarde={wachtwoord}
            onChange={(v) => {
              setWachtwoord(v)
              setOnjuist(false)
            }}
            validator={onjuist ? () => 'Onjuist wachtwoord.' : nietLeeg}
            forceer={submitPoging || onjuist}
          />
          <button type="submit" className="btn btn--solid btn--full" disabled={bezig}>
            {bezig ? 'Bezig…' : 'Inloggen'}
          </button>
        </form>
      </div>
    </section>
  )
}

// -----------------------------------------------------------------
// Paneel: beschikbaarheid (dagen blokkeren, bv. vakantie)
// -----------------------------------------------------------------
function BeschikbaarheidPaneel({ onSluiten }: { onSluiten: () => void }) {
  const [dagen, setDagen] = useState<BlockedDateDto[]>([])
  const [laden, setLaden] = useState(true)
  const [fout, setFout] = useState<string | null>(null)
  const [periode, setPeriode] = useState(false)
  const [van, setVan] = useState('')
  const [tot, setTot] = useState('')
  const [reden, setReden] = useState('')
  const [bezig, setBezig] = useState(false)

  const laadDagen = useCallback(async () => {
    setLaden(true)
    try {
      setDagen(await getBlockedDates())
    } catch {
      setFout('Kon geblokkeerde dagen niet laden.')
    } finally {
      setLaden(false)
    }
  }, [])

  useEffect(() => {
    void laadDagen()
  }, [laadDagen])

  async function blokkeer(e: FormEvent) {
    e.preventDefault()
    if (!van || (periode && !tot)) return
    setBezig(true)
    setFout(null)
    try {
      if (periode) {
        await createBlockedDateRange({ van: `${van}T00:00:00`, tot: `${tot}T00:00:00`, reden })
      } else {
        await createBlockedDate({ datum: `${van}T00:00:00`, reden })
      }
      setVan('')
      setTot('')
      setReden('')
      await laadDagen()
    } catch (err) {
      setFout(err instanceof ApiError ? err.message : 'Kon de dag/dagen niet blokkeren.')
    } finally {
      setBezig(false)
    }
  }

  async function geefVrij(dag: BlockedDateDto) {
    try {
      await deleteBlockedDate(dag.id)
      setDagen((ds) => ds.filter((d) => d.id !== dag.id))
    } catch {
      setFout(`Dag ${datumKort(dag.datum)} kon niet worden vrijgegeven.`)
    }
  }

  const geblokkeerdeDagen = dagen.map((d) => d.datum.slice(0, 10))
  const toekomstig = dagen
    .filter((d) => isVandaagOfLater(d.datum))
    .sort((a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime())

  return (
    <>
      <div className="drawer__overlay" onClick={onSluiten} />
      <aside className="drawer" role="dialog" aria-label="Beschikbaarheid">
        <div className="drawer__kop">
          <h2>Beschikbaarheid</h2>
          <button type="button" className="drawer__sluit" onClick={onSluiten}>
            ×
          </button>
        </div>
        <p className="page__lead admin-form__intro">
          Klik een dag aan om die te blokkeren, bijvoorbeeld voor een vakantie. Klanten kunnen
          die dag dan niet meer boeken.
        </p>
        {fout && (
          <div className="banner banner--error" role="alert">
            {fout}
          </div>
        )}

        <form onSubmit={blokkeer} className="admin-form" noValidate>
          <div className="chips">
            <button
              type="button"
              className={`chip ${!periode ? 'chip--actief' : ''}`}
              onClick={() => setPeriode(false)}
            >
              Eén dag
            </button>
            <button
              type="button"
              className={`chip ${periode ? 'chip--actief' : ''}`}
              onClick={() => setPeriode(true)}
            >
              Periode (meerdere dagen)
            </button>
          </div>

          <div className="veld-blok">
            <span className="veld-blok__label">{periode ? 'Van' : 'Datum'}</span>
            <Kalender value={van} onChange={setVan} geblokkeerdeDagen={geblokkeerdeDagen} />
          </div>

          {periode && (
            <div className="veld-blok">
              <span className="veld-blok__label">Tot en met</span>
              <Kalender value={tot} onChange={setTot} geblokkeerdeDagen={geblokkeerdeDagen} />
            </div>
          )}

          <label className="field field--wide">
            <span>Reden (optioneel)</span>
            <input value={reden} onChange={(e) => setReden(e.target.value)} placeholder="Bijvoorbeeld vakantie" />
          </label>
          <button
            type="submit"
            className="btn btn--solid btn--full"
            disabled={!van || (periode && !tot) || bezig}
          >
            {bezig ? 'Bezig…' : periode ? 'Periode blokkeren' : 'Dag blokkeren'}
          </button>
        </form>

        <div className="veld-blok">
          <span className="veld-blok__label">Geblokkeerde dagen</span>
          {laden ? (
            <p className="admin__leeg-sub">Laden…</p>
          ) : toekomstig.length === 0 ? (
            <p className="admin__leeg-sub">Nog geen geblokkeerde dagen.</p>
          ) : (
            <ul className="blok-lijst">
              {toekomstig.map((d) => (
                <li key={d.id}>
                  <span>
                    {datumKort(d.datum)}
                    {d.reden && <span className="blok-lijst__reden">({d.reden})</span>}
                  </span>
                  <button type="button" onClick={() => void geefVrij(d)} aria-label="Dag vrijgeven">
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}

// -----------------------------------------------------------------
// Paneel: nieuwe (telefonische) boeking
// -----------------------------------------------------------------
function NieuweBoekingPaneel({
  onGemaakt,
  onSluiten,
}: {
  onGemaakt: () => void
  onSluiten: () => void
}) {
  const [waarde, setWaarde] = useState<VeldenState>(LEGE_VELDEN)
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState<string | null>(null)
  const [submitPoging, setSubmitPoging] = useState(false)
  const bezet = useBezetteTijdsloten(waarde.datum)
  const geblokkeerdeDagen = useGeblokkeerdeDagen()

  const heeftVeldfout = [
    nietLeeg(waarde.klantNaam),
    geldigeEmail(waarde.email),
    geldigTelefoonnummer(waarde.telefoon),
    nietLeeg(waarde.straat),
    nietLeeg(waarde.huisnummer),
    geldigePostcode(waarde.postcode),
    nietLeeg(waarde.gemeente),
  ].some(Boolean)

  function onChange(patch: Partial<VeldenState>) {
    setWaarde((v) => ({ ...v, ...patch }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitPoging(true)
    if (heeftVeldfout) return
    setBezig(true)
    setFout(null)
    try {
      await createBookingAlsAdmin(naarPayload(waarde))
      onGemaakt()
    } catch (err) {
      setFout(err instanceof ApiError ? err.message : 'Boeking kon niet worden opgeslagen.')
    } finally {
      setBezig(false)
    }
  }

  return (
    <>
      <div className="drawer__overlay" onClick={onSluiten} />
      <aside className="drawer" role="dialog" aria-label="Nieuwe boeking">
        <div className="drawer__kop">
          <h2>Telefonische boeking</h2>
          <button type="button" className="drawer__sluit" onClick={onSluiten}>
            ×
          </button>
        </div>
        <p className="page__lead admin-form__intro">
          Voor klanten die bellen in plaats van online te boeken. Zet de status meteen op
          &quot;Bevestigd&quot; als je het al met de klant hebt afgesproken.
        </p>
        {fout && (
          <div className="banner banner--error" role="alert">
            {fout}
          </div>
        )}
        <form onSubmit={onSubmit} noValidate>
          <BoekingVelden
            waarde={waarde}
            onChange={onChange}
            bezet={bezet}
            geblokkeerdeDagen={geblokkeerdeDagen}
            submitPoging={submitPoging}
          />
          <button type="submit" className="btn btn--solid btn--full" disabled={bezig}>
            {bezig ? 'Opslaan…' : 'Boeking toevoegen'}
          </button>
        </form>
      </aside>
    </>
  )
}

// -----------------------------------------------------------------
// Hoofdpagina
// -----------------------------------------------------------------
type Tab = 'aankomend' | 'geschiedenis' | 'alle'

export default function Admin() {
  const [ingelogd, setIngelogd] = useState(() => Boolean(getAdminKey()))
  const [bookings, setBookings] = useState<BookingDto[]>([])
  const [laden, setLaden] = useState(true)
  const [fout, setFout] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('aankomend')
  const [zoekterm, setZoekterm] = useState('')
  const [detail, setDetail] = useState<BookingDto | null>(null)
  const [bewerken, setBewerken] = useState(false)
  const [bewerkVelden, setBewerkVelden] = useState<VeldenState>(LEGE_VELDEN)
  const [opslaanBezig, setOpslaanBezig] = useState(false)
  const [opslaanFout, setOpslaanFout] = useState<string | null>(null)
  const [bewerkSubmitPoging, setBewerkSubmitPoging] = useState(false)
  const [nieuweBoekingOpen, setNieuweBoekingOpen] = useState(false)
  const [beschikbaarheidOpen, setBeschikbaarheidOpen] = useState(false)

  const bewerkBezet = useBezetteTijdsloten(bewerkVelden.datum, detail?.tijdslot)
  const geblokkeerdeDagen = useGeblokkeerdeDagen()

  const bewerkVeldfout = [
    nietLeeg(bewerkVelden.klantNaam),
    geldigeEmail(bewerkVelden.email),
    geldigTelefoonnummer(bewerkVelden.telefoon),
    nietLeeg(bewerkVelden.straat),
    nietLeeg(bewerkVelden.huisnummer),
    geldigePostcode(bewerkVelden.postcode),
    nietLeeg(bewerkVelden.gemeente),
  ].some(Boolean)

  const laad = useCallback(async () => {
    setLaden(true)
    setFout(null)
    try {
      setBookings(await getBookings())
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        wisAdminKey()
        setIngelogd(false)
      } else {
        setFout('Kon boekingen niet laden. Draait de API (dotnet run)?')
      }
    } finally {
      setLaden(false)
    }
  }, [])

  useEffect(() => {
    if (ingelogd) void laad()
  }, [ingelogd, laad])

  const gefilterd = useMemo(() => {
    let lijst = bookings
    if (tab === 'aankomend') {
      lijst = lijst.filter(
        (b) => isVandaagOfLater(b.datum) && b.status !== 'Geannuleerd' && b.status !== 'Afgerond',
      )
    } else if (tab === 'geschiedenis') {
      lijst = lijst.filter(
        (b) => !isVandaagOfLater(b.datum) || b.status === 'Geannuleerd' || b.status === 'Afgerond',
      )
    }
    const q = zoekterm.trim().toLowerCase()
    if (q) {
      lijst = lijst.filter((b) =>
        [b.klantNaam, b.email, b.telefoon, b.gemeente, b.straat].some((v) =>
          v.toLowerCase().includes(q),
        ),
      )
    }
    return [...lijst].sort((a, b) =>
      tab === 'geschiedenis'
        ? new Date(b.datum).getTime() - new Date(a.datum).getTime()
        : new Date(a.datum).getTime() - new Date(b.datum).getTime(),
    )
  }, [bookings, tab, zoekterm])

  async function wijzigStatus(booking: BookingDto, status: string) {
    const vorige = booking.status
    setBookings((bs) => bs.map((b) => (b.id === booking.id ? { ...b, status } : b)))
    setDetail((d) => (d && d.id === booking.id ? { ...d, status } : d))
    try {
      await updateBooking(booking.id, { ...booking, status })
    } catch {
      setBookings((bs) => bs.map((b) => (b.id === booking.id ? { ...b, status: vorige } : b)))
      setDetail((d) => (d && d.id === booking.id ? { ...d, status: vorige } : d))
      setFout(`Status van boeking #${booking.id} kon niet worden opgeslagen.`)
    }
  }

  async function verwijder(booking: BookingDto) {
    if (!window.confirm(`Boeking #${booking.id} van ${booking.klantNaam} verwijderen?`)) return
    try {
      await deleteBooking(booking.id)
      setBookings((bs) => bs.filter((b) => b.id !== booking.id))
      if (detail?.id === booking.id) setDetail(null)
    } catch {
      setFout(`Boeking #${booking.id} kon niet worden verwijderd.`)
    }
  }

  function openDetail(booking: BookingDto) {
    setDetail(booking)
    setBewerken(false)
    setOpslaanFout(null)
  }

  function startBewerken() {
    if (!detail) return
    setBewerkVelden(naarVelden(detail))
    setBewerken(true)
    setOpslaanFout(null)
    setBewerkSubmitPoging(false)
  }

  async function opslaanBewerking(e: FormEvent) {
    e.preventDefault()
    if (!detail) return
    setBewerkSubmitPoging(true)
    if (bewerkVeldfout) return
    setOpslaanBezig(true)
    setOpslaanFout(null)
    try {
      const bijgewerkt = await updateBooking(detail.id, { ...detail, ...naarPayload(bewerkVelden) })
      setBookings((bs) => bs.map((b) => (b.id === bijgewerkt.id ? bijgewerkt : b)))
      setDetail(bijgewerkt)
      setBewerken(false)
    } catch (err) {
      setOpslaanFout(err instanceof ApiError ? err.message : 'Boeking kon niet worden opgeslagen.')
    } finally {
      setOpslaanBezig(false)
    }
  }

  function onTel(e: MouseEvent, telefoon: string) {
    e.stopPropagation()
    window.location.href = `tel:${telefoon.replace(/\s/g, '')}`
  }

  if (!ingelogd) {
    return <InlogScherm onIngelogd={() => setIngelogd(true)} />
  }

  return (
    <section className="page section">
      <Seo titel="Admin: Easy2Move" beschrijving="Beheeromgeving voor Easy2Move." pad="/admin" noIndex />
      <div className="container">
        <div className="admin__kop">
          <div>
            <p className="overline">Admin</p>
            <h1 className="section__title">
              Boekingen {!laden && <span className="admin__aantal">({gefilterd.length})</span>}
            </h1>
          </div>
          <div className="admin__acties">
            <button type="button" className="btn btn--solid btn--small" onClick={() => setNieuweBoekingOpen(true)}>
              + Telefonische boeking
            </button>
            <button type="button" className="btn btn--ghost btn--small" onClick={() => setBeschikbaarheidOpen(true)}>
              Beschikbaarheid
            </button>
            <button type="button" className="btn btn--ghost btn--small" onClick={laad} disabled={laden}>
              <span className={laden ? 'draai' : ''}>↻</span> Vernieuwen
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--small"
              onClick={() => {
                wisAdminKey()
                setIngelogd(false)
              }}
            >
              Uitloggen
            </button>
          </div>
        </div>

        <div className="admin__filters">
          <div className="chips">
            {(
              [
                ['aankomend', 'Aankomend'],
                ['geschiedenis', 'Geschiedenis'],
                ['alle', 'Alle'],
              ] as const
            ).map(([waarde, label]) => (
              <button
                key={waarde}
                type="button"
                className={`chip ${tab === waarde ? 'chip--actief' : ''}`}
                onClick={() => setTab(waarde)}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            type="search"
            className="admin__zoek"
            placeholder="Zoek op naam, e-mail, telefoon of gemeente"
            value={zoekterm}
            onChange={(e) => setZoekterm(e.target.value)}
          />
        </div>

        {fout && (
          <div className="banner banner--error" role="alert">
            {fout}
          </div>
        )}

        {laden ? (
          <p className="admin__leeg pulse">Boekingen laden…</p>
        ) : gefilterd.length === 0 ? (
          <div className="admin__leeg">
            <p>
              {tab === 'aankomend'
                ? 'Geen aankomende boekingen.'
                : tab === 'geschiedenis'
                  ? 'Nog geen geschiedenis.'
                  : 'Nog geen boekingen.'}
            </p>
            <p className="admin__leeg-sub">
              Nieuwe aanvragen via het boekingsformulier verschijnen hier meteen.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop/tablet: volledige tabel */}
            <div className="tabel-scroll">
              <table className="tabel">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Klant</th>
                    <th>Datum</th>
                    <th>Adres</th>
                    <th>Verd.</th>
                    <th>Status</th>
                    <th aria-label="Acties" />
                  </tr>
                </thead>
                <tbody>
                  {gefilterd.map((b) => (
                    <tr key={b.id} onClick={() => openDetail(b)}>
                      <td className="tabel__id">{b.id}</td>
                      <td>
                        <strong>{b.klantNaam}</strong>
                        <span className="tabel__sub">{b.email}</span>
                      </td>
                      <td>
                        {datumKort(b.datum)}
                        <span className="tabel__sub">{b.tijdslot}</span>
                      </td>
                      <td>
                        {b.gemeente}
                        <span className="tabel__sub">
                          {b.straat} {b.huisnummer}
                        </span>
                      </td>
                      <td>{b.verdieping === 0 ? 'GV' : b.verdieping}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <StatusMenu status={b.status} onChange={(status) => void wijzigStatus(b, status)} />
                      </td>
                      <td className="tabel__acties" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="tabel__bel" title="Bellen" onClick={(e) => onTel(e, b.telefoon)}>
                          <CallIcon />
                        </button>
                        <button type="button" className="tabel__delete" title="Verwijderen" onClick={() => void verwijder(b)}>
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobiel: compacte kaarten, enkel het nodige + doorklikken voor de rest */}
            <ul className="boeking-kaarten">
              {gefilterd.map((b) => (
                <li key={b.id} className="boeking-kaart" onClick={() => openDetail(b)}>
                  <div className="boeking-kaart__rij">
                    <span className="boeking-kaart__naam">{b.klantNaam}</span>
                    <span onClick={(e) => e.stopPropagation()}>
                      <StatusMenu status={b.status} onChange={(status) => void wijzigStatus(b, status)} />
                    </span>
                  </div>
                  <span className="boeking-kaart__meta">
                    {datumKort(b.datum)} · {b.tijdslot}
                  </span>
                  <div className="boeking-kaart__acties" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`tel:${b.telefoon.replace(/\s/g, '')}`}
                      className="btn btn--gold btn--small boeking-kaart__bel"
                    >
                      <CallIcon /> Bellen
                    </a>
                    <button
                      type="button"
                      className="tabel__delete"
                      title="Verwijderen"
                      onClick={() => void verwijder(b)}
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {nieuweBoekingOpen && (
        <NieuweBoekingPaneel
          onSluiten={() => setNieuweBoekingOpen(false)}
          onGemaakt={() => {
            setNieuweBoekingOpen(false)
            void laad()
          }}
        />
      )}

      {beschikbaarheidOpen && (
        <BeschikbaarheidPaneel onSluiten={() => setBeschikbaarheidOpen(false)} />
      )}

      {detail && (
        <>
          <div className="drawer__overlay" onClick={() => setDetail(null)} />
          <aside className="drawer" role="dialog" aria-label={`Boeking #${detail.id}`}>
            <div className="drawer__kop">
              <h2>
                Boeking <span className="drawer__id">#{detail.id}</span>
              </h2>
              <button type="button" className="drawer__sluit" onClick={() => setDetail(null)}>
                ×
              </button>
            </div>

            {!bewerken ? (
              <>
                <div className="drawer__statusrij">
                  <StatusMenu status={detail.status} onChange={(status) => void wijzigStatus(detail, status)} />
                  <a className="btn btn--gold btn--small" href={`tel:${detail.telefoon.replace(/\s/g, '')}`}>
                    <CallIcon /> Bellen
                  </a>
                </div>

                <dl className="drawer__lijst">
                  <dt>Klant</dt>
                  <dd>{detail.klantNaam}</dd>
                  <dt>E-mail</dt>
                  <dd>
                    <a href={`mailto:${detail.email}`}>{detail.email}</a>
                  </dd>
                  <dt>Telefoon</dt>
                  <dd>
                    <a href={`tel:${detail.telefoon.replace(/\s/g, '')}`}>{detail.telefoon}</a>
                  </dd>
                  <dt>Adres</dt>
                  <dd>
                    {detail.straat} {detail.huisnummer}, {detail.postcode} {detail.gemeente}
                  </dd>
                  <dt>Verdieping</dt>
                  <dd>{detail.verdieping === 0 ? 'Gelijkvloers' : `${detail.verdieping}e verdieping`}</dd>
                  <dt>Datum</dt>
                  <dd>
                    {datumKort(detail.datum)}, {detail.tijdslot}
                  </dd>
                  <dt>Geschatte duur</dt>
                  <dd>{detail.geschatteDuurUren} uur</dd>
                  {detail.opmerkingen && (
                    <>
                      <dt>Opmerkingen</dt>
                      <dd>{detail.opmerkingen}</dd>
                    </>
                  )}
                  <dt>Aangevraagd op</dt>
                  <dd>{datumLang(detail.aangemaaktOp)}</dd>
                </dl>

                <div className="drawer__acties">
                  <button type="button" className="btn btn--ghost btn--full" onClick={startBewerken}>
                    Bewerken
                  </button>
                  <button type="button" className="btn btn--ghost btn--full" onClick={() => void verwijder(detail)}>
                    Verwijderen
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={opslaanBewerking} noValidate>
                {opslaanFout && (
                  <div className="banner banner--error" role="alert">
                    {opslaanFout}
                  </div>
                )}
                <BoekingVelden
                  waarde={bewerkVelden}
                  onChange={(patch) => setBewerkVelden((v) => ({ ...v, ...patch }))}
                  bezet={bewerkBezet}
                  geblokkeerdeDagen={geblokkeerdeDagen}
                  submitPoging={bewerkSubmitPoging}
                />
                <div className="drawer__acties">
                  <button type="submit" className="btn btn--solid btn--full" disabled={opslaanBezig}>
                    {opslaanBezig ? 'Opslaan…' : 'Wijzigingen opslaan'}
                  </button>
                  <button type="button" className="btn btn--ghost btn--full" onClick={() => setBewerken(false)}>
                    Annuleren
                  </button>
                </div>
              </form>
            )}
          </aside>
        </>
      )}
    </section>
  )
}
