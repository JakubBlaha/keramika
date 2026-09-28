// Server-only Firebase Admin SDK singleton.
//
// The write API runs server-side with admin privileges: it verifies caller ID
// tokens (REQ-API-002) and writes to Firestore/Storage (REQ-ADMIN-018/019).
//
// Locally (dev server, preview, e2e) it always talks to the emulator suite
// under the offline demo project and uses no credentials at all, so a local
// run can never touch production (see src/lib/firebaseEmulator.ts).
//
// Deployed (Vercel), credentials come from, first match wins:
// 1. FIREBASE_SERVICE_ACCOUNT_KEY - a service-account key passed in a private
//    env var (Vercel has no Google credentials and no files). Never committed;
//    see docs/deployment.md.
// 2. Application Default Credentials (ADC), for hosts that provide them.
// The project id is taken from the public config so it matches the client app.
//
// This module must never be imported by client code. The `$lib/server`
// directory is server-only in SvelteKit and importing it from the browser is a
// build error, which is exactly the guard we want.

import {
	getApps,
	initializeApp,
	applicationDefault,
	cert,
	type App,
	type AppOptions,
	type Credential
} from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';
import { PUBLIC_FIREBASE_PROJECT_ID, PUBLIC_FIREBASE_STORAGE_BUCKET } from '$env/static/public';
import { env } from '$env/dynamic/private';
import {
	useFirebaseEmulator,
	EMULATOR_HOST,
	EMULATOR_PORTS,
	EMULATOR_PROJECT_ID,
	EMULATOR_STORAGE_BUCKET
} from '$lib/firebaseEmulator';

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

// App options for the current backend. For the emulators, the SDK picks the
// hosts up from these env vars and needs no credential.
function appOptions(): AppOptions {
	if (useFirebaseEmulator) {
		process.env.FIREBASE_AUTH_EMULATOR_HOST = `${EMULATOR_HOST}:${EMULATOR_PORTS.auth}`;
		process.env.FIRESTORE_EMULATOR_HOST = `${EMULATOR_HOST}:${EMULATOR_PORTS.firestore}`;
		process.env.FIREBASE_STORAGE_EMULATOR_HOST = `${EMULATOR_HOST}:${EMULATOR_PORTS.storage}`;
		return { projectId: EMULATOR_PROJECT_ID, storageBucket: EMULATOR_STORAGE_BUCKET };
	}
	return {
		credential: serviceAccountFromEnv() ?? applicationDefault(),
		projectId: PUBLIC_FIREBASE_PROJECT_ID,
		storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET
	};
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

	const options = appOptions();
	const app: App = getApps().length ? getApps()[0] : initializeApp(options);

	services = {
		app,
		auth: getAuth(app),
		db: getFirestore(app),
		storage: getStorage(app),
		bucketName: options.storageBucket ?? ''
	};

	return services;
}
