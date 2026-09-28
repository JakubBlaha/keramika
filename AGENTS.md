# AGENTS.md

E-shop for the ceramicist Lada Bartoníková. SvelteKit (Svelte 5 runes) +
Tailwind v4 + Paraglide i18n. The whole catalog lives in Firebase (Firestore +
Storage): the public site reads it per request, the admin area and catalog
write API edit it. There are no built-in products.

## Commands

Package manager is **pnpm** (see `pnpm-workspace.yaml`).

- `pnpm check` — `svelte-kit sync` + `svelte-check` (types + Svelte). Primary way to verify changes.
- `pnpm lint` — `prettier --check .` then `eslint .`
- `pnpm format` — `prettier --write .`
- `pnpm build` — production build (prerenders the static content pages; needs no database).
- `pnpm test` / `pnpm test:e2e` — Playwright e2e inside a fresh, throwaway Firebase emulator suite (`scripts/with-emulators.mjs`; fails if `pnpm emulators` is running). Builds and serves the preview itself unless `PLAYWRIGHT_BASE_URL` is set. Extra args go to Playwright (`pnpm test tests/e2e/admin.spec.ts`).
- `pnpm emulators` — local Firebase emulators (Auth, Firestore, Storage) for development; data persists in `.emulator-data/`. Needs Java 21+ and a global `firebase-tools`.
- `pnpm seed` — seed the emulators with the catalog in `scripts/seed-data/` (copy + photos) via the dev server's API, and provision the local admin (`scripts/seed.mjs`). `pnpm test` seeds automatically (`tests/global-setup.ts`). `node scripts/seed.mjs --production --api https://<site>` seeds the real project through the deployed API (see `docs/deployment.md`).
- `pnpm grant-admin <email> [--revoke] [--production]` — grant/revoke the `admin` custom claim (emulator by default).

**Never run `pnpm dev`, `pnpm preview`, or any serving command.** The user runs
the dev server (`http://localhost:5173`) separately. To verify, use `pnpm check`,
`pnpm lint`, `pnpm build` only. (`.verorules/instructions.md`, REQ-BUILD-002.)

## Requirements are the source of truth

`docs/requirements/` holds atomic, testable requirements (`REQ-<AREA>-<NNN>`)
with a coverage table in `docs/requirements/README.md`. Code comments and test
titles reference these IDs (e.g. `REQ-API-002`) — grep the ID to find related
code/tests. Read the relevant area file before changing behavior. Authoring new
requirements uses the `requirements-authoring` skill in `.verorules/skills/`.

## Architecture

Two distinct worlds sharing one route tree:

1. **Public site** — catalog pages (`/`, `/produkty`, `/produkty/[category]`,
   `/produkt/[slug]`, `/galerie`, `/cart`, `/checkout`) are server-rendered per
   request: each `+page.server.ts` calls `loadCatalog()`
   (`src/lib/server/publicCatalog.ts`), which reads Firestore via the Admin SDK
   and localizes it. Only the static content pages (`/kontakt`, `/o-nas`,
   `/obchodni-podminky`) are prerendered.
2. **Admin + write API** — Firebase-backed, dynamic. Admin UI under
   `/admin/*` (`prerender = false`, `ssr = false` — client-only). Write API under
   `/api/*` (`prerender = false`), the single trusted write path.

### Two catalog shapes (do not confuse them)

- `src/lib/catalog-model.ts` — the **stored** (Firestore) types. Localized copy
  is a `{ cs, en }` map. Includes payload validators
  (`validateCategory/Product/Instance`) returning `ValidationError[]`.
- `src/lib/catalog.ts` — the **public view** types (copy already localized to
  plain strings, serializable through `load`) plus pure helpers
  (`getProduct`, `coverImage`, `getRelated`, ...). It holds no data.

Product and category copy is data, not Paraglide messages: never add product
keys to `messages/*.json`. Categories and products are shown sorted by
localized name (there is no display-order field).

Domain model: a **Product** is a blueprint (e.g. "Angel"); each physical piece is
a unique **Instance** that exists exactly once (available or sold). Availability =
count of available instances. Firestore layout: `categories/{slug}`,
`products/{slug}`, `products/{slug}/instances/{instanceId}`.

### Firebase access

- **Client** (`src/lib/firebase.ts`): `getFirebase()` lazily inits and is
  **browser-only** — throws during SSR/prerender. `src/lib/orders.ts` and
  `src/lib/adminAuth.ts` are likewise browser-only.
- **Server** (`src/lib/server/firebaseAdmin.ts`): `getAdmin()` Admin SDK
  singleton. `$lib/server` is server-only by SvelteKit; importing it from the
  browser is a build error (that's the intended guard). Never import it client-side.
- **Local = emulators, always.** Every local run (dev server, preview, e2e,
  scripts) uses the Firebase emulator suite under the offline `demo-keramika`
  project with no credentials; only builds on Vercel (`VERCEL=1`) use the real
  project. The switch is the build-time constant `__USE_FIREBASE_EMULATOR__`
  (`vite.config.ts`), read via `src/lib/firebaseEmulator.ts` — deliberately
  not an `.env` value. `scripts/lib/emulator.mjs` mirrors the emulator
  constants and the local admin (`admin@example.com`) for the Node scripts.
  The only production operations are `--production` on `scripts/grant-admin.mjs`
  and `scripts/seed.mjs` (`scripts/lib/production.mjs`).
- **Credentials** (deployed only): no service-account key file is committed.
  Vercel gets one via the private env var `FIREBASE_SERVICE_ACCOUNT_KEY`
  (else ADC); see `docs/deployment.md`.

### Auth flow

Admin access is gated on the `admin` **custom claim**, not just being signed in.
Client signs in with Google (the only sign-in method; there is no
email/password login) via `src/lib/adminAuth.ts`, sends the
ID token as `Authorization: Bearer <idToken>` to the write API, which re-verifies
it in `src/lib/server/apiAuth.ts` (`requireAdmin`, 401/403). All write invariants
(slug uniqueness, category-delete guard, product-delete cascade, instance count
sync, idempotent bulk import) live in `src/lib/server/catalogRepo.ts` only.

The seed (`scripts/seed.mjs`) provisions the local admin in the Auth emulator,
signs in as it, and POSTs to `/api/import` — deliberately exercising the same
auth+write path the UI uses. `scripts/grant-admin.mjs` sets the claim; the user
must re-sign-in for the new claim to take effect.

## i18n (Paraglide)

- Locales: `cs` (default, **no** URL prefix) and `en` (`/en/...`). Route files
  are language-neutral; `src/hooks.ts` (reroute) de-localizes URLs so one route
  serves every locale. `src/hooks.server.ts` sets locale + `<html lang>`.
- **All** user-facing copy goes through message functions. Add keys to **both**
  `messages/cs.json` and `messages/en.json`, then `import { m } from '$lib/paraglide/messages'` and call `m.key()`.
- Internal links: wrap paths with `localizeHref('/path')` from
  `$lib/paraglide/runtime` so they respect the active locale.
- `src/lib/paraglide/` is **generated & git-ignored** — never edit by hand. It's
  compiled by the Vite plugin and the `prepare` script.

## Conventions & gotchas

- **Svelte 5 runes are forced** everywhere except `node_modules` (see
  `vite.config.ts`). Use runes (`$state`, `$derived`, `$effect`), not stores.
- SvelteKit config lives **inline in `vite.config.ts`**, not a `svelte.config.js`.
- **`prerender`/`ssr` flags are load-time critical**: only the static content
  pages set `prerender = true`; catalog pages must not (they read the database
  per request, and the build has no database). Admin sets `ssr = false`.
- Prerender entries (`vite.config.ts`) are `*` plus the English content pages.
  Missing links (404s) are ignored during prerender.
- Product images live in Firebase Storage (the Storage emulator locally,
  `storage.googleapis.com` deployed); the seed uploads the photos from
  `scripts/seed-data/images/`. Nothing product-related is in `static/`.
- Styling: **Tailwind v4** utilities preferred over bespoke CSS. Design tokens
  are CSS custom properties in `src/routes/layout.css` (imported via
  `@import 'tailwindcss'`). Fonts: Cormorant Garamond (headings), Jost (body).
- ESLint: `svelte/no-navigation-without-resolve` is on but `ignoreLinks` because
  internal `<a href>` uses `localizeHref()`; programmatic navigation still needs
  `resolve()`.
- `PUBLIC_FIREBASE_*` env values are **not secret** (safe in the browser);
  Firestore/Storage rules + Auth enforce access. They configure the deployed
  site only (Vercel env); locally `.env` can keep them empty. Copy
  `.env.example` to `.env`.

## Testing

Playwright e2e only, under `tests/e2e/` — one file per requirement area. Test
titles embed the `REQ-*` ID for greppable traceability. A requirement is
`verified` only once a passing test references its ID. Tests cover functional
behaviour only (state, logic, navigation, forms, auth, locale routing) - no
tests for styling, animations, fixed copy, SEO metadata, static links or
tooling; run `pnpm check` / `pnpm lint` directly instead.
