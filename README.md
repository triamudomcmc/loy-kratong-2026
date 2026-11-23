# Loy Kratong Online

Build a kratong, make a wish, and float it down the river with everyone else's.

## Stack
Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Motion · Postgres + Prisma · Puppeteer + @sparticuz/chromium for share images.

## Development
```bash
yarn install
cp .env.example .env          # set DATABASE_URL (default matches docker-compose) and ADMIN_PASSWORD
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
| `/admin` | Moderation dashboard (password; `/filter` redirects here) |
| `/capture`, `/api/capture` | 1080×1920 share image |

See `MIGRATION_NOTES.md` for the 2021 → 2026 upgrade details.

## Deploy (Docker / Dokploy)
The repo ships a production `Dockerfile` (Next.js standalone server + Chromium for share images).

- **Build type:** Dockerfile (port `3000`).
- **Environment variables:**
  - `DATABASE_URL`: the Postgres connection string (required)
  - `ADMIN_PASSWORD`: the `/admin` moderation password (login is disabled while unset; the legacy `PASSWORD` is still accepted as a fallback)
  - `ADMIN_SESSION_SECRET` (optional): secret for signing the 12h admin session cookie. Defaults to a key derived from the password
  - `CAPTURE_ORIGIN` (optional): where `/api/capture` loads `/capture` from. Defaults to the container itself.
  - `SKIP_MIGRATIONS=1` (optional): skip running migrations on start-up.
- **On start-up** the container runs `prisma migrate deploy`, then starts the server.
- **Seed the blocklist** once, from a machine that has the word lists: `DATABASE_URL=… yarn db:seed`.
