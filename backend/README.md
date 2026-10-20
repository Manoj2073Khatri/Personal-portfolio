# Portfolio CMS API

NestJS REST API (`/api/v1`) with Prisma/PostgreSQL and S3 media for the portfolio site in `../frontend`.

```bash
docker compose up -d                 # local Postgres on :5433
cp .env.example .env.local           # fill in secrets
npm install
npm run db:migrate:dev && npm run db:seed
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='long passphrase' npm run admin:create
npm run start:dev                    # http://localhost:4000/api/docs
```

Tests: `npm test` (unit), `npm run test:e2e` (needs the `portfolio_test` database).

Documentation starts at [CLAUDE.md](CLAUDE.md) → [docs/](docs/).
