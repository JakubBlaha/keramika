# AGENTS.md

E-shop for the ceramicist Lada Bartoníková. SvelteKit (Svelte 5 runes) +
Tailwind v4 + Paraglide i18n. The public site is prerendered static; the admin
area and catalog write API are Firebase-backed.

## Commands

Package manager is **pnpm** (see `pnpm-workspace.yaml`).

- `pnpm check` — `svelte-kit sync` + `svelte-check` (types + Svelte). Primary way to verify changes.
- `pnpm lint` — `prettier --check .` then `eslint .`
- `pnpm format` — `prettier --write .`
- `pnpm build` — production build (prerenders the public site).
- `pnpm test` / `pnpm test:e2e` — Playwright e2e. Builds and serves the preview itself unless `PLAYWRIGHT_BASE_URL` is set.
- `pnpm seed` — seed catalog into Firestore via the API (`scripts/seed.mjs`).
- `pnpm grant-admin <email> [--revoke]` — grant/revoke the `admin` custom claim.

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

1. **Public site** — fully prerendered (`prerender = true`), driven by the
   **placeholder catalog** in `src/lib/catalog.ts` (no backend read yet). Routes:
   `/` (home), `/produkty` (categories), `/produkty/[category]`, `/produkt/[slug]`.
2. **Admin + write API** — Firebase-backed, dynamic. Admin UI under
   `/admin/*` (`prerender = false`, `ssr = false` — client-only). Write API under
   `/api/*` (`prerender = false`), the single trusted write path.

### Two catalog models (do not confuse them)

- `src/lib/catalog.ts` — the **public placeholder** data. Localized copy is
  Paraglide **message functions** (`name: () => m.product_angel_name()`), i.e.
  compile-time code. Drives the prerendered pages.
- `src/lib/catalog-model.ts` — the **Firestore-facing** types. Localized copy is
  a stored `{ cs, en }` map (Firestore can't hold functions). Includes payload
  validators (`validateCategory/Product/Instance`) returning `ValidationError[]`.

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
- **Keyless credentials**: no service-account key file is committed. Both the
  Admin SDK and the scripts resolve credentials as ADC first, else the Firebase
  CLI refresh token from `firebase login`. Requires `firebase login` locally.

### Auth flow

Admin access is gated on the `admin` **custom claim**, not just being signed in.
Client signs in with Google (the only sign-in method; there is no
email/password login) via `src/lib/adminAuth.ts`, sends the
ID token as `Authorization: Bearer <idToken>` to the write API, which re-verifies
it in `src/lib/server/apiAuth.ts` (`requireAdmin`, 401/403). All write invariants
(slug uniqueness, category-delete guard, product-delete cascade, instance count
sync, idempotent bulk import) live in `src/lib/server/catalogRepo.ts` only.

The seed (`scripts/seed.mjs`) creates a dedicated admin account, signs in, and
POSTs to `/api/import` — deliberately exercising the same auth+write path the UI
uses. `scripts/grant-admin.mjs` sets the claim; the user must re-sign-in for the
new claim to take effect.

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
- **`prerender`/`ssr` flags are load-time critical**: public pages set
  `prerender = true` and use `entries` (EntryGenerator) to enumerate slugs; API
  and admin set `prerender = false` (admin also `ssr = false`).
- Loaders return only **language-neutral slugs**; components resolve the product
  and its message functions from `catalog.ts` because functions can't be
  serialized across the load boundary.
- Prerender crawler starts at `/`; `/en` is seeded manually in `vite.config.ts`.
  Missing links (unbuilt shop/legal routes) 404s are ignored during prerender.
- Product images: public site serves from `static/products/<product>/<piece>/<file>`;
  the seed rewrites these to Firebase Storage `storage.googleapis.com` URLs.
- Styling: **Tailwind v4** utilities preferred over bespoke CSS. Design tokens
  are CSS custom properties in `src/routes/layout.css` (imported via
  `@import 'tailwindcss'`). Fonts: Cormorant Garamond (headings), Jost (body).
- ESLint: `svelte/no-navigation-without-resolve` is on but `ignoreLinks` because
  internal `<a href>` uses `localizeHref()`; programmatic navigation still needs
  `resolve()`.
- `PUBLIC_FIREBASE_*` env values are **not secret** (safe in the browser);
  Firestore/Storage rules + Auth enforce access. Copy `.env.example` to `.env`.

## Testing

Playwright e2e only, under `tests/e2e/` — one file per requirement area. Test
titles embed the `REQ-*` ID for greppable traceability. A requirement is
`verified` only once a passing test references its ID. `build.spec.ts` runs
`pnpm check` and `eslint` as a test, so keep those green.
