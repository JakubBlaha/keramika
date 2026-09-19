# Keramika E-shop — Implementation TODO

Status snapshot and roadmap to a shippable e-shop. Grounded in the testable
requirements in `docs/requirements/`, reflecting the decisions made since
(Tailwind v4, Paraglide i18n cs/en).

> Testable, per-behavior requirements live in `docs/requirements/` (IDs like
> `REQ-CATALOG-001`). Capture new requirements with the `requirements-authoring`
> skill. This TODO stays as the high-level roadmap.

Legend: [x] done · [~] partial · [ ] not started

---

## 0. Foundations (mostly done)

- [x] SvelteKit + Svelte 5 (runes) project
- [x] Tailwind CSS v4 wired in (`@tailwindcss/vite`), tokens in `layout.css`
- [x] Paraglide i18n: `cs` (no prefix) + `en` (`/en`), reroute hooks, lang switcher
- [x] Prerendering configured (both locales), 404s ignored for unbuilt routes
- [x] Demo/template scaffolding removed (sverdle, demo about, demo images)
- [x] Decide + install the final adapter — deploying to Vercel via `@sveltejs/adapter-vercel` (pinned `nodejs22.x` runtime)

---

## 1. Data model & catalog

The spec (section 6) defines a richer product model than the current placeholder.

- [x] `src/lib/catalog.ts` exists with categories + products
- [x] Extended `Product` model: `description`, `size`, `material`, `care`
      (copy via Paraglide). Still to add: `images[]`, `glaze?`, `weight?`,
      `featured?`
- [x] Product-as-blueprint model: each `Product` has unique `instances`
      (each `ProductInstance` sold once). Helpers `availableCount`,
      `totalCount`. Detail page has an instance picker; listings show
      "last piece"/"sold out" badges
- [ ] Per-instance photos and per-instance notes/price (currently placeholder swatches)
- [ ] Enforce stock at cart/checkout: an instance can only be in one cart/order
- [ ] Extend `Category` with any needed metadata (hero image, sort order)
- [x] Copy-heavy fields (name/description/care) go through Paraglide (cs/en);
      language-neutral data (price, slug, size, swatch) stays in the catalog
- [ ] Add a real product set (replace placeholder items) + real images
- [x] Helper functions: `getProduct(slug)`, `getRelated(slug)`, `allProducts()`

---

## 2. Pages / routes

Per the spec page map. Existing routes marked done.

- [x] `/` Homepage (hero, values, featured, about teaser)
- [x] `/produkty` Category chooser
- [x] `/produkty/[category]` Product listing for a category
- [ ] `/produkty` — add "VŠE / All products" view (grid of all products, not just categories)
- [x] `/produkt/[slug]` Product detail page (gallery, price, specs,
      accordions, quantity + add-to-cart placeholder, related products)
- [x] `/o-nas` About / story page (hero, story, process, values)
- [x] `/kontakt` Contact page (email/phone click-to-reveal, pickup location)

- [x] `/cart` Cart page (items, summary, empty state)
- [x] `/checkout` Checkout (order summary, contact info, pickup/payment notice, T&C, confirm)
- [ ] `/obchodni-podminky` Terms & conditions (legal content)

- [ ] `/ochrana-osobnich-udaju` Privacy policy (legal content)
- [ ] `/reklamace` Returns & complaints (legal content)
- [ ] Ensure every route prerenders (or has correct entries()) for both locales

Note: Header nav links to `/produkty`, `/o-nas`, `/kontakt`, and the cart
icon links to `/cart` — all of these now exist.

---

## 3. Shared components

- [ ] `ProductCard` component (image, name, material·size, price) — reused on
      homepage, category, all-products, related
- [ ] `ProductGrid` responsive wrapper (2 / 3 / 4 cols per breakpoint)
- [ ] Image component/placeholder strategy (until real photos exist)
- [ ] Accordion component (product detail sections)
- [ ] Quantity selector
- [ ] Breadcrumbs (optional, e.g. Produkty / Kategorie / Produkt)
- [ ] Form field components (input, textarea, radio group) for contact/checkout

---

## 4. Filtering (spec section 5)

- [ ] Category tabs on `/produkty` (VŠE + categories, mutually exclusive)
- [ ] Size filter (Malé / Střední / Velké, multi-select pills)
- [ ] Material filter (Kamenina / Porcelán / Hrnčířská hlína, multi-select)
- [ ] Color/Glaze filter (define once product range is known)
- [ ] URL-synced filter state (query params) so views are shareable/prerender-friendly

---

## 5. Cart & checkout (client-side MVP)

- [x] Cart store (Svelte store persisted to `localStorage`)
- [x] Add to cart / remove item (multi-step undo on remove; no quantity editing — each instance is a unique piece, REQ-CART-006)
- [x] Cart count badge in header
- [x] Cart page wiring (subtotal, shipping estimate, total, empty state)
- [x] Checkout form + validation
- [x] Order submission strategy (client writes a reservation to Firestore via `placeOrder`)
- [x] Order confirmation / thank-you page

---

## 6. Internationalization

- [x] Audit every new page: all copy via `m.*()`, keys in BOTH cs.json and en.json
- [x] Localize all internal links via `localizeHref`
- [ ] Decide on translated slugs vs. shared slugs (currently shared, e.g. `/produkty`)
- [x] Currency/number formatting per locale (CZK, via `m.price_czk()`)

---

## 7. Design & responsiveness

- [x] Desktop layout (3/4-col grids at md/lg on home, listing, category, related)
- [x] Header desktop layout (inline nav instead of only hamburger)
- [ ] Consistent spacing/typography scale via tokens
- [x] Hover animations on cards (accent outline instead of scale, per user preference)
- [ ] Accessibility pass (focus states, alt text, aria, keyboard nav, color contrast)

---

## 8. Content & assets

- [ ] Real product photography (square, neutral background)
- [ ] About page copy + workshop photos
- [ ] Legal page copy (terms, privacy, complaints) — likely needs real/legal text
- [ ] Favicon / social share (OG) images
- [ ] SEO: per-page `<title>`/description, sitemap, robots.txt (robots exists)

---

## 9. Build, deploy, quality

- [x] Choose adapter — `@sveltejs/adapter-vercel`, targeting Vercel serverless functions for `/api/*` and `/admin/*`

- [ ] CI: run `pnpm check`, `pnpm lint`, `pnpm build`
- [ ] Analytics / cookie consent (if required by privacy policy)
- [ ] Performance check (image sizes, lazy loading)
- [ ] Final cross-browser / mobile QA

---

## Suggested next steps (order)

1. Extend the product data model + add a real-ish catalog (section 1).
2. Build `ProductCard`/`ProductGrid` and refactor homepage + listing to use them (section 3).
3. Add the "all products" view + basic category filtering on `/produkty` (sections 2, 4).
4. Build `/produkt/[slug]` product detail (section 2/3).
5. Add cart store + `/cart`, then `/checkout` (section 5).
6. Fill in remaining legal pages (`/ochrana-osobnich-udaju`, `/reklamace`) (sections 2, 8).

7. Desktop/responsive + a11y polish, then ship on Vercel (sections 7, 9).
