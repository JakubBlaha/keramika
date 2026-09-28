# Deployment: server credentials

Only builds on Vercel (which sets `VERCEL=1`) talk to the real Firebase
project; every local run uses the emulator suite (see "Local development"
below). The Vercel project therefore needs the `PUBLIC_FIREBASE_*` web app
config from `.env.example` in its environment variables.

The public site is static, but the admin area's write API (`/api/*`) runs
server-side with the Firebase Admin SDK and needs Google Cloud credentials for
Firestore and Storage. Vercel has none, so it needs a **service-account key**,
passed in the private env var `FIREBASE_SERVICE_ACCOUNT_KEY`
(see `src/lib/server/firebaseAdmin.ts`).

## 1. Create the key

Use Firebase's built-in Admin SDK service account. Every Firebase project has
one, and it already has the access the API needs (Firestore read/write,
Storage uploads, verifying ID tokens).

1. Open the [Firebase console](https://console.firebase.google.com/) → project
   **keramika-4864859** → ⚙ **Project settings** → **Service accounts**.
2. Keep **Firebase Admin SDK** / **Node.js** selected and click
   **Generate new private key** → **Generate key**.
3. A JSON file downloads (`keramika-4864859-firebase-adminsdk-….json`). It
   grants admin access to the whole project: treat it like a password.

## 2. Add it to Vercel

Base64-encode the file, so its newlines survive the env var UI:

```sh
base64 -i ~/Downloads/keramika-4864859-firebase-adminsdk-*.json | pbcopy
```

Then either:

- **Dashboard:** Vercel project → **Settings** → **Environment Variables** →
  add `FIREBASE_SERVICE_ACCOUNT_KEY`, paste, select **Production** (and
  **Preview** if preview deployments should reach the real backend), and mark
  it **Sensitive**.
- **CLI:** `vercel env add FIREBASE_SERVICE_ACCOUNT_KEY production`, paste when
  prompted.

Redeploy: env var changes only apply to new deployments.

## 3. Clean up

Delete the downloaded JSON file once it is stored in Vercel. Never commit it
(`.gitignore` blocks the usual key file names) and never put it in a
`PUBLIC_*` variable: those are shipped to the browser.

## Rotating or revoking

In the Google Cloud console → **IAM & Admin** → **Service accounts** →
`firebase-adminsdk-…@keramika-4864859.iam.gserviceaccount.com` → **Keys**:
add a new key, update the Vercel env var, redeploy, then delete the old key.
Delete a key immediately if it may have leaked.

## Local development

Not needed. Everything run locally (dev server, preview, e2e tests, scripts)
uses the Firebase emulator suite under the offline `demo-keramika` project, so
it needs no credentials and cannot reach production data. This is fixed at
build time (`__USE_FIREBASE_EMULATOR__` in `vite.config.ts`), not an `.env`
switch.

```sh
pnpm emulators   # terminal 1: Auth, Firestore, Storage; data kept in .emulator-data/
pnpm dev         # terminal 2
pnpm seed        # once per fresh .emulator-data: catalog + local admin
```

Sign in to `/admin` by picking `admin@example.com` in the emulator's Google
popup. `pnpm test` starts its own throwaway emulators (stop `pnpm emulators`
first). The emulators need Java 21+ and a global `firebase-tools`.

The deliberate exceptions, both explicit `--production` operations from your
machine (`scripts/lib/production.mjs`):

- Granting the admin claim to a real user:
  `pnpm grant-admin you@example.com --production` (uses your `firebase login`).
- Seeding the real catalog (below).

## Seeding production

`scripts/seed.mjs --production` uploads the photos from
`scripts/seed-data/images/` and imports `scripts/seed-data/catalog.json`
through the **deployed** site's API, so the deployment must be up and have
`FIREBASE_SERVICE_ACCOUNT_KEY`. The import upserts by slug/id: seeded
categories, products and pieces are overwritten with the seed data; anything
else is left alone.

The admin area is Google-only, so the script signs in as a temporary admin (a
custom token with the `admin` claim, deleted afterwards). Signing that token
needs the service-account key; download one as in step 1 above, then:

```sh
FIREBASE_SERVICE_ACCOUNT_KEY="$(base64 -i ~/Downloads/keramika-4864859-firebase-adminsdk-*.json)" \
  node scripts/seed.mjs --production --api https://keramika-snowy.vercel.app
rm ~/Downloads/keramika-4864859-firebase-adminsdk-*.json
```

Then delete that extra key in the Google Cloud console (IAM & Admin → Service
accounts → `firebase-adminsdk-…` → Keys), keeping the one Vercel uses. The web
API key comes from `PUBLIC_FIREBASE_API_KEY` in `.env` (or `--api-key`).
Without a key file, the script falls back to signing through IAM, which needs
the Service Account Token Creator role on your account.

## Least-privilege alternative

Instead of the Firebase Admin SDK account, you can create a dedicated service
account (Google Cloud console → **IAM & Admin** → **Service accounts** →
**Create**) with only:

- **Cloud Datastore User** (Firestore read/write)
- **Storage Object Admin** (image uploads with download tokens)

Verifying sign-in ID tokens needs no role. Then create a JSON key for it
(**Keys** → **Add key** → **JSON**) and continue from step 2.
