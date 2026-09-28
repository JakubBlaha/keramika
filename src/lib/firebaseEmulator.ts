// The local Firebase emulator suite, used by every local run: dev server,
// preview, e2e tests and scripts. Production is only reachable from builds on
// Vercel (see __USE_FIREBASE_EMULATOR__ in vite.config.ts).
//
// The project id has the `demo-` prefix, which the emulators treat as
// offline-only: nothing is ever forwarded to a real Firebase project, and no
// credentials or real config values are needed. Ports match firebase.json.
// scripts/lib/emulator.mjs mirrors these values for the Node scripts; keep the
// two in sync.

export const useFirebaseEmulator: boolean = __USE_FIREBASE_EMULATOR__;

export const EMULATOR_PROJECT_ID = 'demo-keramika';
export const EMULATOR_STORAGE_BUCKET = `${EMULATOR_PROJECT_ID}.appspot.com`;

export const EMULATOR_HOST = '127.0.0.1';
export const EMULATOR_PORTS = { auth: 9099, firestore: 8080, storage: 9199 } as const;

// Web app config for the demo project. The emulators accept any API key.
export const EMULATOR_WEB_CONFIG = {
	apiKey: 'demo-api-key',
	authDomain: `${EMULATOR_PROJECT_ID}.firebaseapp.com`,
	projectId: EMULATOR_PROJECT_ID,
	storageBucket: EMULATOR_STORAGE_BUCKET
};

// Public URL of a Storage object served by the Storage emulator.
export function emulatorStorageUrl(bucket: string, path: string): string {
	return `http://${EMULATOR_HOST}:${EMULATOR_PORTS.storage}/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;
}
