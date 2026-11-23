# Loy Kratong Online

Build a kratong, make a wish, and float it down the river with everyone else's.

## Stack
Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Motion · Postgres + Prisma · Puppeteer + @sparticuz/chromium for share images.

## Development
```bash
yarn install
cp .env.example .env          # set DATABASE_URL (default matches docker-compose) and PASSWORD
docker compose up -d          # local Postgres 17 on host port 5433
yarn db:migrate               # apply migrations (also generates the Prisma client)
yarn db:seed                  # load data/blocklist.txt + data/dictionary.txt (see data/README.md)
yarn dev
```

Scripts: `yarn dev`, `yarn build`, `yarn start`, `yarn lint`, `yarn typecheck`, `yarn db:generate`, `yarn db:migrate`, `yarn db:deploy`, `yarn db:seed`, `yarn db:studio`.
`SEED_SAMPLE=1 yarn db:seed` also inserts a sample invite (`/principal?id=sample-principal`) and a few displayed kratongs.
Invite records for `/create?id=`, `/principal?id=`, `/CUPSAA?id=` live in the `SpecialKratong` table; add them with `yarn db:studio` or SQL.

## Routes
| Route | Purpose |
|---|---|
| `/` | Intro story |
| `/create` | Kratong builder |
| `/loykratong` | River scene |
| `/principal?id=`, `/CUPSAA?id=` | Special kratongs |
| `/filter` | Moderation (password) |
| `/capture`, `/api/capture` | 1080×1920 share image |

See `MIGRATION_NOTES.md` for the 2021 → 2026 upgrade details.
