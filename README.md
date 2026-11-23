# Loy Kratong Online

Build a kratong, make a wish, and float it down the river with everyone else's.

## Stack
Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Motion · Firebase Admin (Firestore) · Puppeteer + @sparticuz/chromium for share images.

## Development
```bash
yarn install
cp .env.example .env.local   # fill in Firebase service account + admin password
yarn dev
```

Scripts: `yarn dev`, `yarn build`, `yarn start`, `yarn lint`, `yarn typecheck`.

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
