# Deployment: server credentials

The public site is static, but the admin area's write API (`/api/*`) runs
server-side with the Firebase Admin SDK and needs Google Cloud credentials for
Firestore and Storage. Locally it uses your `firebase login` (or gcloud ADC).
A deployed server (Vercel) has neither, so it needs a **service-account key**,
passed in the private env var `FIREBASE_SERVICE_ACCOUNT_KEY`
(see `src/lib/server/firebaseAdmin.ts`).

## 1. Create the key

Use Firebase's built-in Admin SDK service account. Every Firebase project has
one, and it already has the access the API needs (Firestore read/write,
Storage upload including `makePublic()`, verifying ID tokens).

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

Not needed: locally the API uses your `firebase login`. If you do set
`FIREBASE_SERVICE_ACCOUNT_KEY` in `.env`, it takes precedence over the local
fallbacks.

## Least-privilege alternative

Instead of the Firebase Admin SDK account, you can create a dedicated service
account (Google Cloud console → **IAM & Admin** → **Service accounts** →
**Create**) with only:

- **Cloud Datastore User** (Firestore read/write)
- **Storage Object Admin** (uploads, and `makePublic()` on uploaded images)

Verifying sign-in ID tokens needs no role. Then create a JSON key for it
(**Keys** → **Add key** → **JSON**) and continue from step 2.
