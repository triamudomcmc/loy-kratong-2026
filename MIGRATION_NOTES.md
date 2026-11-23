# Migration notes: Next 11 → Next 16 (App Router), Tailwind 2 → 4

## Stack
| | Before | After |
|---|---|---|
| Framework | Next 11.1 (Pages Router) | Next 16.4 (App Router, Turbopack) |
| React | 17 | 19 |
| Styling | Tailwind 2.2 JIT + SCSS modules | Tailwind 4 only (`src/app/globals.css`) |
| Animation | framer-motion 5 | motion 14 (`motion/react`) |
| API | next-bridge 0.0.1 (`/api/build`, `/api/filter`, `/api/send`, `/api/scene`) | Server Actions in `src/server/actions.ts` |
| Share image | chrome-aws-lambda + puppeteer-core 11 | @sparticuz/chromium + puppeteer-core 25 (`src/app/api/capture/route.ts`) |
| Firebase | firebase-admin 10 | firebase-admin 14 |
| Package manager | npm + yarn lockfiles | yarn 1 only |

## Where things moved
- `pages/_app.tsx` (music, mute toggle) → `src/components/ClientShell`, route loading spinner → `src/app/loading.tsx`
- `pages/_document.tsx` + `components/Meta` → `metadata`/`viewport` in `src/app/layout.tsx`; fonts via `next/font`; GA via `@next/third-parties`
- `getServerSideProps` Firestore reads → `src/server/queries.ts`
- Shared kratong types → `src/types/kratong.ts` (`@types-app/kratong`)
- SCSS kratong modules → `src/components/kratong-classes.ts`

## Intentional behaviour changes
- `AnimatePresence` now wraps the conditional (it was inside it before), so popup/placeholder **exit animations now play** on `/loykratong`.
- `/principal` and `/CUPSAA`: submission retries are capped at 3 with backoff (was unbounded) and guarded against double-submit.
- `/create`: non-profanity server errors show a generic message (previously crashed reading `data.location`).
- `/principal`/`/CUPSAA` without `id` redirect on the server instead of the client.
- `/api/capture`: `data` is URL-encoded; the browser is always closed; 400 on missing `data`.
- Filter actions report `access_denied` (was `access denied`); the UI never read this string.
- Dead code removed: `loadData`, `loadScene` (`/api/scene`), unused deps (`aes256`, `html-to-image`, `uuid`, `dotenv`, babel presets).

## Tailwind notes
- The old config emitted the custom `nak` (530px) breakpoint **after** `sm`/`md`, so `nak:` overrode `sm:` above 640px. v4 sorts breakpoints by width, so the `sm:` classes that `nak:` was overriding were removed (`LoyKratong/loykratong.tsx`, `LoyKratong/kratonglane.tsx`). Verified against the old app's generated CSS.
- Tailwind 2.2 **JIT** applied `transform`/`filter` per utility, so `-translate-*`, `brightness-*`, `blur-*`, `backdrop-blur-*` were active and are kept (`blur-sm` → `blur-xs`, `backdrop-blur-sm` → `backdrop-blur-xs` to keep 4px).
- SCSS `xl` mixin was 1300px → written as `min-[1300px]:`.
- Buttons get `cursor: pointer` back via a base rule in `globals.css`.

## Environment
See `.env.example`: `FCERT_PROJECT_ID`, `FCERT_PRIVATE_KEY`, `FCERT_CLIENT_EMAIL`, `PASSWORD`, optional `CHROME_PATH` (local dev Chrome for `/api/capture`).

## Deploy notes
- firebase-admin 14 declares Node ≥ 24.12 (installed locally with `--ignore-engines` on Node 22). Use Node 24 on Vercel.
- `/api/capture` runs on the Node runtime with `maxDuration = 60`; @sparticuz/chromium is Linux-only (works on Vercel, not in `next start` on macOS — use `next dev`, which uses local Chrome).
- TypeScript is pinned to 6.0 until typescript-eslint supports 7.

## Not yet verified at runtime
Pages that read Firestore (`/create?id=`, `/loykratong`, `/principal`, `/CUPSAA`, `/filter`) and the profanity check need real Firebase credentials to test end-to-end.
