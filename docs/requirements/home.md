# HOME requirements

The homepage `/` (`src/routes/+page.svelte`).

### REQ-HOME-001 - Hero with headline and CTA

- Status: verified
- Priority: must
- Source: spec
- Description: The homepage opens with a hero showing a headline and a call-to-action linking to the products page.
- Acceptance:
  - Given the homepage
  - When it renders
  - Then a hero shows the headline copy and a CTA link to `/produkty`
- Test: tests/e2e/home.spec.ts > REQ-HOME-001

### REQ-HOME-002 - Value propositions

- Status: verified
- Priority: should
- Source: spec
- Description: The homepage lists the brand value propositions.
- Acceptance:
  - Given the homepage
  - When it renders
  - Then a value-propositions section shows the handmade, own-designs and one-of-a-kind values
- Test: tests/e2e/home.spec.ts > REQ-HOME-002

### REQ-HOME-003 - Featured products grid

- Status: verified
- Priority: should
- Source: spec
- Description: The homepage shows a grid of featured products linking to their detail pages.
- Acceptance:
  - Given the catalog has products
  - When the homepage renders
  - Then a featured grid shows several product cards, each linking to its detail page
  - And a link to all products is shown
- Test: tests/e2e/home.spec.ts > REQ-HOME-003

### REQ-HOME-004 - About teaser

- Status: verified
- Priority: could
- Source: spec
- Description: The homepage includes an about teaser linking to the about page.
- Acceptance:
  - Given the homepage
  - When it renders
  - Then an about teaser shows a short intro and a link to `/o-nas`
- Test: tests/e2e/home.spec.ts > REQ-HOME-004
