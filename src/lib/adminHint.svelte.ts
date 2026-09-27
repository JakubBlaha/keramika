// Lightweight "this browser has an admin session" hint (REQ-ADMIN-024).
//
// The public header shows an admin shortcut to signed-in admins, but checking
// the real session needs the Firebase Auth SDK, which regular visitors of the
// static site should never download. So $lib/adminAuth records a localStorage
// flag whenever it observes an admin session (and clears it on sign-out or a
// non-admin session); the header only loads $lib/adminAuth when this flag is
// set, and the real session then decides whether the shortcut shows.
//
// The flag is only a performance hint, never an access decision: the admin
// area and the write API re-check the `admin` claim themselves.

import { browser } from '$app/environment';

const KEY = 'keramika:admin-session';

function read(): boolean {
	try {
		return localStorage.getItem(KEY) === '1';
	} catch {
		return false;
	}
}

export const adminHint = $state({ present: browser && read() });

export function setAdminHint(present: boolean): void {
	adminHint.present = present;
	try {
		if (present) localStorage.setItem(KEY, '1');
		else localStorage.removeItem(KEY);
	} catch {
		// Storage unavailable (private mode, blocked): the hint is best-effort.
	}
}
