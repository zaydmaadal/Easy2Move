# Easy2Move frontend: portfolio-demo (branch `portfolio-demo`)

Deze branch is de demo die vanuit het portfolio gelinkt wordt. Verschillen met `main`:

- **Geen backend**: `src/api/demoServer.ts` bootst de .NET-API na (zelfde endpoints, validatie, 401/409/429) en bewaart alles per bezoeker in `localStorage`. Admin: elk niet-leeg wachtwoord werkt.
- **Placeholder-contactgegevens** in `src/lib/contact.ts` (telefoon, e-mail, btw).
- **Niet vindbaar op Google**: `noindex` in `index.html` en `Seo.tsx`, `X-Robots-Tag` in `vercel.json`, geen sitemap/llms.txt/JSON-LD.
- `src/lib/demo.ts`: demo-modus staat standaard aan. Een build met `VITE_DEMO_MODE=false` gebruikt weer de echte API (`VITE_API_BASE_URL`).

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
