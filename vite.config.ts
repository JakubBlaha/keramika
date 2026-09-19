import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { defineConfig } from 'vite';

export default defineConfig({
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

			// Deploying to Vercel. Most public routes are prerendered (see
			// `export const prerender = true` in their +page.ts); the write API
			// under /api/* and the admin UI under /admin/* are dynamic
			// (prerender = false) and run as Vercel serverless functions.
			// The runtime is pinned explicitly because adapter-vercel otherwise
			// infers it from the local Node version at build time, which breaks
			// on Node versions newer than what Vercel currently supports.
			adapter: adapter({ runtime: 'nodejs22.x' }),

			prerender: {
				// The crawler starts from "/" (Czech). Seed the English locale root so
				// the /en/* pages are discovered and prerendered as well.
				entries: ['*', '/en'],

				// The homepage links to shop/legal routes that are not built yet
				// (o-nas, obchodni-podminky, ...). Ignore those missing links during
				// prerender instead of failing the build.

				handleHttpError: ({ status, path, referrer, message }) => {
					if (status === 404) return;
					throw new Error(`${status} ${path} (linked from ${referrer}): ${message}`);
				}
			}
		})
	]
});
