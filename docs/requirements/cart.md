# CART requirements

The cart page `/kosik` and cart state. Not built yet.

### REQ-CART-001 - Cart lists selected instances

- Status: draft
- Priority: must
- Source: spec
- Description: The cart lists each added instance with its image, title, size, unit price and a remove control.
- Acceptance:
  - Given instances added to the cart
  - When `/kosik` renders
  - Then each line shows the instance image, product title, size, unit price and a remove button
- Test: tests/e2e/cart.spec.ts > REQ-CART-001 (todo)

### REQ-CART-002 - Cart summary totals

- Status: draft
- Priority: must
- Source: spec
- Description: The cart shows a summary with subtotal, shipping estimate and total.
- Acceptance:
  - Given a non-empty cart
  - When `/kosik` renders
  - Then a summary shows the subtotal, a shipping estimate and the total
- Test: tests/e2e/cart.spec.ts > REQ-CART-002 (todo)

### REQ-CART-003 - Empty cart state

- Status: draft
- Priority: should
- Source: spec
- Description: An empty cart shows a message and a link back to the products.
- Acceptance:
  - Given an empty cart
  - When `/kosik` renders
  - Then an empty-state message and a link back to `/produkty` are shown
- Test: tests/e2e/cart.spec.ts > REQ-CART-003 (todo)

### REQ-CART-004 - An instance can be in at most one cart/order

- Status: approved
- Priority: must
- Source: user, 2026-09-12 / TODO
- Description: Because each instance is unique and sold once, it may be present in at most one cart or order at a time.
- Acceptance:
  - Given an instance already in the cart
  - When the same instance is added again
  - Then it is not duplicated, and once ordered it becomes unavailable for others
- Test: tests/e2e/cart.spec.ts > REQ-CART-004 (todo)

### REQ-CART-005 - Remove an instance from the cart

- Status: draft
- Priority: must
- Source: user, 2026-09-12
- Description: The buyer can remove an individual instance from the cart via its remove control.
- Acceptance:
  - Given a cart containing one or more instances
  - When the buyer activates the remove control on a cart line
  - Then that instance is removed from the cart, the remaining lines and the summary totals update, and if it was the last line the empty-cart state (REQ-CART-003) is shown
- Test: tests/e2e/cart.spec.ts > REQ-CART-005 (todo)

### REQ-CART-006 - No quantity editing for cart lines

- Status: draft
- Priority: must
- Source: user, 2026-09-12
- Description: Because each instance is a unique piece, cart lines have a fixed quantity of one and expose no quantity editing control.
- Acceptance:
  - Given a cart line for an instance
  - When `/kosik` renders that line
  - Then the line quantity is one, and no quantity input, stepper or other quantity-editing control is present (only a remove control per REQ-CART-005)
- Test: tests/e2e/cart.spec.ts > REQ-CART-006 (todo)
