# ADMIN requirements

Admin area for managing the catalog: products, product instances, and
categories. The admin area is not linked from the public site and is reached
only via a dedicated URL, and it is gated behind authentication.

All catalog data is stored in Firebase: product, instance, and category records
live in Cloud Firestore, uploaded images live in Firebase Storage, and admin
login is handled by Firebase Authentication. The public site reads its catalog
from Firestore/Storage rather than from a static module.

### REQ-ADMIN-001 - Dedicated admin area reachable only by URL

- Status: draft
- Priority: must
- Source: user, 2026-09-12
- Description: The admin area lives under a dedicated URL and is not linked from any public page.
- Acceptance:
  - Given the public site (home, listing, product detail, cart, checkout)
  - When a visitor browses the public navigation and page content
  - Then no link, button, or menu entry points to the admin area
  - And the admin area is still reachable by navigating directly to its URL
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-001 (todo)

### REQ-ADMIN-002 - Admin area requires authentication

- Status: implemented
- Priority: must
- Source: user, 2026-09-12
- Description: All admin pages are protected and require an authenticated admin session.
- Acceptance:
  - Given an unauthenticated visitor
  - When they navigate to any admin URL
  - Then they are shown the admin login and cannot see or act on any admin content
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-002 (todo)

### REQ-ADMIN-003 - Admin login

- Status: implemented
- Priority: must
- Source: user, 2026-09-12
- Description: An admin can log in to the admin area using Firebase Authentication.
- Acceptance:
  - Given the admin login page backed by Firebase Authentication
  - When an admin submits valid Firebase credentials
  - Then an authenticated admin session starts and they land on the admin dashboard
  - And when they submit invalid credentials, an error is shown and no session starts
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-003 (todo)
- Related: REQ-ADMIN-017

### REQ-ADMIN-004 - Admin logout

- Status: implemented
- Priority: should
- Source: user, 2026-09-12
- Description: An authenticated admin can end their admin session.
- Acceptance:
  - Given an authenticated admin
  - When they choose to log out
  - Then their session ends and visiting any admin URL again requires logging in
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-004 (todo)

### REQ-ADMIN-005 - List products in admin

- Status: draft
- Priority: must
- Source: user, 2026-09-12
- Description: The admin area lists all products so an admin can find and select one to manage.
- Acceptance:
  - Given an authenticated admin
  - When they open the product management view
  - Then every product is listed with its name, category, and available/total instance counts
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-005 (todo)

### REQ-ADMIN-006 - Create a product

- Status: draft
- Priority: must
- Source: user, 2026-09-12
- Description: An admin can add a new product to the catalog.
- Acceptance:
  - Given an authenticated admin on the product management view
  - When they create a product with the required fields (name, category, price, and localized copy for cs and en)
  - Then the product is saved as a Firestore document and appears in the product list and on the public site under its category
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-006 (todo)
- Related: REQ-ADMIN-018

### REQ-ADMIN-007 - Edit a product

- Status: draft
- Priority: must
- Source: user, 2026-09-12
- Description: An admin can edit an existing product's fields.
- Acceptance:
  - Given an authenticated admin viewing an existing product
  - When they change its fields (including localized cs and en copy) and save
  - Then the updated values are persisted to the product's Firestore document and reflected on the public site
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-007 (todo)
- Related: REQ-ADMIN-018

### REQ-ADMIN-008 - Delete a product

- Status: draft
- Priority: should
- Source: user, 2026-09-12
- Description: An admin can remove a product from the catalog.
- Acceptance:
  - Given an authenticated admin viewing an existing product
  - When they delete it and confirm
  - Then the product and its instances no longer appear in the admin list or on the public site
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-008 (todo)

### REQ-ADMIN-009 - List a product's instances in admin

- Status: draft
- Priority: must
- Source: user, 2026-09-12
- Description: An admin can view all instances of a product with their availability.
- Acceptance:
  - Given an authenticated admin viewing a product
  - When they open its instances
  - Then each instance is listed with its label, images, and availability status
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-009 (todo)

### REQ-ADMIN-010 - Create a product instance

- Status: draft
- Priority: must
- Source: user, 2026-09-12
- Description: An admin can add a new instance (physical piece) to a product, including uploading its images.
- Acceptance:
  - Given an authenticated admin viewing a product
  - When they add an instance with a label and upload one or more images
  - Then the images are stored in Firebase Storage, the instance is saved in Firestore referencing those images in order, and it appears as available on the public product detail page
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-010 (todo)
- Related: REQ-ADMIN-018, REQ-ADMIN-019

### REQ-ADMIN-011 - Edit a product instance

- Status: draft
- Priority: must
- Source: user, 2026-09-12
- Description: An admin can edit an instance's label, images, and availability.
- Acceptance:
  - Given an authenticated admin viewing a product instance
  - When they change its label, add or remove images, or change its availability and save
  - Then added images are uploaded to Firebase Storage, the updated instance is persisted in Firestore, and the changes are reflected on the public product detail page
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-011 (todo)
- Related: REQ-ADMIN-018, REQ-ADMIN-019

### REQ-ADMIN-012 - Delete a product instance

- Status: draft
- Priority: should
- Source: user, 2026-09-12
- Description: An admin can remove an instance from a product.
- Acceptance:
  - Given an authenticated admin viewing a product instance
  - When they delete it and confirm
  - Then the instance no longer appears in the admin list or on the public product detail page, and the product's available/total counts update accordingly
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-012 (todo)

### REQ-ADMIN-013 - List categories in admin

- Status: draft
- Priority: must
- Source: user, 2026-09-12
- Description: The admin area lists all categories.
- Acceptance:
  - Given an authenticated admin
  - When they open the category management view
  - Then every category is listed with its slug, localized name, and product count
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-013 (todo)

### REQ-ADMIN-014 - Create a category

- Status: draft
- Priority: must
- Source: user, 2026-09-12
- Description: An admin can add a new category.
- Acceptance:
  - Given an authenticated admin on the category management view
  - When they create a category with a slug and localized name and description for cs and en
  - Then the category is saved as a Firestore document, available for assigning products, and appears on the public categories landing page
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-014 (todo)
- Related: REQ-ADMIN-018

### REQ-ADMIN-015 - Edit a category

- Status: draft
- Priority: should
- Source: user, 2026-09-12
- Description: An admin can edit an existing category's fields.
- Acceptance:
  - Given an authenticated admin viewing an existing category
  - When they change its slug or localized name/description and save
  - Then the updated values are persisted and reflected on the public site
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-015 (todo)

### REQ-ADMIN-016 - Delete a category

- Status: draft
- Priority: could
- Source: user, 2026-09-12
- Description: An admin can remove a category that has no products.
- Acceptance:
  - Given an authenticated admin viewing a category with no products
  - When they delete it and confirm
  - Then the category no longer appears in the admin list or on the public site
  - And given a category that still has products, deletion is prevented with an explanatory message
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-016 (todo)

### REQ-ADMIN-017 - Authentication via Firebase Authentication

- Status: implemented
- Priority: must
- Source: user, 2026-09-12
- Description: Admin authentication is backed by Firebase Authentication, and only authorized admin accounts may access the admin area.
- Acceptance:
  - Given the admin area
  - When a user authenticates
  - Then the identity is verified through Firebase Authentication
  - And only accounts marked as admins are granted access; any other authenticated account is rejected
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-017 (todo)

### REQ-ADMIN-018 - Catalog data stored in Cloud Firestore

- Status: draft
- Priority: must
- Source: user, 2026-09-12
- Description: Products, product instances, and categories are stored in Cloud Firestore and are the single source of truth for the public site.
- Acceptance:
  - Given the catalog
  - When products, instances, or categories are read or written
  - Then the data is read from and written to Cloud Firestore
  - And the public listing, product detail, and category pages render from the Firestore data rather than a hardcoded static module
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-018 (todo)

### REQ-ADMIN-019 - Instance images stored in Firebase Storage

- Status: draft
- Priority: must
- Source: user, 2026-09-12
- Description: Images uploaded for product instances are stored in Firebase Storage and referenced from the instance's Firestore record.
- Acceptance:
  - Given an admin uploading images for a product instance
  - When the upload completes
  - Then each image file is stored in Firebase Storage and the instance record holds the ordered public URLs of those files
  - And the public product detail page loads the images from those URLs
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-019 (todo)

### REQ-ADMIN-020 - List orders in admin

- Status: implemented
- Priority: must
- Source: user, 2026-09-12
- Description: The admin area lists all orders (reservations) placed through checkout so an admin can review them.
- Acceptance:
  - Given an authenticated admin
  - When they open the order management view
  - Then every order is listed with at least its reference/date, the buyer's name, the number of items (or total), and its status (e.g. new, resolved, cancelled)
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-020 (todo)

### REQ-ADMIN-021 - View an order's detail

- Status: implemented
- Priority: must
- Source: user, 2026-09-12
- Description: An admin can open a single order to see its full detail.
- Acceptance:
  - Given an authenticated admin viewing the order list
  - When they open a specific order
  - Then the order detail shows the buyer's contact details, the reserved instances with their titles and prices, the total, the order date, and the current status
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-021 (todo)

### REQ-ADMIN-022 - Mark an order as resolved or cancelled

- Status: implemented
- Priority: must
- Source: user, 2026-09-12
- Description: An admin can change an order's status to resolved or cancelled.
- Acceptance:
  - Given an authenticated admin viewing an order
  - When they mark it as resolved or as cancelled
  - Then the order's status is updated and persisted in Firestore, and the new status is reflected in the order list and detail
  - And when an order is cancelled, its reserved instances are released and become available again (REQ-CATALOG-003, REQ-CART-004)
- Test: tests/e2e/admin.spec.ts > REQ-ADMIN-022 (todo)
- Related: REQ-ADMIN-018
