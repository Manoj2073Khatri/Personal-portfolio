# Portfolio site + CMS admin

Next.js 16 app that renders the public portfolio from the CMS API (`../backend`) and hosts the admin dashboard at `/admin`.

```bash
cp .env.example .env.local   # CMS_API_URL, INTERNAL_API_KEY, NEXT_PUBLIC_SITE_URL
npm install
npm run dev                  # http://localhost:3000 (API must run on :4000)
```

Checks: `npm run lint && npm run typecheck && npm test && npm run build`.

Documentation starts at [CLAUDE.md](CLAUDE.md) → [docs/](docs/).
