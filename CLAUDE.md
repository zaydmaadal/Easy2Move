# Easy2Move Project — Context voor Claude

## Wat ik bouw
Een boekingssysteem voor Easy2Move (ladderlift verhuur in België).
Klanten boeken een datum en tijdslot, admin beheert boekingen.

## Waarom ik dit bouw
Voorbereiding op mijn traineeship bij Mediahuis (start 21/09/2026).
Ik leer de .NET architectuur die Mediahuis gebruikt in hun TPS team.

## Referentieproject
Mediahuis Youth Lab case project (Sportfeed) — zelfde architectuur.
Dat project gebruikte BFF patroon, IArticleFeedService interface,
mock fallback, Registrations.cs per laag, Refit voor HTTP clients.
Volg dezelfde patronen en naamgevingen.

## Architectuur
Exact de Mediahuis lagenstructuur:
- Easy2Move.API        → Controllers, Swagger, Program.cs
- Easy2Move.Application → Services, business logica, Registrations.cs
- Easy2Move.Contracts   → Interfaces, DTOs (geen dependencies)

Afhankelijkheidsrichting: API → Application → Contracts

## Wat al gebouwd is

### Easy2Move.Contracts/Models/BookingDto.cs ✅
Bevat: Id, KlantNaam, Email, Telefoon, Straat, Huisnummer,
Postcode, Gemeente, Verdieping, Datum, Tijdslot,
GeschatteDuurUren, Opmerkingen, Status, AangemaaktOp

### Easy2Move.Contracts/Interfaces/IBookingService.cs ✅
Bevat: GetAllBookings, GetBookingById, CreateBooking,
UpdateBooking (alle velden), DeleteBooking

### Easy2Move.Application/Services/BookingService.cs ✅
In-memory implementatie van IBookingService.
Gebruikt List<BookingDto> als tijdelijke opslag (nog geen database).
UpdateBooking bevat alle velden inclusief adresvelden.

### Easy2Move.Application/Registrations.cs ✅
Registreert IBookingService → BookingService als Scoped.
Gebruikt Microsoft.Extensions.DependencyInjection.Abstractions
(bewust Abstractions, niet de volledige DI package).

### Easy2Move.API/Controllers/BookingController.cs ✅
Endpoints: GET /api/bookings (admin), GET /api/bookings/{id} (admin),
GET /api/bookings/bezet?datum= (publiek, geen klantgegevens),
POST /api/bookings (publiek, forceert Status="Aangevraagd"),
POST /api/bookings/admin (admin, vrije status - voor telefonische
boekingen), PUT /api/bookings/{id} (admin), DELETE /api/bookings/{id}
(admin).
"Admin" = [AdminOnly]-attribuut (Easy2Move.API/Filters/AdminOnlyAttribute.cs)
dat de header "X-Admin-Key" vergelijkt met appsettings "AdminKey".
Sleutel staat in Easy2Move.API/appsettings.json (base config, dus geladen
ongeacht ASPNETCORE_ENVIRONMENT) — moet voor productie een echt geheim
worden (env var/user-secrets), niet in dit bestand blijven staan.
Dev-wachtwoord: easy2move-dev-2026.

### Easy2Move.Contracts/Models/BlockedDateDto.cs ✅
Geblokkeerde dag (Id, Datum, Reden) — voor vakantie/onbeschikbaarheid.
Bewust hele dagen, geen uurblokken. IBlockedDateService/BlockedDateService
volgen hetzelfde patroon als Booking. Endpoints in BlockedDateController:
GET /api/blocked-dates (publiek, geen PII), POST/DELETE (admin).
BookingService weigert (409) een boeking op een geblokkeerde dag,
zowel bij Create als Update.

### Easy2Move.Application/Exceptions/BookingConflictException.cs ✅
BookingService gooit deze als een nieuwe/bijgewerkte boeking overlapt
met een bestaande boeking op dezelfde dag (zelfde Datum, overlappend
Tijdslot) of op een geblokkeerde dag valt. Controller vangt 'm op en
geeft 409 Conflict terug.

### Easy2Move.API/Program.cs ✅
Bevat: AddControllers, AddSwaggerGen, RegisterApplication,
MapControllers, UseSwagger, UseSwaggerUI
Swagger bereikbaar op /swagger

### Easy2Move.Application/Data/BookingDbContext.cs ✅
DbContext met DbSet<BookingDto> Bookings.
Geregistreerd in Registrations.cs via AddDbContext + UseSqlite.
Connection string "BookingDb" staat in appsettings.json
(Data Source=easy2move.db). Migratie InitialCreate is uitgevoerd;
easy2move.db staat in Easy2Move.API/.

### easy2move-frontend/ ✅ (React + TypeScript + Vite)
Aparte map naast de backend-projecten. Zwart/wit design met goud
accent, Archivo (koppen, variabele breedte-as) + Space Grotesk
(body), scroll-animaties (IntersectionObserver reveals, marquee die
op scrollsnelheid/-richting reageert, scroll-progressbalk).
- src/types/booking.ts, blockedDate.ts — TS-spiegels van de DTO's
  (camelCase!)
- src/lib/prijzen.ts — tarief per verdieping + zondagstoeslag (20%)
- src/lib/tijd.ts — tijdslot-string bouwen/parsen + overlap-detectie
- src/lib/validatie.ts — Validator-functies (nietLeeg, geldigeEmail,
  geldigTelefoonnummer, geldigePostcode) voor live veldvalidatie
- src/api/client.ts — gedeelde fetch-helper (http, ApiError,
  admin-key in sessionStorage); bookings.ts en blockedDates.ts
  bouwen hierop verder
- src/components/Veld.tsx — tekstveld met live blur-validatie:
  rode/donkere rand + vinkje i.p.v. een foutbanner; forceer-prop
  toont alle fouten na een mislukte submit-poging
- src/components/Kalender.tsx — eigen maandkalender (datum kiezen),
  toont/blokkeert geblokkeerde dagen via geblokkeerdeDagen-prop
- src/components/TijdKiezer.tsx — exact tijdstip (native time-input,
  stap 30 min) i.p.v. vaste sloten, toont conflict met bezette tijden
- src/components/StatusMenu.tsx — eigen dropdown voor boekingsstatus,
  gerenderd via createPortal in <body> (fixed positie) zodat het menu
  nooit wordt afgeknipt door een scrollende ouder zoals de tabel
- src/components/Seo.tsx — title/description/canonical per pagina
- src/pages/Home.tsx — landing, hero met parallax-achtergrond, echte
  tarieven en praktische info uit easy2move.be, verborgen (sr-only)
  <h1> met zoekwoorden naast de visuele logo-lockup
- src/pages/Boeken.tsx — boekingsformulier: Kalender (incl.
  geblokkeerde dagen) + TijdKiezer, haalt /api/bookings/bezet op per
  gekozen datum om dubbele boekingen te tonen vóór het versturen,
  groot goud totaalbedrag (richtprijs, incl. zondagstoeslag) onderaan
- src/pages/Admin.tsx — wachtwoord-gate (admin-key, GEEN link vanuit
  het publieke menu — enkel bereikbaar via directe URL), tabs
  Aankomend/Geschiedenis/Alle + zoekbalk, telefonische boeking
  toevoegen (POST /admin), "Beschikbaarheid"-paneel om dagen te
  (de)blokkeren, boeking volledig bewerken, belknop per rij,
  StatusMenu i.p.v. native select
- public/robots.txt, public/sitemap.xml — /admin is disallowed
- Vite dev-proxy: /api → http://localhost:5269 (geen CORS nodig)

## Huidige status
Backend en frontend volledig gekoppeld en end-to-end getest
(curl + browser). Admin-endpoints zijn beveiligd met een
gedeelde sleutel (X-Admin-Key), dubbele boekingen worden zowel
client- als server-side geweigerd (409 Conflict bij overlap of bij
een geblokkeerde dag). Boeking #1 (Jan Peeters) staat nog in de
database, huidige status Geannuleerd (door eigen tests van de
gebruiker).

## Zo start je alles (2 terminals)
1. cd Easy2Move.API && dotnet run        → API op http://localhost:5269
2. cd easy2move-frontend && npm run dev  → site op http://localhost:5173
Admin-wachtwoord in dev: zie "AdminKey" in
Easy2Move.API/appsettings.Development.json.

## Volgende stappen (in volgorde)
1. Visuele review in de browser (marquee, hero-parallax, kalender
   op mobiel, admin-flow)
2. Validatie verbeteren (backend DataAnnotations + frontend)
3. Status als enum ipv string overwegen
4. Productie-setup: AdminKey via environment variable/user-secrets
   i.p.v. appsettings, CORS of static serving vanuit de API,
   echte domeinnaam invullen in index.html/Seo.tsx/sitemap.xml

## Tech stack
- Backend: .NET 10, C#, Entity Framework Core, SQLite (dev)
- Frontend: React + TypeScript + Vite (nog niet gestart)
- Documentatie: Swagger via Swashbuckle

## Mijn achtergrond
- Sterk in React, JavaScript, TypeScript, PHP, Node.js(Geen sequelize of prisma)
- Nieuw aan C# en .NET — leer het nu actief
- Vergelijk alles met JavaScript als het helpt
- Leg nieuwe concepten altijd uit voor je code schrijft

## Hoe ik wil werken
- Leg eerst uit WAT iets is en WAAROM voor je code schrijft
- Vergelijk met JavaScript/React als dat helpt
- Stap voor stap, niet alles tegelijk
- Zeg het als ik iets fout doe of beter kan doen
- Volg altijd de Mediahuis architectuurpatronen

## Belangrijke lessen uit dit project
- .NET 10 heeft geen Swagger UI standaard meer —
  Swashbuckle.AspNetCore package is nodig
- Class libraries hebben geen impliciete DI packages —
  Microsoft.Extensions.DependencyInjection.Abstractions
  expliciet toevoegen aan csproj
- Minimal API vs Controllers: dit project gebruikt Controllers
  (MVC stijl) zoals Mediahuis, niet minimal API
- Altijd server stoppen (Ctrl+C) voor dotnet build