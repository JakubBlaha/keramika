# CART requirements

The cart page `/cart` and cart state.

### REQ-CART-001 - Cart lists selected instances

- Status: verified
- Priority: must
- Source: spec
- Description: The cart lists each added instance with its image, title, size, unit price and a remove control.
- Acceptance:
  - Given instances added to the cart
  - When `/cart` renders
  - Then each line shows the instance image, product title, size, unit price and a remove button
- Test: tests/e2e/cart.spec.ts > REQ-CART-001

### REQ-CART-002 - Cart summary totals

- Status: verified
- Priority: must
- Source: spec
- Description: The cart shows a summary with subtotal, shipping estimate and total.
- Acceptance:
  - Given a non-empty cart
  - When `/cart` renders
  - Then a summary shows the subtotal, a shipping estimate and the total
- Test: tests/e2e/cart.spec.ts > REQ-CART-002

### REQ-CART-003 - Empty cart state

- Status: verified
- Priority: should
- Source: spec
- Description: An empty cart shows a message and a link back to the products.
- Acceptance:
  - Given an empty cart
  - When `/cart` renders
  - Then an empty-state message and a link back to `/produkty` are shown
- Test: tests/e2e/cart.spec.ts > REQ-CART-003

### REQ-CART-004 - An instance can be in at most one cart/order

- Status: verified
- Priority: must
- Source: user, 2026-09-12 / TODO
- Description: Because each instance is unique and sold once, it may be present in at most one cart or order at a time.
- Acceptance:
  - Given an instance already in the cart
  - When the same instance is added again
  - Then it is not duplicated, and once ordered it becomes unavailable for others
  - And on the product page, once the selected piece is in the cart the add button is disabled and reads "V košíku" / "In your cart" (the piece is marked "V košíku" in the piece picker too), so it cannot be added again
- Test: tests/e2e/cart.spec.ts > REQ-CART-004

### REQ-CART-005 - Remove an instance from the cart

- Status: verified
- Priority: must
- Source: user, 2026-09-12
- Description: The buyer can remove an individual instance from the cart via its remove control.
- Acceptance:
  - Given a cart containing one or more instances
  - When the buyer activates the remove control on a cart line
  - Then that instance is removed from the cart, the remaining lines and the summary totals update, and if it was the last line the empty-cart state (REQ-CART-003) is shown
- Test: tests/e2e/cart.spec.ts > REQ-CART-005

### REQ-CART-006 - No quantity editing for cart lines

- Status: implemented
- Priority: must
- Source: user, 2026-09-12
- Description: Because each instance is a unique piece, cart lines have a fixed quantity of one and expose no quantity editing control.
- Acceptance:
  - Given a cart line for an instance
  - When `/cart` renders that line
  - Then the line quantity is one, and no quantity input, stepper or other quantity-editing control is present (only a remove control per REQ-CART-005)
- Test: none (not functional behaviour; outside the e2e scope)
