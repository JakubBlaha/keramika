# DESIGN requirements

Visual design direction. Migrated from the original page specification. Concrete
design tokens live in `src/routes/layout.css`; these requirements capture intent.

### REQ-DESIGN-001 - Warm, earthy color palette

- Status: verified
- Priority: should
- Source: spec (section 9)
- Description: The site uses a warm, earthy palette (off-white background, earthy dark ink, terracotta accent, sage secondary).
- Acceptance:
  - Given any page
  - When it renders
  - Then the background is a warm off-white, the primary ink is an earthy dark, the accent is a terracotta/warm clay, and a sage secondary is used for highlights
- Test: tests/e2e/design.spec.ts > REQ-DESIGN-001

### REQ-DESIGN-002 - Display headings, sans-serif body

- Status: verified
- Priority: should
- Source: spec (section 9)
- Description: Headings use a display/serif font for an artisanal feel; body copy uses a clean sans-serif.
- Acceptance:
  - Given any page
  - When it renders
  - Then headings use the display font and body text uses the sans-serif body font
- Test: tests/e2e/design.spec.ts > REQ-DESIGN-002

### REQ-DESIGN-003 - Minimal, uncluttered visual style

- Status: draft
- Priority: could
- Source: spec (section 9)
- Description: The layout is minimal with generous whitespace, product photography on neutral backgrounds, and subtle hover animations.
- Acceptance:
  - Given a page with product imagery
  - When it renders
  - Then it favors whitespace over clutter, shows photography on neutral backgrounds, and cards use subtle hover animations
- Test: tests/e2e/design.spec.ts > REQ-DESIGN-003 (todo)

### REQ-DESIGN-004 - Tech stack and data strategy

- Status: removed
- Priority: should
- Source: spec (section 10)
- Description: The MVP is built on SvelteKit with Tailwind styling, catalog data held in-repo (no backend), and a client-side cart; deployment via a static or node adapter.
- Acceptance:
  - Given the project
  - When it is built and run
  - Then the app uses SvelteKit + Tailwind, sources catalog data from in-repo files with no backend, and keeps the cart in client-side state
- Test: n/a (architectural constraint; verified via build/config)
- Note: Superseded by REQ-DESIGN-005. Catalog data now lives in Firebase (see REQ-ADMIN-018/019).

### REQ-DESIGN-005 - Tech stack and Firebase data strategy

- Status: draft
- Priority: should
- Source: user, 2026-09-12
- Description: The app is built on SvelteKit with Tailwind styling; catalog data (products, instances, categories) is stored in Firebase (Cloud Firestore + Firebase Storage) with Firebase Authentication for admins, and the cart is client-side.
- Acceptance:
  - Given the project
  - When it is built and run
  - Then the app uses SvelteKit + Tailwind, sources catalog data from Cloud Firestore and instance images from Firebase Storage, authenticates admins via Firebase Authentication, and keeps the cart in client-side state
- Test: n/a (architectural constraint; verified via build/config)
- Related: REQ-ADMIN-017, REQ-ADMIN-018, REQ-ADMIN-019
