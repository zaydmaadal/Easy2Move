import { Link } from 'react-router-dom'
import Logo from './Logo'

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__mark" aria-hidden="true">
        EASY2MOVE
      </div>

      <div className="container footer__grid">
        <div className="footer__kol footer__kol--merk">
          <Logo />
          <p className="footer__tag">
            Ladderlift service &amp; verhuizing in Antwerpen en omstreken. 24/24 beschikbaar,
            sinds 2007.
          </p>
          <div className="footer__acties">
            <a href="tel:+32485690909" className="btn btn--gold btn--small">
              Bel ons
            </a>
            <a
              href="https://www.tiktok.com/@easy2move7"
              target="_blank"
              rel="noreferrer"
              className="btn btn--ghost-light btn--small footer__tiktok"
            >
              <TikTokIcon /> @Easy2move
            </a>
          </div>
        </div>

        <div className="footer__kol">
          <h3>Contact</h3>
          <a href="tel:+32485690909">0485 69 09 09</a>
          <a href="mailto:info@easy2move.be">info@easy2move.be</a>
          <a href="https://www.tiktok.com/@easy2move7" target="_blank" rel="noreferrer">
            TikTok: @Easy2move
          </a>
        </div>

        <div className="footer__kol">
          <h3>Site</h3>
          <Link to="/">Home</Link>
          <Link to="/boeken">Boeken</Link>
        </div>
      </div>

      <div className="container footer__bar">
        <span>© {new Date().getFullYear()} Easy2Move, ladderlift service en verhuizing</span>
        <span>BTW BE 1014.87.44.75</span>
      </div>
    </footer>
  )
}
