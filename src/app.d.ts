// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	// True for every local build (dev, preview, e2e), false on Vercel. Set in
	// vite.config.ts; see src/lib/firebaseEmulator.ts.
	const __USE_FIREBASE_EMULATOR__: boolean;

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
