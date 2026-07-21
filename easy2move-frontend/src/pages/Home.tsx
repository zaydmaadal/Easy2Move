import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import Marquee from '../components/Marquee'
import Reveal from '../components/Reveal'
import Seo from '../components/Seo'

const STAPPEN = [
  {
    nr: '01',
    titel: 'Boek online',
    tekst:
      'Kies je datum en tijdslot, vul je adres en verdieping in. In twee minuten geregeld, zonder telefoontjes.',
  },
  {
    nr: '02',
    titel: 'Wij bevestigen',
    tekst:
      'Je aanvraag komt meteen bij onze planning terecht. Je hoort snel van ons met een bevestiging van je tijdslot.',
  },
  {
    nr: '03',
    titel: 'Ladderlift ter plaatse',
    tekst:
      'Op de afgesproken dag staat de lift klaar. Meubels en dozen gaan veilig langs de gevel, niet langs de trap.',
  },
]

const TARIEVEN = [
  { label: '1ste tot 5de verdieping', uur: 80, half: 40 },
  { label: '6de tot 7de verdieping', uur: 90, half: 45 },
  { label: '8ste verdieping', uur: 100, half: 50 },
  { label: '9de verdieping', uur: 130, half: 65 },
  { label: '10de verdieping', uur: 150, half: 75 },
]

const TROEVEN = [
  {
    titel: '24/24 beschikbaar',
    tekst: 'Dag en nacht bereikbaar, ook in het weekend. Verhuizen op jouw moment.',
    icoon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    titel: 'Sinds 2007',
    tekst: 'Bijna twintig jaar ervaring met ladderliften in Antwerpen en omstreken.',
    icoon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l2.6 5.3 5.9.8-4.3 4.1 1 5.8L12 16.3 6.8 19l1-5.8-4.3-4.1 5.9-.8L12 3z" />
      </svg>
    ),
  },
  {
    titel: 'Tot 400 kg',
    tekst: 'Stevig platform van 2,5 op 1,5 meter, ook geschikt voor zware en grote stukken.',
    icoon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 8h16v12H4z" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </svg>
    ),
  },
  {
    titel: 'Tot de 10de verdieping',
    tekst: 'Vaste prijzen per verdieping, altijd inclusief btw.',
    icoon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M8 21V3M16 21V3M8 7h8M8 12h8M8 17h8" />
      </svg>
    ),
  },
]

const PRAKTISCH = [
  {
    titel: 'Werkgebied',
    tekst:
      'Onze tarieven gelden voor Klein-Antwerpen: Antwerpen en dertien randgemeenten. Daarbuiten rekenen we een kleine verplaatsingskost aan.',
  },
  {
    titel: 'Parkeervergunning',
    tekst:
      'Wil je de lift op de openbare weg plaatsen? Dan is schriftelijke toelating van de politie verplicht. Zonder die toelating riskeer je een boete tot €250. Wij vragen ze voor je aan vanaf €100.',
  },
  {
    titel: 'Betaling',
    tekst:
      'Cash of Bancontact, gewoon na het werk. Alle prijzen zijn inclusief btw en per adres. Op zondag geldt een toeslag van 20%.',
  },
]

function BelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  )
}

export default function Home() {
  const bgRef = useRef<HTMLDivElement>(null)

  // Muis-parallax: achtergrondvormen schuiven subtiel mee met de cursor.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bg = bgRef.current
    if (!bg) return
    const vormen = bg.querySelectorAll<HTMLElement>('[data-depth]')

    const onMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5
      const y = e.clientY / window.innerHeight - 0.5
      vormen.forEach((vorm) => {
        const diepte = Number(vorm.dataset.depth)
        vorm.style.transform = `translate(${x * diepte * 22}px, ${y * diepte * 22}px)`
      })
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <>
      <Seo
        titel="Easy2Move: ladderlift verhuur en verhuisservice in Antwerpen"
        beschrijving="Ladderlift huren in Antwerpen en omstreken. Meubels en dozen veilig langs de gevel, 24 uur per dag bereikbaar. Boek online in twee minuten."
        pad="/"
      />
      <section className="hero">
        <div ref={bgRef} className="hero__bg" aria-hidden="true">
          <span className="hero__blob" />
          <span className="hero__vorm hero__vorm--twee">
            <span className="hero__twee" data-depth="1.4">
              2
            </span>
          </span>
          <span className="hero__vorm hero__vorm--dot">
            <span className="hero__dot" data-depth="3" />
          </span>
          <span className="hero__vorm hero__vorm--ring">
            <span className="hero__ring" data-depth="2.4" />
          </span>
        </div>

        <div className="container hero__inner">
          <p className="hero__kicker fade-item">Sinds 2007, Antwerpen en omstreken</p>
          <h1 className="sr-only">
            Easy2Move: ladderlift verhuur en verhuisservice in Antwerpen, 24 uur per dag
            bereikbaar
          </h1>
          <div className="fade-item fade-item--2" aria-hidden="true">
            <Logo lockup className="hero__lockup" />
          </div>
          <p className="hero__lead fade-item fade-item--3">
            Jouw verhuis <mark>langs de gevel</mark>, snel en veilig, zonder gesleur op de trap.
          </p>
          <div className="hero__cta fade-item fade-item--4">
            <Link to="/boeken" className="btn btn--solid">
              Boek een ladderlift <span className="btn__arrow">→</span>
            </Link>
            <a href="tel:+32485690909" className="btn btn--ghost btn--icoon">
              <BelIcon /> Bel ons
            </a>
          </div>
          <div className="hero__badges fade-item fade-item--5">
            <span className="badge">24/24 beschikbaar</span>
            <span className="badge">Tot 400 kg</span>
            <span className="badge">Incl. btw</span>
          </div>
        </div>
      </section>

      <Marquee />

      <section className="section">
        <div className="container">
          <Reveal>
            <p className="overline">Zo werkt het</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="section__title">Van aanvraag tot verhuisdag</h2>
          </Reveal>
          <div className="steps">
            {STAPPEN.map((stap, i) => (
              <Reveal key={stap.nr} delay={i * 120}>
                <article className="step">
                  <span className="step__nr">{stap.nr}</span>
                  <h3>{stap.titel}</h3>
                  <p>{stap.tekst}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <Reveal>
            <p className="overline">Tarieven</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="section__title">Vaste prijzen per verdieping</h2>
          </Reveal>
          <Reveal delay={140}>
            <div className="tarieven">
              {TARIEVEN.map((tarief) => (
                <div key={tarief.label} className="tarief">
                  <span className="tarief__naam">{tarief.label}</span>
                  <span className="tarief__prijs">
                    €{tarief.uur}
                    <small>/uur</small>
                  </span>
                  <span className="tarief__half">+ €{tarief.half} per extra half uur</span>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={200}>
            <p className="tarieven__note">
              Alle prijzen inclusief btw, per adres. Betaling cash of Bancontact na het werk. Op
              zondag geldt een toeslag van 20%.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <Link to="/boeken" className="btn btn--solid">
              Boek nu <span className="btn__arrow">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <p className="overline">Waarom Easy2Move</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="section__title">Zwaar werk, licht gemaakt</h2>
          </Reveal>
          <div className="troeven">
            {TROEVEN.map((troef, i) => (
              <Reveal key={troef.titel} delay={i * 100}>
                <article className="troef">
                  <span className="troef__icoon">{troef.icoon}</span>
                  <h3>{troef.titel}</h3>
                  <p>{troef.tekst}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--soft">
        <div className="container">
          <Reveal>
            <p className="overline">Goed om te weten</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="section__title">Praktische informatie</h2>
          </Reveal>
          <div className="info-kaarten">
            {PRAKTISCH.map((info, i) => (
              <Reveal key={info.titel} delay={i * 120}>
                <article className="info-kaart">
                  <h3>{info.titel}</h3>
                  <p>{info.tekst}</p>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal delay={220}>
            <p className="info-link">
              Volledige voorwaarden op{' '}
              <a href="https://easy2move.be/praktische-informatie/" target="_blank" rel="noreferrer">
                easy2move.be
              </a>
            </p>
          </Reveal>
        </div>
      </section>

      <section className="cta">
        <div className="container cta__inner">
          <Reveal>
            <h2>
              Klaar om te <span className="cta__accent">verhuizen?</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p>Vraag vandaag nog je ladderlift aan en verhuis zonder zorgen.</p>
          </Reveal>
          <Reveal delay={200}>
            <div className="cta__actions">
              <Link to="/boeken" className="btn btn--gold">
                Boek nu <span className="btn__arrow">→</span>
              </Link>
              <a href="tel:+32485690909" className="btn btn--ghost-light btn--icoon">
                <BelIcon /> Bel ons
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
