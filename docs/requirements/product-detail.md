# PRODUCT requirements

Behavior of the product detail page `/produkt/[slug]`
(`src/routes/produkt/[slug]/+page.svelte`).

### REQ-PRODUCT-001 - Image gallery follows the selected instance

- Status: verified
- Priority: must
- Source: user, 2026-09-12
- Description: The gallery shows the images of the currently selected instance, with thumbnails when the instance has more than one image.
- Acceptance:
  - Given a product with a selected instance that has N images
  - When the detail page renders
  - Then the main image is the selected instance's active image
  - And a thumbnail strip is shown only when N > 1
  - And clicking a thumbnail changes the main image
- Test: tests/e2e/product-detail.spec.ts > REQ-PRODUCT-001

### REQ-PRODUCT-002 - Instance picker lets the buyer choose a piece

- Status: verified
- Priority: must
- Source: user, 2026-09-12
- Description: When a product is not sold out, the buyer can pick which unique instance to buy.
- Acceptance:
  - Given a product with at least one available instance
  - When the detail page renders
  - Then an instance picker lists the instances, the first available one is selected by default
  - And selecting an available instance updates the gallery and the current price
- Test: tests/e2e/product-detail.spec.ts > REQ-PRODUCT-002

### REQ-PRODUCT-003 - Sold instances are not selectable

- Status: verified
- Priority: must
- Source: user, 2026-09-12
- Description: Instances that are already sold are shown as sold and cannot be selected.
- Acceptance:
  - Given a product with a sold instance
  - When the instance picker renders
  - Then the sold instance is disabled, visually de-emphasized, and labeled as sold
- Test: tests/e2e/product-detail.spec.ts > REQ-PRODUCT-003

### REQ-PRODUCT-004 - Availability text reflects stock

- Status: verified
- Priority: should
- Source: user, 2026-09-12
- Description: The page shows availability text that adapts to how many pieces remain.
- Acceptance:
  - Given a product
  - When it has 0 available instances, the page shows a sold-out message
  - When it has exactly 1, the page shows a last-piece message
  - When it has more than 1, the page shows the available-of-total count
- Test: tests/e2e/product-detail.spec.ts > REQ-PRODUCT-004

### REQ-PRODUCT-005 - Specifications are shown

- Status: verified
- Priority: should
- Source: spec
- Description: The detail page lists product specifications (size).
- Acceptance:
  - Given a product
  - When the detail page renders
  - Then a specifications block shows at least the size
- Test: tests/e2e/product-detail.spec.ts > REQ-PRODUCT-005

### REQ-PRODUCT-006 - About/Care/Shipping accordion

- Status: verified
- Priority: should
- Source: spec
- Description: The detail page has expandable About, Care and Shipping sections, one open at a time.
- Acceptance:
  - Given the detail page
  - When a section header is clicked
  - Then that section expands and any previously open section collapses
- Test: tests/e2e/product-detail.spec.ts > REQ-PRODUCT-006

### REQ-PRODUCT-007 - Add to cart requires an available selected instance

- Status: verified
- Priority: must
- Source: user, 2026-09-12
- Description: The add-to-cart action is only enabled when an available instance is selected.
- Acceptance:
  - Given a product
  - When it is sold out or no available instance is selected
  - Then the add-to-cart button is disabled
  - And when an available instance is selected, the button is enabled
- Test: tests/e2e/product-detail.spec.ts > REQ-PRODUCT-007

### REQ-PRODUCT-008 - Related products section

- Status: verified
- Priority: could
- Source: spec
- Description: The detail page shows a grid of related products with cover image, name, meta and price.
- Acceptance:
  - Given a product with related products
  - When the detail page renders
  - Then a related-products grid links to each related product's detail page
  - And sold-out or last-piece badges are shown per related product
- Test: tests/e2e/product-detail.spec.ts > REQ-PRODUCT-008

### REQ-PRODUCT-009 - Back link to the category

- Status: verified
- Priority: could
- Source: spec
- Description: The detail page has a link back to the product's category listing.
- Acceptance:
  - Given a product in a category
  - When the detail page renders
  - Then a back link points to that category's listing page
- Test: tests/e2e/product-detail.spec.ts > REQ-PRODUCT-009
