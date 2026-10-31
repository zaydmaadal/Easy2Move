import { Link } from 'react-router-dom'
import Logo from './Logo'
import { CONTACT } from '../lib/contact'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__mark" aria-hidden="true">
        LIFTUP
      </div>

      <div className="container footer__grid">
        <div className="footer__kol footer__kol--merk">
          <Logo />
          <p className="footer__tag">
            Ladderlift verhuur en verhuishulp in heel Vlaanderen. 24/24 beschikbaar.
          </p>
          <div className="footer__acties">
            <a href={CONTACT.telefoonHref} className="btn btn--gold btn--small">
              Bel ons
            </a>
          </div>
        </div>

        <div className="footer__kol">
          <h2>Contact</h2>
          <a href={CONTACT.telefoonHref}>{CONTACT.telefoon}</a>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </div>

        <div className="footer__kol">
          <h2>Site</h2>
          <Link to="/">Home</Link>
          <Link to="/boeken">Boeken</Link>
        </div>
      </div>

      <div className="container footer__bar">
        <span>© {new Date().getFullYear()} LiftUp, ladderlift verhuur</span>
        <span>BTW {CONTACT.btw}</span>
        <span className="footer__credit">
          Website door{' '}
          <a href="https://www.zayd-maadal.site/" target="_blank" rel="noreferrer">
            Zayd Maadal
          </a>
        </span>
      </div>
    </footer>
  )
}
