# CATALOG requirements

Data model, products, instances, and availability. The catalog is stored in
Cloud Firestore (model: `src/lib/catalog-model.ts`); the public site reads it
per request (`src/lib/server/publicCatalog.ts`) into the view types of
`src/lib/catalog.ts`. There are no built-in products: local databases get
their catalog from `pnpm seed` (`scripts/seed-data/`).

### REQ-CATALOG-001 - Multiple images per instance

- Status: implemented
- Priority: must
- Source: user, 2026-09-12
- Description: Each product instance can hold one or more images.
- Acceptance:
  - Given a product instance defined with an ordered list of image files
  - When the catalog exposes that instance
  - Then the instance has an `images` array in that order, and it may contain more than one entry
- Test: none (not functional behaviour; outside the e2e scope)

### REQ-CATALOG-002 - Product is a blueprint with unique instances

- Status: verified
- Priority: must
- Source: user, 2026-09-12
- Description: A product is a blueprint; its stock is a set of unique physical instances.
- Acceptance:
  - Given a hand-made product where every piece differs
  - When the product is modelled in the catalog
  - Then it has a list of instances, each with its own id, label, images and availability
- Test: tests/e2e/product-detail.spec.ts > REQ-PRODUCT-002

### REQ-CATALOG-003 - Each instance is sold exactly once

- Status: approved
- Priority: must
- Source: user, 2026-09-12
- Description: An instance represents a single physical piece that can be sold only once.
- Acceptance:
  - Given an instance that has been sold
  - When stock is evaluated
  - Then that instance is marked unavailable and cannot be sold again
- Test: tests/e2e/catalog.spec.ts > REQ-CATALOG-003 (todo)

### REQ-CATALOG-004 - Product availability equals count of available instances

- Status: verified
- Priority: must
- Source: user, 2026-09-12
- Description: A product's availability is the number of its still-available instances.
- Acceptance:
  - Given a product with A available instances out of T total
  - When availability is computed
  - Then availableCount returns A and totalCount returns T
- Test: tests/e2e/product-detail.spec.ts > REQ-PRODUCT-004

### REQ-CATALOG-005 - Cover image comes from first available instance

- Status: implemented
- Priority: should
- Source: user, 2026-09-12
- Description: A product's thumbnail is the first image of its first available instance, falling back to the first instance.
- Acceptance:
  - Given a product with at least one available instance
  - When the cover image is requested
  - Then it returns the first image of the first available instance
  - And given no available instance, it returns the first image of the first instance
- Test: none (not functional behaviour; outside the e2e scope)

### REQ-CATALOG-006 - Copy fields are localized, data fields are neutral

- Status: verified
- Priority: must
- Source: TODO / spec; updated user, 2026-09-28
- Description: Copy fields (name, meta, description, care) are stored per locale ({ cs, en }) and shown in the active locale; language-neutral data (price, slug, size, images) is shared.
- Acceptance:
  - Given a product in the catalog
  - When it is rendered in cs or en
  - Then name/meta/description/care are shown in that locale, while price/slug/size/images are identical across locales
- Test: tests/e2e/catalog.spec.ts > REQ-CATALOG-006

### REQ-CATALOG-007 - Products are grouped into categories

- Status: verified
- Priority: must
- Source: spec
- Description: Every product belongs to exactly one category identified by a slug.
- Acceptance:
  - Given the catalog
  - When categories are listed
  - Then each category has a slug, localized name and description, and a list of products
- Test: tests/e2e/listing.spec.ts > REQ-LISTING-002

### REQ-CATALOG-008 - Related products come from the same category

- Status: verified
- Priority: should
- Source: spec
- Description: Related products for a product are drawn from its category, filling from other categories if needed.
- Acceptance:
  - Given a product and a limit N
  - When related products are requested
  - Then up to N other products from the same category are returned, topped up from other categories if the category has fewer than N
- Test: tests/e2e/catalog.spec.ts > REQ-CATALOG-008

### REQ-CATALOG-009 - Product data model fields

- Status: draft
- Priority: should
- Source: spec (section 6)
- Description: The full product data model includes glaze, weight and featured fields beyond the current implementation.
- Acceptance:
  - Given the target product data model
  - When a product is defined
  - Then it can carry optional glaze, weight, care and featured attributes in addition to name/slug/description/price/images/category/size
- Test: tests/e2e/catalog.spec.ts > REQ-CATALOG-009 (todo)

### REQ-CATALOG-010 - The public site shows the catalog stored in the database

- Status: verified
- Priority: must
- Source: user, 2026-09-28
- Description: Every public page that shows categories, products or instances reads them from the database at request time; the site has no built-in catalog.
- Acceptance:
  - Given an admin creates a category and a product in it
  - When a visitor then opens that category's listing and the product's detail page
  - Then both show the new category and product, without a rebuild or redeploy
- Test: tests/e2e/admin.spec.ts > REQ-CATALOG-010
