import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, createBooking, getBezetteTijdsloten } from '../api/bookings'
import { getBlockedDates } from '../api/blockedDates'
import type { BookingDto } from '../types/booking'
import { berekenTotaal, isZondag, richtprijsPerUur } from '../lib/prijzen'
import { tijdslotVan, tijdslotenOverlappen } from '../lib/tijd'
import { geldigTelefoonnummer, geldigeEmail, geldigePostcode, nietLeeg } from '../lib/validatie'
import Kalender from '../components/Kalender'
import TijdKiezer from '../components/TijdKiezer'
import Dropdown from '../components/Dropdown'
import Reveal from '../components/Reveal'
import Seo from '../components/Seo'
import Veld from '../components/Veld'

const LEEG = {
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
}

type FormState = typeof LEEG

const MAX_VERDIEPING = 10
const DUUR_OPTIES = [1, 2, 3, 4, 5, 6]

export default function Boeken() {
  const [form, setForm] = useState<FormState>(LEEG)
  const [bezet, setBezet] = useState<string[]>([])
  const [geblokkeerdeDagen, setGeblokkeerdeDagen] = useState<string[]>([])
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState<string | null>(null)
  const [submitPoging, setSubmitPoging] = useState(false)
  const [resultaat, setResultaat] = useState<BookingDto | null>(null)

  useEffect(() => {
    getBlockedDates()
      .then((data) => setGeblokkeerdeDagen(data.map((d) => d.datum.slice(0, 10))))
      .catch(() => setGeblokkeerdeDagen([]))
  }, [])

  const heeftVeldfout = [
    nietLeeg(form.klantNaam),
    geldigeEmail(form.email),
    geldigTelefoonnummer(form.telefoon),
    nietLeeg(form.straat),
    nietLeeg(form.huisnummer),
    geldigePostcode(form.postcode),
    nietLeeg(form.gemeente),
  ].some(Boolean)

  const uurtarief = richtprijsPerUur(form.verdieping)
  const totaal = form.datum ? berekenTotaal(form.verdieping, form.geschatteDuurUren, form.datum) : 0
  const tijdslot = form.startTijd ? tijdslotVan(form.startTijd, form.geschatteDuurUren) : null
  const heeftConflict = Boolean(
    tijdslot && bezet.some((b) => tijdslotenOverlappen(b, tijdslot)),
  )

  useEffect(() => {
    if (!form.datum) {
      setBezet([])
      return
    }
    let actief = true
    getBezetteTijdsloten(form.datum)
      .then((data) => actief && setBezet(data))
      .catch(() => actief && setBezet([]))
    return () => {
      actief = false
    }
  }, [form.datum])

  function set<K extends keyof FormState>(veld: K, waarde: FormState[K]) {
    setForm((f) => ({ ...f, [veld]: waarde }))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitPoging(true)
    if (heeftVeldfout) return
    if (!form.datum) {
      setFout('Kies eerst een datum.')
      return
    }
    if (!form.startTijd) {
      setFout('Kies nog een starttijd.')
      return
    }
    if (heeftConflict) {
      setFout('Dat tijdstip is al bezet. Kies een ander uur.')
      return
    }
    setBezig(true)
    setFout(null)
    try {
      const { startTijd, ...rest } = form
      const created = await createBooking({
        ...rest,
        tijdslot: tijdslotVan(startTijd, form.geschatteDuurUren),
        datum: `${form.datum}T00:00:00`,
      })
      setResultaat(created)
    } catch (err) {
      setFout(err instanceof ApiError ? err.message : 'Er ging iets mis. Probeer opnieuw.')
    } finally {
      setBezig(false)
    }
  }

  if (resultaat) {
    return (
      <section className="page section">
        <Seo
          titel="Boeking ontvangen: Easy2Move"
          beschrijving="Je ladderlift-aanvraag bij Easy2Move is ontvangen. We bevestigen zo snel mogelijk."
          pad="/boeken"
          noIndex
        />
        <div className="container success">
          <svg className="success__check" viewBox="0 0 52 52" aria-hidden="true">
            <circle cx="26" cy="26" r="24" fill="none" />
            <path fill="none" d="M14 27l8 8 16-16" />
          </svg>
          <h1>Boeking ontvangen</h1>
          <p className="success__ref">
            Referentie <strong>#{resultaat.id}</strong>
          </p>
          <p className="success__tekst">
            Bedankt, {resultaat.klantNaam.split(' ')[0]}. We hebben je aanvraag voor{' '}
            <strong>
              {new Date(resultaat.datum).toLocaleDateString('nl-BE', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </strong>{' '}
            ontvangen, tussen {resultaat.tijdslot}. Je hoort snel van ons.
          </p>
          <div className="success__actions">
            <button
              type="button"
              className="btn btn--solid"
              onClick={() => {
                setResultaat(null)
                setForm(LEEG)
              }}
            >
              Nieuwe boeking
            </button>
            <Link to="/" className="btn btn--ghost">
              Terug naar home
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page section">
      <Seo
        titel="Ladderlift boeken: Easy2Move Antwerpen"
        beschrijving="Reserveer je ladderlift online. Kies je datum, tijdstip en adres, wij bevestigen zo snel mogelijk."
        pad="/boeken"
      />
      <div className="container container--narrow">
        <Reveal>
          <p className="overline">Boeken</p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="section__title">Reserveer je ladderlift</h1>
        </Reveal>
        <Reveal delay={140}>
          <p className="page__lead">
            Kies een datum en tijdstip. We zijn 24 uur per dag bereikbaar en bevestigen je
            aanvraag zo snel mogelijk.
          </p>
        </Reveal>

        {fout && (
          <div className="banner banner--error" role="alert">
            {fout}
          </div>
        )}

        <Reveal delay={200}>
          <form className="form" onSubmit={onSubmit} noValidate>
            <fieldset>
              <legend>
                <span className="form__nr">01</span> Klantgegevens
              </legend>
              <div className="form__grid">
                <Veld
                  className="field--wide"
                  label="Naam *"
                  waarde={form.klantNaam}
                  onChange={(v) => set('klantNaam', v)}
                  validator={nietLeeg}
                  forceer={submitPoging}
                  placeholder="Voor- en achternaam"
                  autoComplete="name"
                />
                <Veld
                  label="E-mail *"
                  type="email"
                  waarde={form.email}
                  onChange={(v) => set('email', v)}
                  validator={geldigeEmail}
                  forceer={submitPoging}
                  placeholder="naam@voorbeeld.be"
                  autoComplete="email"
                />
                <Veld
                  label="Telefoon *"
                  type="tel"
                  waarde={form.telefoon}
                  onChange={(v) => set('telefoon', v)}
                  validator={geldigTelefoonnummer}
                  forceer={submitPoging}
                  placeholder="04xx xx xx xx"
                  autoComplete="tel"
                />
              </div>
            </fieldset>

            <fieldset>
              <legend>
                <span className="form__nr">02</span> Locatie
              </legend>
              <div className="form__grid">
                <Veld
                  className="field--groot"
                  label="Straat *"
                  waarde={form.straat}
                  onChange={(v) => set('straat', v)}
                  validator={nietLeeg}
                  forceer={submitPoging}
                  autoComplete="address-line1"
                />
                <Veld
                  className="field--klein"
                  label="Nr *"
                  waarde={form.huisnummer}
                  onChange={(v) => set('huisnummer', v)}
                  validator={nietLeeg}
                  forceer={submitPoging}
                />
                <Veld
                  className="field--klein"
                  label="Postcode *"
                  waarde={form.postcode}
                  onChange={(v) => set('postcode', v)}
                  validator={geldigePostcode}
                  forceer={submitPoging}
                  autoComplete="postal-code"
                  inputMode="numeric"
                />
                <Veld
                  className="field--groot"
                  label="Gemeente *"
                  waarde={form.gemeente}
                  onChange={(v) => set('gemeente', v)}
                  validator={nietLeeg}
                  forceer={submitPoging}
                  autoComplete="address-level2"
                />
              </div>

              <div className="veld-blok">
                <span className="veld-blok__label">Verdieping *</span>
                <div className="stepper">
                  <button
                    type="button"
                    aria-label="Verdieping lager"
                    disabled={form.verdieping <= 0}
                    onClick={() => set('verdieping', form.verdieping - 1)}
                  >
                    −
                  </button>
                  <span className="stepper__waarde">
                    {form.verdieping === 0 ? 'Gelijkvloers' : `${form.verdieping}e verdieping`}
                  </span>
                  <button
                    type="button"
                    aria-label="Verdieping hoger"
                    disabled={form.verdieping >= MAX_VERDIEPING}
                    onClick={() => set('verdieping', form.verdieping + 1)}
                  >
                    +
                  </button>
                </div>
                <p className="prijs-hint">
                  Richtprijs <strong>€{uurtarief}/uur</strong>, inclusief btw
                </p>
                <p className="veld-blok__note">
                  Deze tarieven gelden voor Klein-Antwerpen. Buiten die zone rekenen we een
                  kleine verplaatsingskost aan.
                </p>
              </div>
            </fieldset>

            <fieldset>
              <legend>
                <span className="form__nr">03</span> Planning
              </legend>

              <div className="veld-blok">
                <span className="veld-blok__label">Datum *</span>
                <Kalender
                  value={form.datum}
                  onChange={(iso) => set('datum', iso)}
                  geblokkeerdeDagen={geblokkeerdeDagen}
                />
                {form.datum && (
                  <p className="veld-blok__gekozen">
                    ✓{' '}
                    {new Date(form.datum).toLocaleDateString('nl-BE', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                    {isZondag(form.datum) && ' (zondagtoeslag van 20% van toepassing)'}
                  </p>
                )}
              </div>

              <div className="form__grid">
                <div className="veld-blok field field--groot">
                  <span className="veld-blok__label">Starttijd *</span>
                  <TijdKiezer
                    start={form.startTijd}
                    duurUren={form.geschatteDuurUren}
                    bezet={bezet}
                    onStartChange={(t) => set('startTijd', t)}
                  />
                  <p className="veld-blok__note">
                    We zijn dag en nacht bereikbaar, ook in het weekend.
                  </p>
                </div>

                <div className="veld-blok field field--klein">
                  <span className="veld-blok__label">Duur</span>
                  <Dropdown
                    waarde={String(form.geschatteDuurUren)}
                    opties={DUUR_OPTIES.map((uren) => ({ waarde: String(uren), label: `${uren} uur` }))}
                    onChange={(v) => set('geschatteDuurUren', Number(v))}
                  />
                  <p className="veld-blok__note">Een inschatting volstaat.</p>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend>
                <span className="form__nr">04</span> Extra
              </legend>
              <label className="field field--wide">
                <span>Opmerkingen</span>
                <textarea
                  rows={3}
                  value={form.opmerkingen}
                  onChange={(e) => set('opmerkingen', e.target.value)}
                  placeholder="Bijvoorbeeld een smalle straat, waar je wilt parkeren, of grote meubels."
                />
              </label>
            </fieldset>

            {form.datum && form.geschatteDuurUren > 0 && (
              <div className="totaal-kaart">
                <span className="totaal-kaart__label">Geschat totaalbedrag</span>
                <span className="totaal-kaart__bedrag">€{totaal}</span>
                <span className="totaal-kaart__note">
                  Richtprijs, geen vaste offerte. We bevestigen het exacte bedrag telefonisch.
                  Betaling cash of Bancontact, na het werk.
                </span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn--solid btn--full"
              disabled={bezig || heeftConflict}
            >
              {bezig ? 'Versturen…' : 'Boeking aanvragen'}
              {!bezig && <span className="btn__arrow">→</span>}
            </button>
            <p className="form__note">* verplichte velden</p>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
