// Demo-modus: de site praat niet met de .NET-API maar met een nagebootste
// backend in de browser (zie api/demoServer.ts). Standaard AAN op deze
// branch, zodat een oude VITE_API_BASE_URL op de host de demo niet per
// ongeluk terug naar de echte API stuurt. Alleen een build met
// VITE_DEMO_MODE=false gebruikt de echte backend.
export const DEMO = import.meta.env.VITE_DEMO_MODE !== 'false'
