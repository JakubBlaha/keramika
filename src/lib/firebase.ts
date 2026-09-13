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
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { browser } from '$app/environment';
import {
	PUBLIC_FIREBASE_API_KEY,
	PUBLIC_FIREBASE_AUTH_DOMAIN,
	PUBLIC_FIREBASE_PROJECT_ID,
	PUBLIC_FIREBASE_STORAGE_BUCKET,
	PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	PUBLIC_FIREBASE_APP_ID
} from '$env/static/public';

const firebaseConfig = {
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

	return services;
}
