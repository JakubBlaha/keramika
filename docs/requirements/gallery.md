# GALLERY requirements

The gallery page `/galerie`: every product instance as a photo, grouped by
product, with a fullscreen view that carries stock status and purchase links.

### REQ-GALLERY-001 - Gallery shows every instance grouped by product

- Status: implemented
- Priority: must
- Source: user, 2026-09-27
- Description: `/galerie` shows one photo per product instance (available and sold), in a separate section per product.
- Acceptance:
  - Given the catalog products and their instances
  - When `/galerie` renders
  - Then each product with instances has its own section headed by the localized product name
  - And each section shows one photo for every instance of that product, including sold ones
- Test: tests/e2e/gallery.spec.ts > REQ-GALLERY-001

### REQ-GALLERY-002 - Grid is photos only

- Status: implemented
- Priority: should
- Source: user, 2026-09-27
- Description: Outside the fullscreen view, the gallery shows no stock status and no buy or product links.
- Acceptance:
  - Given the gallery page with no photo opened
  - When it renders
  - Then no in-stock/sold status, buy link or view-product link is visible
- Test: tests/e2e/gallery.spec.ts > REQ-GALLERY-002

### REQ-GALLERY-003 - Fullscreen view of a photo

- Status: implemented
- Priority: must
- Source: user, 2026-09-27
- Description: Activating a gallery photo opens it full screen; the view can be closed and stepped through.
- Acceptance:
  - Given the gallery page
  - When the user activates a photo
  - Then that instance's photo is shown in a fullscreen dialog
  - And pressing Escape or the close button closes it
  - And the previous/next controls (and Left/Right arrow keys) move to the neighbouring instance, wrapping around at the ends
- Test: tests/e2e/gallery.spec.ts > REQ-GALLERY-003

### REQ-GALLERY-004 - Fullscreen view shows stock status

- Status: implemented
- Priority: must
- Source: user, 2026-09-27
- Description: The fullscreen view shows whether the instance is in stock or already sold.
- Acceptance:
  - Given an available instance opened full screen, the status reads "Skladem" / "In stock" with its price
  - Given a sold instance opened full screen, the status reads "Prodáno" / "Sold"
- Test: tests/e2e/gallery.spec.ts > REQ-GALLERY-004

### REQ-GALLERY-005 - Buy link for an available instance

- Status: implemented
- Priority: must
- Source: user, 2026-09-27
- Description: In the fullscreen view, an available instance has a link that puts that exact piece in the cart and opens the cart.
- Acceptance:
  - Given an available instance opened full screen
  - When the user follows the buy link
  - Then that instance is in the cart and the cart page is shown
  - And no view-product link is shown for it
- Test: tests/e2e/gallery.spec.ts > REQ-GALLERY-005
- Related: REQ-CART-004

### REQ-GALLERY-006 - Product link for a sold instance

- Status: implemented
- Priority: must
- Source: user, 2026-09-27
- Description: In the fullscreen view, a sold instance has a link to its product detail page instead of a buy link.
- Acceptance:
  - Given a sold instance opened full screen
  - When it renders
  - Then a link to `/produkt/<slug>` of its product is shown and no buy link is shown
- Test: tests/e2e/gallery.spec.ts > REQ-GALLERY-006

### REQ-GALLERY-007 - Gallery is in the main navigation

- Status: implemented
- Priority: should
- Source: user, 2026-09-27
- Description: The header navigation links to the gallery in the active locale.
- Acceptance:
  - Given any public page
  - When the header renders
  - Then it contains a "Galerie" / "Gallery" link to `/galerie` (`/en/galerie` in English)
- Test: tests/e2e/gallery.spec.ts > REQ-GALLERY-007
