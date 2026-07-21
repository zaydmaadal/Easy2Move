import { useEffect } from 'react'

type SeoProps = {
  titel: string
  beschrijving: string
  pad: string
  noIndex?: boolean
}

const SITE = 'https://easy2move.be'

// Zet per pagina een eigen title/description/canonical. Simpele
// useEffect-aanpak (geen extra dependency zoals react-helmet nodig
// voor een site van deze omvang).
export default function Seo({ titel, beschrijving, pad, noIndex = false }: SeoProps) {
  useEffect(() => {
    document.title = titel

    const zetMeta = (naam: string, inhoud: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${naam}"]` : `meta[name="${naam}"]`
      let tag = document.querySelector<HTMLMetaElement>(selector)
      if (!tag) {
        tag = document.createElement('meta')
        if (isProperty) tag.setAttribute('property', naam)
        else tag.setAttribute('name', naam)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', inhoud)
    }

    zetMeta('description', beschrijving)
    zetMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow')
    zetMeta('og:title', titel, true)
    zetMeta('og:description', beschrijving, true)
    zetMeta('og:url', `${SITE}${pad}`, true)

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', `${SITE}${pad}`)
  }, [titel, beschrijving, pad])

  return null
}
