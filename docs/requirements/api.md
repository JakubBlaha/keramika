# API requirements

The catalog management API: the single server-side interface for creating,
reading, updating, and deleting categories, products, and product instances,
and for uploading instance images. Both the admin UI (see ADMIN area) and any
data-seeding/import client use this same API, so exercising the API also
exercises the path the admins use.

The API is backed by Firebase (Cloud Firestore for data, Firebase Storage for
images; see REQ-ADMIN-018, REQ-ADMIN-019) and is authorized with Firebase
Authentication admin identities (see REQ-ADMIN-017).

### REQ-API-001 - Single catalog write API shared by UI and seeding

- Status: implemented
- Priority: must
- Source: user, 2026-09-13
- Description: All catalog mutations go through one server-side API; there is no separate write path for seeding versus the admin UI.
- Acceptance:
  - Given a catalog change (create/update/delete of a category, product, or instance)
  - When it is made by the admin UI or by a seeding/import client
  - Then both go through the same API endpoints and validation, writing to the same Firestore collections
- Test: tests/e2e/api.spec.ts > REQ-API-001 (todo)

### REQ-API-002 - Write endpoints require an authenticated admin

- Status: implemented
- Priority: must
- Source: user, 2026-09-13
- Description: Every mutating API endpoint requires a valid admin identity and rejects everyone else.
- Acceptance:
  - Given a request to any create/update/delete endpoint
  - When the caller presents a valid admin credential (Firebase ID token with the admin claim)
  - Then the request is authorized and processed
  - And when the caller is unauthenticated or not an admin, the API responds 401/403 and makes no change
- Test: tests/e2e/api.spec.ts > REQ-API-002 (todo)

### REQ-API-003 - List and read endpoints for catalog entities

- Status: implemented
- Priority: must
- Source: user, 2026-09-13
- Description: The API can list all entities of a type and read a single entity by id/slug.
- Acceptance:
  - Given existing categories, products, and instances
  - When a client requests the collection or a single entity
  - Then the API returns the current data for that entity type from Firestore
- Test: tests/e2e/api.spec.ts > REQ-API-003 (todo)

### REQ-API-004 - Create/update/delete a category

- Status: implemented
- Priority: must
- Source: user, 2026-09-13
- Description: The API supports creating, updating, and deleting a category.
- Acceptance:
  - Given an authenticated admin request with a category payload (slug, localized cs/en name and description)
  - When the category is created or updated
  - Then it is persisted in Firestore and returned in subsequent reads
  - And deleting a category removes it, subject to the same-guard as REQ-ADMIN-016 (a category with products cannot be deleted)
- Test: tests/e2e/api.spec.ts > REQ-API-004 (todo)

### REQ-API-005 - Create/update/delete a product

- Status: implemented
- Priority: must
- Source: user, 2026-09-13
- Description: The API supports creating, updating, and deleting a product.
- Acceptance:
  - Given an authenticated admin request with a product payload (slug, category, price, localized cs/en copy, and product data fields)
  - When the product is created or updated
  - Then it is persisted in Firestore and returned in subsequent reads
  - And deleting a product removes the product and its instances
- Test: tests/e2e/api.spec.ts > REQ-API-005 (todo)

### REQ-API-006 - Create/update/delete a product instance

- Status: implemented
- Priority: must
- Source: user, 2026-09-13
- Description: The API supports creating, updating, and deleting a product instance under a product.
- Acceptance:
  - Given an authenticated admin request with an instance payload (label, availability, ordered image references) for a product
  - When the instance is created or updated
  - Then it is persisted in Firestore under its product and returned in subsequent reads
  - And deleting an instance removes it and updates the product's available/total counts
- Test: tests/e2e/api.spec.ts > REQ-API-006 (todo)

### REQ-API-007 - Upload instance images

- Status: implemented
- Priority: must
- Source: user, 2026-09-13
- Description: The API accepts image uploads for a product instance and stores them in Firebase Storage.
- Acceptance:
  - Given an authenticated admin uploading one or more image files for an instance
  - When the upload is accepted
  - Then the files are stored in Firebase Storage under the product/instance path and their ordered public URLs are recorded on the instance (see REQ-ADMIN-019)
- Test: tests/e2e/api.spec.ts > REQ-API-007 (todo)

### REQ-API-008 - Payload validation and error responses

- Status: implemented
- Priority: must
- Source: user, 2026-09-13
- Description: The API validates payloads and returns clear, structured errors without partial writes.
- Acceptance:
  - Given a create/update request with a missing or invalid field (e.g. missing slug, unknown category, non-localized copy)
  - When the API processes it
  - Then it rejects the request with a 4xx status and a machine-readable error describing the problem, and no partial data is written
- Test: tests/e2e/api.spec.ts > REQ-API-008 (todo)

### REQ-API-009 - Slug uniqueness enforced

- Status: implemented
- Priority: must
- Source: user, 2026-09-13
- Description: Category and product slugs are unique; the API rejects duplicates.
- Acceptance:
  - Given an existing category or product slug
  - When a create request reuses that slug (or an update would collide with another entity's slug)
  - Then the API rejects it with a conflict error and makes no change
- Test: tests/e2e/api.spec.ts > REQ-API-009 (todo)

### REQ-API-010 - Bulk import (seed) endpoint

- Status: implemented
- Priority: should
- Source: user, 2026-09-13
- Description: The API supports an idempotent bulk import that upserts a full set of categories, products, and instances in one operation, used to seed or migrate the catalog.
- Acceptance:
  - Given an authenticated admin submitting a bulk catalog document
  - When the import runs
  - Then each category/product/instance is created or updated by slug/id (idempotent: re-running the same import yields the same state and no duplicates)
  - And the import reports how many entities were created versus updated
- Test: tests/e2e/api.spec.ts > REQ-API-010 (todo)

### REQ-API-011 - Seed the initial catalog through the API

- Status: implemented
- Priority: should
- Source: user, 2026-09-13
- Description: The seed catalog (scripts/seed-data/) is loaded into the local emulator database via the API (image upload and bulk import endpoints), not by writing to the database directly.
- Acceptance:
  - Given the seed catalog data
  - When it is seeded
  - Then it is inserted by calling the API's bulk import endpoint (REQ-API-010) as an authenticated admin, so the seed exercises the same write path the admins use
  - And afterwards the public site can render that catalog from Firestore
- Test: tests/e2e/api.spec.ts > REQ-API-011 (todo)

### REQ-API-012 - List orders (admin-only)

- Status: draft
- Priority: must
- Source: user, 2026-09-13
- Description: The API returns all orders (reservations) for the admin area, newest first.
- Acceptance:
  - Given existing orders and an authenticated admin caller
  - When the caller requests the orders collection
  - Then the API returns every order newest-first with the fields the admin list needs (reference/date, buyer name, item count or total, status)
  - And when the caller is unauthenticated or not an admin, the API responds 401/403 and returns no orders
- Test: tests/e2e/api.spec.ts > REQ-API-012 (todo)
- Related: REQ-ADMIN-020, REQ-API-002

### REQ-API-013 - Read a single order (admin-only)

- Status: draft
- Priority: must
- Source: user, 2026-09-13
- Description: The API returns the full detail of a single order by id for the admin area.
- Acceptance:
  - Given an existing order id and an authenticated admin caller
  - When the caller requests that order
  - Then the API returns its full detail (buyer contact, reserved instances with titles and prices, total, order date, and current status)
  - And when the order does not exist, the API responds 404
  - And when the caller is unauthenticated or not an admin, the API responds 401/403 and returns no order
- Test: tests/e2e/api.spec.ts > REQ-API-013 (todo)
- Related: REQ-ADMIN-021, REQ-API-002

### REQ-API-014 - Update order status (admin-only)

- Status: draft
- Priority: must
- Source: user, 2026-09-13
- Description: The API changes an order's status to new, resolved, or cancelled.
- Acceptance:
  - Given an authenticated admin request setting an existing order's status to one of new/resolved/cancelled
  - When the API processes it
  - Then the new status is persisted in Firestore together with a status-update timestamp, and is returned in subsequent reads
  - And when the requested status is not one of the allowed values, the API rejects it with a 4xx error and makes no change
  - And when the caller is unauthenticated or not an admin, the API responds 401/403 and makes no change
- Test: tests/e2e/api.spec.ts > REQ-API-014 (todo)
- Related: REQ-ADMIN-022, REQ-API-002, REQ-API-008

### REQ-API-015 - Cancelling an order releases its reserved instances

- Status: draft
- Priority: must
- Source: user, 2026-09-13
- Description: When an order is set to cancelled, the API releases its reserved instances so they become available again.
- Acceptance:
  - Given an order whose instances are reserved
  - When the order's status is changed to cancelled (REQ-API-014)
  - Then each reserved instance is released server-side and becomes available again for purchase (REQ-CATALOG-003, REQ-CART-004)
  - And when the order is instead set to resolved, its instances are not released
- Test: tests/e2e/api.spec.ts > REQ-API-015 (todo)
- Related: REQ-ADMIN-022, REQ-CATALOG-003, REQ-CART-004
