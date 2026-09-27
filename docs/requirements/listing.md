# LISTING requirements

The categories landing page `/produkty` and the per-category listing
`/produkty/[category]`.

### REQ-LISTING-001 - Categories landing page

- Status: verified
- Priority: must
- Source: spec
- Description: `/produkty` shows a grid of categories, each with an image, name, description and product count.
- Acceptance:
  - Given the catalog categories
  - When `/produkty` renders
  - Then each category card links to its listing and shows a cover image, localized name, description and product count
- Test: tests/e2e/listing.spec.ts > REQ-LISTING-001

### REQ-LISTING-002 - Category product listing

- Status: verified
- Priority: must
- Source: spec
- Description: `/produkty/[category]` shows all products in that category, with a back link and an empty state.
- Acceptance:
  - Given a category with products
  - When its listing renders
  - Then each product card links to the product detail page
  - And given an empty category, an empty-state message is shown
  - And a back link points to the categories landing page
- Test: tests/e2e/listing.spec.ts > REQ-LISTING-002

### REQ-LISTING-003 - Product cards show image, name, meta, price

- Status: verified
- Priority: should
- Source: spec (section 7)
- Description: A product card shows a square cover image, name, meta line and price.
- Acceptance:
  - Given a product card in any grid
  - When it renders
  - Then it shows a square cover image, the product name, its meta line and its price in CZK
- Test: tests/e2e/listing.spec.ts > REQ-LISTING-003

### REQ-LISTING-004 - Last-piece and sold-out badges

- Status: verified
- Priority: should
- Source: user, 2026-09-12
- Description: Product cards show a badge when only the last piece is available or when the product is sold out.
- Acceptance:
  - Given a product with exactly 1 available instance, its card shows a last-piece badge
  - Given a product with 0 available instances, its card shows a sold-out badge
  - Given a product with 2 or more available instances, its card shows no badge
- Test: tests/e2e/listing.spec.ts > REQ-LISTING-004

### REQ-LISTING-005 - Responsive grid column counts

- Status: draft
- Priority: should
- Source: spec (section 8)
- Description: Product/category grids use 2 columns on mobile, 3 on tablet and 4 on desktop.
- Acceptance:
  - Given a grid of cards
  - When the viewport is below 768px, 2 columns are shown
  - When between 768 and 1199px, 3 columns are shown
  - When 1200px or wider, 4 columns are shown
- Test: tests/e2e/listing.spec.ts > REQ-LISTING-005 (todo)

### REQ-LISTING-006 - All-products view

- Status: draft
- Priority: should
- Source: spec / TODO
- Description: `/produkty` offers an "all products" view that lists every product, not only categories.
- Acceptance:
  - Given the catalog
  - When the all-products view is selected on `/produkty`
  - Then a grid of every product across all categories is shown
- Test: tests/e2e/listing.spec.ts > REQ-LISTING-006 (todo)

### REQ-LISTING-007 - Product filtering

- Status: draft
- Priority: could
- Source: spec (section 5)
- Description: Products can be filtered by category (mutually exclusive), size and glaze, with URL-synced state.
- Acceptance:
  - Given the product listing
  - When the user applies size or glaze filters
  - Then only matching products are shown and the filter state is reflected in the URL
- Test: tests/e2e/listing.spec.ts > REQ-LISTING-007 (todo)

### REQ-LISTING-008 - Card hover previews up to four pieces

- Status: implemented
- Priority: could
- Source: user, 2026-09-27
- Description: Hovering a product card with a mouse zooms the cover photo out into a grid showing up to four pieces of that product.
- Acceptance:
  - Given a product card whose product has 2 or more pieces
  - When the visitor hovers it with a mouse
  - Then the tile zooms out (a pure scale transform, no fade) into a grid of min(pieces, 4) photos, available pieces first (sold ones greyed), starting from the cover photo
  - And moving the pointer away returns the tile to the cover photo
  - And a product with a single piece shows no grid
- Test: tests/e2e/listing.spec.ts > REQ-LISTING-008
