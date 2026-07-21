import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Logo from './Logo'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="container header__inner">
        <Link to="/" className="header__brand" aria-label="Easy2Move, naar de homepage">
          <Logo />
        </Link>
        <nav className="header__nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          <Link to="/boeken" className="btn btn--solid btn--small">
            Boek nu
          </Link>
        </nav>
      </div>
    </header>
  )
}
