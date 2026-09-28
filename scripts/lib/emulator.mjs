// The local Firebase emulator suite, for the Node scripts. Mirrors
// src/lib/firebaseEmulator.ts (which the app uses); keep the two in sync.
//
// The `demo-` project id is offline-only: the emulators never forward it to a
// real Firebase project, and no credentials are needed.

import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export const EMULATOR_PROJECT_ID = 'demo-keramika';
export const EMULATOR_HOST = '127.0.0.1';
export const EMULATOR_PORTS = { auth: 9099, firestore: 8080, storage: 9199 };

// The local admin: a Google-linked account (the admin area is Google-only)
// carrying the `admin` claim. Pick it in the emulator's Google sign-in popup
// when developing; the seed and e2e tests sign in with a fake Google
// credential for `googleSub` instead. tests/e2e/admin.spec.ts mirrors it.
export const LOCAL_ADMIN = {
	uid: 'local-admin',
	email: 'admin@example.com',
	displayName: 'Local Admin',
	googleSub: 'google-local-admin'
};

// Admin SDK app for the emulators. `firebase emulators:exec` already sets the
// host variables; they are filled in for scripts run next to `pnpm emulators`.
export function emulatorAdminApp() {
	process.env.FIREBASE_AUTH_EMULATOR_HOST ??= `${EMULATOR_HOST}:${EMULATOR_PORTS.auth}`;
	process.env.FIRESTORE_EMULATOR_HOST ??= `${EMULATOR_HOST}:${EMULATOR_PORTS.firestore}`;
	process.env.FIREBASE_STORAGE_EMULATOR_HOST ??= `${EMULATOR_HOST}:${EMULATOR_PORTS.storage}`;
	return getApps()[0] ?? initializeApp({ projectId: EMULATOR_PROJECT_ID });
}

// Fails with a clear hint when the emulators are not running.
export async function assertEmulatorsRunning() {
	try {
		await fetch(`http://${EMULATOR_HOST}:${EMULATOR_PORTS.auth}/`);
	} catch {
		console.error('The Firebase emulators are not running. Start them with `pnpm emulators`.');
		process.exit(1);
	}
}

// Ensures the local admin exists in the Auth emulator with the `admin` claim.
export async function ensureLocalAdmin() {
	const auth = getAuth(emulatorAdminApp());
	try {
		await auth.getUser(LOCAL_ADMIN.uid);
	} catch {
		const result = await auth.importUsers([
			{
				uid: LOCAL_ADMIN.uid,
				email: LOCAL_ADMIN.email,
				emailVerified: true,
				displayName: LOCAL_ADMIN.displayName,
				providerData: [
					{
						uid: LOCAL_ADMIN.googleSub,
						email: LOCAL_ADMIN.email,
						displayName: LOCAL_ADMIN.displayName,
						providerId: 'google.com'
					}
				]
			}
		]);
		if (result.failureCount) throw result.errors[0].error;
	}
	await auth.setCustomUserClaims(LOCAL_ADMIN.uid, { admin: true });
}

// An ID token for the local admin, from the Auth emulator's Google sign-in with
// an unsigned fake id_token (accepted only by the emulator).
export async function localAdminIdToken() {
	const idToken = JSON.stringify({
		sub: LOCAL_ADMIN.googleSub,
		email: LOCAL_ADMIN.email,
		email_verified: true
	});
	const res = await fetch(
		`http://${EMULATOR_HOST}:${EMULATOR_PORTS.auth}/identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=demo-api-key`,
		{
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				postBody: `id_token=${encodeURIComponent(idToken)}&providerId=google.com`,
				requestUri: 'http://localhost',
				returnSecureToken: true
			})
		}
	);
	if (!res.ok) {
		throw new Error(`Emulator sign-in failed: ${res.status} ${await res.text()}`);
	}
	return (await res.json()).idToken;
}
