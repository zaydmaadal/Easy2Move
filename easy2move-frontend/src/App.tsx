import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollProgress from './components/ScrollProgress'

// Elke pagina in haar eigen bestand (code-splitting): een bezoeker op "/"
// hoeft dan nooit Admin's formulieren/dropdowns te downloaden, en
// omgekeerd. Dat is precies wat PageSpeed als "ongebruikte JavaScript"
// aanmerkte.
const Home = lazy(() => import('./pages/Home'))
const Boeken = lazy(() => import('./pages/Boeken'))
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
        <Suspense fallback={<div className="pagina-laden" aria-hidden="true" />}>
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
