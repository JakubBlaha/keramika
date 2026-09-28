import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { defineConfig } from 'vite';

// Which Firebase backend the app talks to, fixed at build time. Everything run
// locally (dev server, preview, e2e tests) uses the local emulator suite; only
// builds on Vercel (which sets VERCEL=1) use the real project. Deliberately not
// an .env switch, so a local setup can never read or write production data.
// See src/lib/firebaseEmulator.ts.
const useFirebaseEmulator = !process.env.VERCEL;

export default defineConfig({
	define: {
		__USE_FIREBASE_EMULATOR__: JSON.stringify(useFirebaseEmulator)
	},
	plugins: [
		tailwindcss(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale']
		}),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Deploying to Vercel. The static content pages are prerendered (see
			// `export const prerender = true` in their +page.ts). Everything that
			// shows catalog data reads it from Firestore per request (their
			// +page.server.ts), and the write API under /api/* and the admin UI
			// under /admin/* are dynamic too; they run as Vercel serverless
			// functions.
			// The runtime is pinned explicitly because adapter-vercel otherwise
			// infers it from the local Node version at build time, which breaks
			// on Node versions newer than what Vercel currently supports. It must
			// be Node 24: firebase-admin's jwks-rsa require()s the ESM-only jose,
			// which Vercel's Node 22 functions reject with ERR_REQUIRE_ESM.
			adapter: adapter({ runtime: 'nodejs24.x' }),

			prerender: {
				// Every prerenderable route in Czech, plus their English versions
				// (the /en root itself is a dynamic catalog page).
				entries: ['*', '/en/kontakt', '/en/o-nas', '/en/obchodni-podminky'],

				// Ignore links to routes that are not built yet instead of failing
				// the build.

				handleHttpError: ({ status, path, referrer, message }) => {
					if (status === 404) return;
					throw new Error(`${status} ${path} (linked from ${referrer}): ${message}`);
				}
			}
		})
	]
});
