// Firebase client initialization.
//
// The public site is prerendered to static assets, so Firebase is initialized
// lazily in the browser only. Import `getFirebase()` from client-side code
// (components, onMount, event handlers) and destructure the services you need.
//
// The PUBLIC_* config values are safe to ship to the browser; access is
// enforced by Firebase Security Rules and Firebase Authentication, not by
// hiding these identifiers.

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';
import { browser } from '$app/environment';
import {
	PUBLIC_FIREBASE_API_KEY,
	PUBLIC_FIREBASE_AUTH_DOMAIN,
	PUBLIC_FIREBASE_PROJECT_ID,
	PUBLIC_FIREBASE_STORAGE_BUCKET,
	PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	PUBLIC_FIREBASE_APP_ID
} from '$env/static/public';
import {
	useFirebaseEmulator,
	EMULATOR_HOST,
	EMULATOR_PORTS,
	EMULATOR_WEB_CONFIG
} from '$lib/firebaseEmulator';

// Local builds use the offline demo project on the emulators and never see the
// real PUBLIC_FIREBASE_* config (see src/lib/firebaseEmulator.ts).
const firebaseConfig = useFirebaseEmulator
	? EMULATOR_WEB_CONFIG
	: {
			apiKey: PUBLIC_FIREBASE_API_KEY,
			authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
			projectId: PUBLIC_FIREBASE_PROJECT_ID,
			storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
			messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
			appId: PUBLIC_FIREBASE_APP_ID
		};

export type FirebaseServices = {
	app: FirebaseApp;
	auth: Auth;
	db: Firestore;
	storage: FirebaseStorage;
};

let services: FirebaseServices | null = null;

// Returns the initialized Firebase services, creating them on first use. Must
// only be called in the browser; throws if called during SSR/prerender.
export function getFirebase(): FirebaseServices {
	if (!browser) {
		throw new Error('getFirebase() must only be called in the browser.');
	}

	if (services) return services;

	const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
	services = {
		app,
		auth: getAuth(app),
		db: getFirestore(app),
		storage: getStorage(app)
	};

	// Every local build points all services at the emulator suite.
	if (useFirebaseEmulator) {
		connectAuthEmulator(services.auth, `http://${EMULATOR_HOST}:${EMULATOR_PORTS.auth}`, {
			disableWarnings: true
		});
		connectFirestoreEmulator(services.db, EMULATOR_HOST, EMULATOR_PORTS.firestore);
		connectStorageEmulator(services.storage, EMULATOR_HOST, EMULATOR_PORTS.storage);
	}

	return services;
}
