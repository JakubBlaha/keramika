// Admin authentication state for the admin area (REQ-ADMIN-002, REQ-ADMIN-003,
// REQ-ADMIN-004, REQ-ADMIN-017).
//
// Auth is handled entirely by the Firebase JS SDK in the browser: the user
// signs in with a Google account (the only sign-in method), and access to the
// admin area is gated on the `admin` custom claim carried by their ID token.
// Signing in only proves identity; a user without the claim is authenticated
// but still rejected by the gate. The same ID token is sent as a Bearer token
// to the write API (see src/lib/server/apiAuth.ts), which re-verifies it
// server-side; the client-side gate here is only about what UI to show.
//
// This module is browser-only, like src/lib/firebase.ts and src/lib/orders.ts.

import {
	signInWithPopup,
	GoogleAuthProvider,
	signOut,
	onIdTokenChanged,
	type User
} from 'firebase/auth';
import { getFirebase } from '$lib/firebase';
import { setAdminHint } from '$lib/adminHint.svelte';

// The reactive admin session, consumed by the admin layout and pages.
// - loading: the initial auth state has not resolved yet.
// - user: the signed-in Firebase user, or null when signed out.
// - isAdmin: true only when the signed-in user carries the `admin` claim.
// - error: Firebase could not start (typically missing/invalid PUBLIC_FIREBASE_*
//   config), so the session will never resolve to a user.
export type AdminSession = {
	loading: boolean;
	user: User | null;
	isAdmin: boolean;
	error: boolean;
};

// Svelte 5 rune-based store. `$state` in a `.svelte.ts` context would be
// reactive; here we keep a plain object updated by the listener and expose a
// getter so components can read it inside their own `$derived`/`$effect`.
let session: AdminSession = { loading: true, user: null, isAdmin: false, error: false };
const subscribers = new Set<(s: AdminSession) => void>();
let started = false;

function emit(): void {
	for (const fn of subscribers) fn(session);
}

// Begin observing the Firebase auth state. Idempotent: only the first call
// wires up the listener. Returns immediately; the session updates as tokens
// change (sign in, sign out, token refresh with new claims).
function start(): void {
	if (started) return;
	started = true;
	let auth;
	try {
		({ auth } = getFirebase());
	} catch (err) {
		// e.g. auth/invalid-api-key when .env has no Firebase config. Resolve
		// the session as failed instead of leaving the admin area loading forever.
		console.error('Admin auth could not start:', err);
		session = { loading: false, user: null, isAdmin: false, error: true };
		return;
	}
	onIdTokenChanged(auth, async (user) => {
		if (!user) {
			session = { loading: false, user: null, isAdmin: false, error: false };
			setAdminHint(false);
			emit();
			return;
		}
		let isAdmin: boolean;
		try {
			const token = await user.getIdTokenResult();
			isAdmin = token.claims.admin === true;
		} catch {
			isAdmin = false;
		}
		session = { loading: false, user, isAdmin, error: false };
		// Lets the public header know to check for an admin session (REQ-ADMIN-024).
		setAdminHint(isAdmin);
		emit();
	});
}

// Subscribe to session changes. Calls back immediately with the current value
// and again on every change. Returns an unsubscribe function.
export function subscribeAdminSession(fn: (s: AdminSession) => void): () => void {
	start();
	subscribers.add(fn);
	fn(session);
	return () => {
		subscribers.delete(fn);
	};
}

// Sign in with a Google account via a popup (REQ-ADMIN-003) - the only admin
// sign-in method. Admin access is still gated on the `admin` claim: a Google
// user without it signs in but is rejected by the layout gate. Throws if the
// popup is closed or the sign-in fails so the caller can show an error.
export async function adminLoginWithGoogle(): Promise<void> {
	const { auth } = getFirebase();
	const provider = new GoogleAuthProvider();
	await signInWithPopup(auth, provider);
}

// Sign out and end the admin session (REQ-ADMIN-004).
export async function adminLogout(): Promise<void> {
	const { auth } = getFirebase();
	await signOut(auth);
}

// Current admin ID token for API calls, or null when not signed in. Firebase
// refreshes the token as needed.
export async function getAdminIdToken(): Promise<string | null> {
	const { auth } = getFirebase();
	const user = auth.currentUser;
	if (!user) return null;
	return user.getIdToken();
}
