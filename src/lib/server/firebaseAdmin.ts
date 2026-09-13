// Server-only Firebase Admin SDK singleton.
//
// The write API runs server-side with admin privileges: it verifies caller ID
// tokens (REQ-API-002) and writes to Firestore/Storage (REQ-ADMIN-018/019).
//
// Credentials come from Application Default Credentials (ADC), so no
// service-account key file is committed to the repo. Locally, ADC is provided
// by the Firebase/gcloud CLI login; in a deployed environment it is provided by
// the platform's default service account. The project id is taken from the
// public config so it matches the client app.
//
// This module must never be imported by client code. The `$lib/server`
// directory is server-only in SvelteKit and importing it from the browser is a
// build error, which is exactly the guard we want.

import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import {
	getApps,
	initializeApp,
	applicationDefault,
	refreshToken,
	type App,
	type Credential
} from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';
import { PUBLIC_FIREBASE_PROJECT_ID, PUBLIC_FIREBASE_STORAGE_BUCKET } from '$env/static/public';

// The public Firebase CLI OAuth client. When gcloud ADC is not configured, we
// fall back to the refresh token stored by `firebase login` so the API can run
// locally with the developer's own credentials and no service-account key file.
const FIREBASE_CLI_CLIENT_ID =
	'563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const FIREBASE_CLI_CLIENT_SECRET = 'j9iVZfS8kkCEFUPaAeJV0sAi';

// Resolves a credential: prefer ADC, otherwise the Firebase CLI refresh token.
function resolveCredential(): Credential {
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
			return refreshToken({
				type: 'authorized_user',
				client_id: FIREBASE_CLI_CLIENT_ID,
				client_secret: FIREBASE_CLI_CLIENT_SECRET,
				refresh_token: rt
			});
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
