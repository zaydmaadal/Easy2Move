import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollProgress from './components/ScrollProgress'
import Home from './pages/Home'
import Boeken from './pages/Boeken'

// Enkel Admin lazy: die pagina is nooit het directe, publieke landingspunt
// (staat achter een wachtwoord en op noindex), dus haar formulieren/
// dropdowns hoeven pas geladen te worden wanneer iemand er echt naartoe
// navigeert. Home en Boeken blijven eager - lazy-loaden van de pagina die
// net rechtstreeks geopend wordt, betekent dat de Suspense-fallback (leeg)
// heel even zichtbaar is en dan de volledige pagina "inspringt": dat gaf
// een echte layout shift (CLS 0 -> 0.32) op precies die twee URL's.
const Admin = lazy(() => import('./pages/Admin'))

export default function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <ScrollProgress />
      <Header />
      <main>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/boeken" element={<Boeken />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
