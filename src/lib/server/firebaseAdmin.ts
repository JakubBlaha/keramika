// Server-only Firebase Admin SDK singleton.
//
// The write API runs server-side with admin privileges: it verifies caller ID
// tokens (REQ-API-002) and writes to Firestore/Storage (REQ-ADMIN-018/019).
//
// Credentials (see resolveCredential), first match wins:
// 1. FIREBASE_SERVICE_ACCOUNT_KEY - a service-account key passed in a private
//    env var (for hosts like Vercel, which have no Google credentials and no
//    files). Never committed; see docs/deployment.md.
// 2. Application Default Credentials (ADC), e.g. from
//    `gcloud auth application-default login`.
// 3. The `firebase login` refresh token, for keyless local development.
// The project id is taken from the public config so it matches the client app.
//
// This module must never be imported by client code. The `$lib/server`
// directory is server-only in SvelteKit and importing it from the browser is a
// build error, which is exactly the guard we want.

import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	getApps,
	initializeApp,
	applicationDefault,
	cert,
	type App,
	type Credential
} from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';
import { PUBLIC_FIREBASE_PROJECT_ID, PUBLIC_FIREBASE_STORAGE_BUCKET } from '$env/static/public';
import { env } from '$env/dynamic/private';

// The public Firebase CLI OAuth client. When gcloud ADC is not configured, we
// fall back to the refresh token stored by `firebase login` so the API can run
// locally with the developer's own credentials and no service-account key file.
const FIREBASE_CLI_CLIENT_ID =
	'563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const FIREBASE_CLI_CLIENT_SECRET = 'j9iVZfS8kkCEFUPaAeJV0sAi';

// A service-account key from FIREBASE_SERVICE_ACCOUNT_KEY: the key file's
// JSON, either base64-encoded (recommended: survives any env var UI) or raw.
function serviceAccountFromEnv(): Credential | null {
	const raw = env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
	if (!raw) return null;
	const json = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
	let key: { project_id?: string; client_email?: string; private_key?: string };
	try {
		key = JSON.parse(json);
	} catch {
		throw new Error(
			'FIREBASE_SERVICE_ACCOUNT_KEY is not valid service-account JSON (raw or base64).'
		);
	}
	return cert({
		projectId: key.project_id,
		clientEmail: key.client_email,
		privateKey: key.private_key
	});
}

// Resolves a credential: a service-account key from the environment, else
// ADC, else the Firebase CLI refresh token.
//
// The CLI token must still be presented *as ADC*: the Admin SDK only lets
// Firestore (and Storage) use a service-account or application-default
// credential, and rejects a plain refreshToken() credential with "Failed to
// initialize Google Cloud Firestore client with the available credentials".
// So the token is written as an ADC `authorized_user` file (private temp dir,
// owner-only, removed on exit) and GOOGLE_APPLICATION_CREDENTIALS points at it.
function resolveCredential(): Credential {
	const serviceAccount = serviceAccountFromEnv();
	if (serviceAccount) {
		return serviceAccount;
	}

	const hasAdc =
		!!process.env.GOOGLE_APPLICATION_CREDENTIALS ||
		existsSync(join(homedir(), '.config/gcloud/application_default_credentials.json'));
	if (hasAdc) {
		return applicationDefault();
	}

	const cliPath = join(homedir(), '.config/configstore/firebase-tools.json');
	if (existsSync(cliPath)) {
		const cli = JSON.parse(readFileSync(cliPath, 'utf8'));
		const rt = cli?.tokens?.refresh_token;
		if (rt) {
			const dir = mkdtempSync(join(tmpdir(), 'keramika-adc-'));
			const file = join(dir, 'application_default_credentials.json');
			writeFileSync(
				file,
				JSON.stringify({
					type: 'authorized_user',
					client_id: FIREBASE_CLI_CLIENT_ID,
					client_secret: FIREBASE_CLI_CLIENT_SECRET,
					refresh_token: rt
				}),
				{ mode: 0o600 }
			);
			process.once('exit', () => rmSync(dir, { recursive: true, force: true }));
			process.env.GOOGLE_APPLICATION_CREDENTIALS = file;
			return applicationDefault();
		}
	}

	// Last resort: let the SDK try ADC and surface its own error.
	return applicationDefault();
}

export type AdminServices = {
	app: App;
	auth: Auth;
	db: Firestore;
	storage: Storage;
	bucketName: string;
};

let services: AdminServices | null = null;

// Returns the initialized Admin services, creating them on first use.
export function getAdmin(): AdminServices {
	if (services) return services;

	const app: App = getApps().length
		? getApps()[0]
		: initializeApp({
				credential: resolveCredential(),
				projectId: PUBLIC_FIREBASE_PROJECT_ID,

				storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET
			});

	services = {
		app,
		auth: getAuth(app),
		db: getFirestore(app),
		storage: getStorage(app),
		bucketName: PUBLIC_FIREBASE_STORAGE_BUCKET
	};

	return services;
}
