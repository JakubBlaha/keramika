// The real Firebase project, for the few deliberate production operations run
// from a developer machine (`--production` on scripts/grant-admin.mjs and
// scripts/seed.mjs). Everything else local uses the emulators (see
// scripts/lib/emulator.mjs).
//
// Credentials: Application Default Credentials, else the Firebase CLI refresh
// token from `firebase login`. The project comes from .firebaserc. Minting a
// custom token (seed) additionally needs either FIREBASE_SERVICE_ACCOUNT_KEY
// (the service-account key, base64 or raw JSON, as in Vercel) or the Service
// Account Token Creator role on your account; see temporaryAdminIdToken().

import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, applicationDefault, cert, refreshToken, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// Public Firebase CLI OAuth client. Lets the scripts run with the developer's
// `firebase login` credentials, no key file.
const FIREBASE_CLI_CLIENT_ID =
	'563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const FIREBASE_CLI_CLIENT_SECRET = 'j9iVZfS8kkCEFUPaAeJV0sAi';

function resolveCredential() {
	const hasAdc =
		!!process.env.GOOGLE_APPLICATION_CREDENTIALS ||
		existsSync(join(homedir(), '.config/gcloud/application_default_credentials.json'));
	if (hasAdc) return applicationDefault();

	const cliPath = join(homedir(), '.config/configstore/firebase-tools.json');
	if (existsSync(cliPath)) {
		const cli = JSON.parse(readFileSync(cliPath, 'utf8'));
		const rt = cli?.tokens?.refresh_token;
		if (rt) {
			return refreshToken({
				type: 'authorized_user',
				client_id: FIREBASE_CLI_CLIENT_ID,
				client_secret: FIREBASE_CLI_CLIENT_SECRET,
				refresh_token: rt
			});
		}
	}
	return applicationDefault();
}

export function productionProjectId() {
	const rc = JSON.parse(readFileSync(join(root, '.firebaserc'), 'utf8'));
	const projectId = rc.projects?.default;
	if (!projectId) throw new Error('No default project in .firebaserc');
	return projectId;
}

// Admin SDK app for the real project.
export function productionAdminApp() {
	// Clear any emulator hosts so the Admin SDK cannot silently hit an emulator.
	delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
	delete process.env.FIRESTORE_EMULATOR_HOST;
	delete process.env.FIREBASE_STORAGE_EMULATOR_HOST;
	return (
		getApps()[0] ??
		initializeApp({ credential: resolveCredential(), projectId: productionProjectId() })
	);
}

// FIREBASE_SERVICE_ACCOUNT_KEY, base64-encoded or raw JSON (same format as the
// Vercel env var), or null when unset.
function serviceAccountKeyFromEnv() {
	const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
	if (!raw) return null;
	const json = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
	const key = JSON.parse(json);
	return { projectId: key.project_id, clientEmail: key.client_email, privateKey: key.private_key };
}

// The project's Firebase Admin SDK service account (firebase-adminsdk-…), which
// signs custom tokens for us through the IAM signBlob API.
async function adminSdkServiceAccount(credential, projectId) {
	const { access_token } = await credential.getAccessToken();
	const res = await fetch(`https://iam.googleapis.com/v1/projects/${projectId}/serviceAccounts`, {
		headers: { authorization: `Bearer ${access_token}` }
	});
	const body = await res.json();
	if (!res.ok) throw new Error(`Listing service accounts failed: ${body?.error?.message}`);
	const account = body.accounts?.find((a) => a.email.startsWith('firebase-adminsdk-'));
	if (!account) throw new Error('No firebase-adminsdk service account found in the project.');
	return account.email;
}

// Signs in to the real project as a temporary admin and returns its ID token
// plus a cleanup function that deletes the account again. The admin area is
// Google-only, so a script cannot sign in as a person; instead it mints a
// custom token carrying the `admin` claim for a throwaway uid and exchanges it
// for an ID token with the public web API key. Custom-token sign-in works
// whatever sign-in providers are enabled. The token is signed locally with
// FIREBASE_SERVICE_ACCOUNT_KEY when set; otherwise by the Admin SDK service
// account through IAM signBlob, which needs the Service Account Token Creator
// role (project Owner alone is not enough). Always call cleanup (in a finally
// block).
export async function temporaryAdminIdToken(apiKey) {
	const projectId = productionProjectId();
	delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
	const key = serviceAccountKeyFromEnv();
	let options;
	if (key) {
		console.log('Signing the temporary admin token with FIREBASE_SERVICE_ACCOUNT_KEY.');
		options = { credential: cert(key), projectId };
	} else {
		console.log(
			'FIREBASE_SERVICE_ACCOUNT_KEY is not set; signing the temporary admin token through IAM.'
		);
		const credential = resolveCredential();
		options = {
			credential,
			projectId,
			serviceAccountId: await adminSdkServiceAccount(credential, projectId)
		};
	}
	const app = initializeApp(options, 'temporary-admin');
	const auth = getAuth(app);

	const uid = `seed-${randomBytes(6).toString('hex')}`;
	const cleanup = () => auth.deleteUser(uid).catch(() => {});
	try {
		const customToken = await auth.createCustomToken(uid, { admin: true }).catch((err) => {
			if (key || err?.code !== 'auth/insufficient-permission') throw err;
			throw new Error(
				'Your account may not sign tokens through IAM (needs the Service Account Token ' +
					'Creator role). Set FIREBASE_SERVICE_ACCOUNT_KEY to the service-account key ' +
					'instead; see "Seeding production" in docs/deployment.md.'
			);
		});
		const res = await fetch(
			`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
			{
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ token: customToken, returnSecureToken: true })
			}
		);
		const body = await res.json();
		if (!res.ok) throw new Error(`Temporary admin sign-in failed: ${body?.error?.message}`);
		return { idToken: body.idToken, uid, cleanup };
	} catch (err) {
		await cleanup();
		throw err;
	}
}
