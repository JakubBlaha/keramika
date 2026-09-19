# Keramika Requirements

This directory is the source of truth for what the keramika eshop must do. Each
requirement is atomic, uniquely identified, and written so a Playwright test can
verify it later.

Requirements are captured with the `requirements-authoring` skill
(`.verorules/skills/requirements-authoring/`). Read that skill before adding or
editing requirements.

## Format

Each requirement is a block in an area file:

```markdown
### REQ-CATALOG-001 - Multiple images per instance

- Status: implemented
- Priority: must
- Source: user, 2026-09-12
- Description: Each product instance can hold one or more images.
- Acceptance:
  - Given a product instance that has N image files
  - When the product detail page renders that instance
  - Then the main image is shown, and a thumbnail strip appears when N > 1
- Test: tests/e2e/catalog.spec.ts > REQ-CATALOG-001 (todo)
```

- **ID**: `REQ-<AREA>-<NNN>`, permanent, never reused or renumbered.
- **Status**: `draft` | `approved` | `implemented` | `verified` | `removed`.
- **Priority**: `must` | `should` | `could`.
- **Acceptance**: Given/When/Then, observable outcomes.
- **Test**: intended Playwright spec + title; `(todo)` until the test exists.

## Testing

Tests are Playwright e2e specs under `tests/e2e/`, one file per area. Every test
title includes the requirement ID so traceability is greppable, e.g.

```ts
test('REQ-CATALOG-001 - shows thumbnail strip for multi-image instance', async ({ page }) => { ... });
```

A requirement is `verified` only once a passing test references its ID. Writing
tests is a separate task from capturing requirements.

## Area files

| Area     | File                                     | Scope                                                                          |
| -------- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| CATALOG  | [catalog.md](./catalog.md)               | Data model, products, instances, availability                                  |
| PRODUCT  | [product-detail.md](./product-detail.md) | `/produkt/[slug]` detail page                                                  |
| LISTING  | [listing.md](./listing.md)               | `/produkty` and `/produkty/[category]`                                         |
| HOME     | [home.md](./home.md)                     | Homepage                                                                       |
| CART     | [cart.md](./cart.md)                     | `/cart`                                                                        |
| CHECKOUT | [checkout.md](./checkout.md)             | `/objednavka`                                                                  |
| ADMIN    | [admin.md](./admin.md)                   | Admin area: Firebase-backed login and product / instance / category management |
| API      | [api.md](./api.md)                       | Catalog management API used by the admin UI and seeding (Firebase-backed)      |
| I18N     | [i18n.md](./i18n.md)                     | Localization rules                                                             |
| BUILD    | [build.md](./build.md)                   | Build / quality / workflow rules                                               |
| CONTENT  | [content.md](./content.md)               | Content, assets, SEO                                                           |
| A11Y     | [a11y.md](./a11y.md)                     | Accessibility                                                                  |
| DESIGN   | [design.md](./design.md)                 | Visual design direction                                                        |

## Coverage table

| ID               | Title                                                    | Status      | Test                             |
| ---------------- | -------------------------------------------------------- | ----------- | -------------------------------- |
| REQ-CATALOG-001  | Multiple images per instance                             | verified    | tests/e2e/catalog.spec.ts        |
| REQ-CATALOG-002  | Product is a blueprint with unique instances             | verified    | tests/e2e/catalog.spec.ts        |
| REQ-CATALOG-003  | Each instance is sold exactly once                       | approved    | todo                             |
| REQ-CATALOG-004  | Product availability equals count of available instances | verified    | tests/e2e/catalog.spec.ts        |
| REQ-CATALOG-005  | Cover image comes from first available instance          | verified    | tests/e2e/catalog.spec.ts        |
| REQ-CATALOG-006  | Copy fields are localized, data fields are neutral       | verified    | tests/e2e/catalog.spec.ts        |
| REQ-CATALOG-007  | Products are grouped into categories                     | verified    | tests/e2e/catalog.spec.ts        |
| REQ-CATALOG-008  | Related products come from the same category             | verified    | tests/e2e/catalog.spec.ts        |
| REQ-CATALOG-009  | Product data model fields                                | draft       | todo                             |
| REQ-PRODUCT-001  | Image gallery follows the selected instance              | verified    | tests/e2e/product-detail.spec.ts |
| REQ-PRODUCT-002  | Instance picker lets the buyer choose a piece            | verified    | tests/e2e/product-detail.spec.ts |
| REQ-PRODUCT-003  | Sold instances are not selectable                        | verified    | tests/e2e/product-detail.spec.ts |
| REQ-PRODUCT-004  | Availability text reflects stock                         | verified    | tests/e2e/product-detail.spec.ts |
| REQ-PRODUCT-005  | Specifications are shown                                 | verified    | tests/e2e/product-detail.spec.ts |
| REQ-PRODUCT-006  | About/Care/Shipping accordion                            | verified    | tests/e2e/product-detail.spec.ts |
| REQ-PRODUCT-007  | Add to cart requires an available selected instance      | verified    | tests/e2e/product-detail.spec.ts |
| REQ-PRODUCT-008  | Related products section                                 | verified    | tests/e2e/product-detail.spec.ts |
| REQ-PRODUCT-009  | Back link to the category                                | verified    | tests/e2e/product-detail.spec.ts |
| REQ-LISTING-001  | Categories landing page                                  | verified    | tests/e2e/listing.spec.ts        |
| REQ-LISTING-002  | Category product listing                                 | verified    | tests/e2e/listing.spec.ts        |
| REQ-LISTING-003  | Product cards show image, name, meta, price              | verified    | tests/e2e/listing.spec.ts        |
| REQ-LISTING-004  | Last-piece and sold-out badges                           | verified    | tests/e2e/listing.spec.ts        |
| REQ-LISTING-005  | Responsive grid column counts                            | draft       | todo                             |
| REQ-LISTING-006  | All-products view                                        | draft       | todo                             |
| REQ-LISTING-007  | Product filtering                                        | draft       | todo                             |
| REQ-HOME-001     | Hero with headline and CTA                               | verified    | tests/e2e/home.spec.ts           |
| REQ-HOME-002     | Value propositions                                       | verified    | tests/e2e/home.spec.ts           |
| REQ-HOME-003     | Featured products grid                                   | verified    | tests/e2e/home.spec.ts           |
| REQ-HOME-004     | About teaser                                             | verified    | tests/e2e/home.spec.ts           |
| REQ-CART-001     | Cart lists selected instances                            | verified    | tests/e2e/cart.spec.ts           |
| REQ-CART-002     | Cart summary totals                                      | verified    | tests/e2e/cart.spec.ts           |
| REQ-CART-003     | Empty cart state                                         | verified    | tests/e2e/cart.spec.ts           |
| REQ-CART-004     | An instance can be in at most one cart/order             | verified    | tests/e2e/cart.spec.ts           |
| REQ-CART-005     | Remove an instance from the cart                         | verified    | tests/e2e/cart.spec.ts           |
| REQ-CART-006     | No quantity editing for cart lines                       | verified    | tests/e2e/cart.spec.ts           |
| REQ-CHECKOUT-001 | Order summary                                            | draft       | todo                             |
| REQ-CHECKOUT-002 | Contact information form                                 | draft       | todo                             |
| REQ-CHECKOUT-003 | Shipping method selection                                | removed     | todo                             |
| REQ-CHECKOUT-004 | Payment method selection                                 | removed     | todo                             |
| REQ-CHECKOUT-005 | Terms acceptance required                                | draft       | todo                             |
| REQ-CHECKOUT-006 | Order confirmation                                       | draft       | todo                             |
| REQ-CHECKOUT-007 | Pickup in store is the only fulfillment                  | draft       | todo                             |
| REQ-CHECKOUT-008 | Pay in store is the only payment                         | draft       | todo                             |
| REQ-CHECKOUT-009 | Site is a reservation, not a paid sale                   | draft       | todo                             |
| REQ-CHECKOUT-010 | Place the reservation                                    | draft       | todo                             |
| REQ-ADMIN-001    | Dedicated admin area reachable only by URL               | draft       | todo                             |
| REQ-ADMIN-002    | Admin area requires authentication                       | implemented | todo                             |
| REQ-ADMIN-003    | Admin login                                              | implemented | todo                             |
| REQ-ADMIN-004    | Admin logout                                             | implemented | todo                             |
| REQ-ADMIN-005    | List products in admin                                   | draft       | todo                             |
| REQ-ADMIN-006    | Create a product                                         | draft       | todo                             |
| REQ-ADMIN-007    | Edit a product                                           | draft       | todo                             |
| REQ-ADMIN-008    | Delete a product                                         | draft       | todo                             |
| REQ-ADMIN-009    | List a product's instances in admin                      | draft       | todo                             |
| REQ-ADMIN-010    | Create a product instance                                | draft       | todo                             |
| REQ-ADMIN-011    | Edit a product instance                                  | draft       | todo                             |
| REQ-ADMIN-012    | Delete a product instance                                | draft       | todo                             |
| REQ-ADMIN-013    | List categories in admin                                 | draft       | todo                             |
| REQ-ADMIN-014    | Create a category                                        | draft       | todo                             |
| REQ-ADMIN-015    | Edit a category                                          | draft       | todo                             |
| REQ-ADMIN-016    | Delete a category                                        | draft       | todo                             |
| REQ-ADMIN-017    | Authentication via Firebase Authentication               | implemented | todo                             |
| REQ-ADMIN-018    | Catalog data stored in Cloud Firestore                   | draft       | todo                             |
| REQ-ADMIN-019    | Instance images stored in Firebase Storage               | draft       | todo                             |
| REQ-ADMIN-020    | List orders in admin                                     | implemented | todo                             |
| REQ-ADMIN-021    | View an order's detail                                   | implemented | todo                             |
| REQ-ADMIN-022    | Mark an order as resolved or cancelled                   | implemented | todo                             |
| REQ-API-001      | Single catalog write API shared by UI and seeding        | implemented | todo                             |
| REQ-API-002      | Write endpoints require an authenticated admin           | implemented | todo                             |
| REQ-API-003      | List and read endpoints for catalog entities             | implemented | todo                             |
| REQ-API-004      | Create/update/delete a category                          | implemented | todo                             |
| REQ-API-005      | Create/update/delete a product                           | implemented | todo                             |
| REQ-API-006      | Create/update/delete a product instance                  | implemented | todo                             |
| REQ-API-007      | Upload instance images                                   | implemented | todo                             |
| REQ-API-008      | Payload validation and error responses                   | implemented | todo                             |
| REQ-API-009      | Slug uniqueness enforced                                 | implemented | todo                             |
| REQ-API-010      | Bulk import (seed) endpoint                              | implemented | todo                             |
| REQ-API-011      | Seed the initial catalog through the API                 | implemented | todo                             |
| REQ-API-012      | List orders (admin-only)                                 | draft       | todo                             |
| REQ-API-013      | Read a single order (admin-only)                         | draft       | todo                             |
| REQ-API-014      | Update order status (admin-only)                         | draft       | todo                             |
| REQ-API-015      | Cancelling an order releases its reserved instances      | draft       | todo                             |
| REQ-I18N-001     | Czech default, English prefixed                          | verified    | tests/e2e/i18n.spec.ts           |
| REQ-I18N-002     | All copy via message functions in both locales           | verified    | tests/e2e/i18n.spec.ts           |
| REQ-I18N-003     | Internal links respect the active locale                 | verified    | tests/e2e/i18n.spec.ts           |
| REQ-I18N-004     | Every route prerenders in both locales                   | verified    | tests/e2e/i18n.spec.ts           |
| REQ-BUILD-001    | check, lint and build must pass                          | verified    | tests/e2e/build.spec.ts          |
| REQ-BUILD-002    | Do not run the dev server                                | implemented | n/a                              |
| REQ-BUILD-003    | Style with Tailwind CSS v4                               | verified    | tests/e2e/build.spec.ts          |
| REQ-CONTENT-001  | Real square product photography                          | draft       | todo                             |
| REQ-CONTENT-002  | Per-page title and meta description                      | verified    | tests/e2e/content.spec.ts        |
| REQ-A11Y-001     | Images have alt text                                     | verified    | tests/e2e/a11y.spec.ts           |
| REQ-A11Y-002     | Interactive controls are keyboard accessible             | draft       | todo                             |
| REQ-DESIGN-001   | Warm, earthy color palette                               | verified    | tests/e2e/design.spec.ts         |
| REQ-DESIGN-002   | Display headings, sans-serif body                        | verified    | tests/e2e/design.spec.ts         |
| REQ-DESIGN-003   | Minimal, uncluttered visual style                        | draft       | todo                             |
| REQ-DESIGN-004   | Tech stack and data strategy                             | removed     | n/a                              |
| REQ-DESIGN-005   | Tech stack and Firebase data strategy                    | draft       | n/a                              |
