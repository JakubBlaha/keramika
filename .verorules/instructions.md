# Project Instructions

## Development Server

- Do NOT run `pnpm dev`, `pnpm preview`, or any dev/preview server command. The user always runs the dev server separately in their own terminal.
- To verify changes, use non-serving commands only: `pnpm check`, `pnpm lint`, and `pnpm build`.

## Styling

- Use Tailwind CSS (v4) for styling from now on. Tailwind is installed via `@tailwindcss/vite` (wired in `vite.config.ts`) and imported at the top of `src/routes/layout.css` with `@import 'tailwindcss'`.
- Prefer Tailwind utility classes over adding new bespoke CSS. Existing design tokens live as CSS custom properties in `src/routes/layout.css`.

## Internationalization (i18n)

- The site is multilingual using **Paraglide JS** (`@inlang/paraglide-js`). Locales: `cs` (default/base) and `en`.
- URL strategy: Czech has no prefix (`/`, `/produkty`), English is prefixed (`/en`, `/en/produkty`). The underlying SvelteKit route files stay language-neutral; `src/hooks.ts` (reroute) de-localizes URLs.
- All user-facing copy must go through message functions, NOT hardcoded strings. Add keys to BOTH `messages/cs.json` and `messages/en.json`, then use them via `import { m } from '$lib/paraglide/messages'` and call `m.key()`.
- For internal links, wrap paths with `localizeHref('/path')` from `$lib/paraglide/runtime` so they respect the active locale.
- `src/lib/paraglide/` is generated output (git-ignored). It is compiled by the Vite plugin on dev/build and by the `prepare` script; do not edit it by hand.
