# CHECKOUT requirements

The checkout page `/objednavka` and order confirmation. Not built yet.

For now the site acts as a reservation system: the only fulfillment is pickup in
store and the only payment is in store on pickup. There is no online payment and
no shipping. See REQ-CHECKOUT-007..010. REQ-CHECKOUT-003 and REQ-CHECKOUT-004
(multiple shipping / payment methods) are retired as a result.

### REQ-CHECKOUT-001 - Order summary

- Status: draft
- Priority: must
- Source: spec
- Description: Checkout shows a summary of the ordered items.
- Acceptance:
  - Given a non-empty cart
  - When `/objednavka` renders
  - Then a summary lists the ordered items and the total
- Test: tests/e2e/checkout.spec.ts > REQ-CHECKOUT-001 (todo)

### REQ-CHECKOUT-002 - Contact information form

- Status: draft
- Priority: must
- Source: spec / user, 2026-09-12
- Description: Checkout collects the buyer's contact details needed to hold and hand over a reservation. Because fulfillment is in-store pickup only (REQ-CHECKOUT-007), a shipping/billing address is not required.
- Acceptance:
  - Given the checkout page
  - When it renders
  - Then fields for name, email and phone are present and required, and no shipping/billing address field is required
- Test: tests/e2e/checkout.spec.ts > REQ-CHECKOUT-002 (todo)

### REQ-CHECKOUT-003 - Shipping method selection

- Status: removed
- Priority: must
- Source: spec / retired by user, 2026-09-12
- Description: RETIRED. Superseded by REQ-CHECKOUT-007 (pickup in store is the only fulfillment). The site does not ship; there is no shipping-method choice.
- Acceptance:
  - Given the checkout page
  - When it renders
  - Then the buyer can choose one shipping method (pickup, standard or express)
- Test: tests/e2e/checkout.spec.ts > REQ-CHECKOUT-003 (todo)

### REQ-CHECKOUT-004 - Payment method selection

- Status: removed
- Priority: must
- Source: spec / retired by user, 2026-09-12
- Description: RETIRED. Superseded by REQ-CHECKOUT-008 (pay in store on pickup is the only payment). There is no online payment-method choice.
- Acceptance:
  - Given the checkout page
  - When it renders
  - Then the buyer can choose one payment method (bank transfer or card)
- Test: tests/e2e/checkout.spec.ts > REQ-CHECKOUT-004 (todo)

### REQ-CHECKOUT-005 - Terms acceptance required

- Status: draft
- Priority: must
- Source: spec
- Description: The order cannot be placed without agreeing to the terms and conditions.
- Acceptance:
  - Given the checkout page with the terms checkbox unchecked
  - When the buyer tries to place the order
  - Then submission is blocked until the terms checkbox is checked
- Test: tests/e2e/checkout.spec.ts > REQ-CHECKOUT-005 (todo)

### REQ-CHECKOUT-006 - Order confirmation

- Status: draft
- Priority: should
- Source: spec
- Description: After a successful order, a thank-you/confirmation page is shown.
- Acceptance:
  - Given a valid, submitted order
  - When submission succeeds
  - Then a confirmation page is shown to the buyer
- Test: tests/e2e/checkout.spec.ts > REQ-CHECKOUT-006 (todo)

### REQ-CHECKOUT-007 - Pickup in store is the only fulfillment

- Status: draft
- Priority: must
- Source: user, 2026-09-12
- Description: The only fulfillment method is pickup in store; no shipping is offered.
- Acceptance:
  - Given the checkout page
  - When it renders
  - Then pickup in store is presented as the fulfillment method, and no shipping method or delivery-address option is offered
- Test: tests/e2e/checkout.spec.ts > REQ-CHECKOUT-007 (todo)

### REQ-CHECKOUT-008 - Pay in store is the only payment

- Status: draft
- Priority: must
- Source: user, 2026-09-12
- Description: The only payment method is payment in store on pickup; no online payment is taken.
- Acceptance:
  - Given the checkout page
  - When it renders
  - Then payment in store on pickup is presented as the payment method, and no online payment step (card, transfer, gateway) is offered
- Test: tests/e2e/checkout.spec.ts > REQ-CHECKOUT-008 (todo)

### REQ-CHECKOUT-009 - Site is a reservation, not a paid sale

- Status: draft
- Priority: must
- Source: user, 2026-09-12
- Description: Completing checkout creates a reservation of the selected instances rather than a paid purchase; the copy makes clear payment happens in store on pickup.
- Acceptance:
  - Given a non-empty cart at checkout
  - When the buyer reviews the order details
  - Then the flow is labelled as a reservation and states that payment is due in store on pickup, with no money collected online
- Test: tests/e2e/checkout.spec.ts > REQ-CHECKOUT-009 (todo)

### REQ-CHECKOUT-010 - Place the reservation

- Status: draft
- Priority: must
- Source: user, 2026-09-12
- Description: With valid contact details and terms accepted, the buyer can submit the checkout to place the reservation.
- Acceptance:
  - Given a non-empty cart, valid contact details (REQ-CHECKOUT-002) and accepted terms (REQ-CHECKOUT-005)
  - When the buyer submits the checkout
  - Then the reservation is placed, the reserved instances become unavailable to others (REQ-CATALOG-003, REQ-CART-004), and the confirmation page (REQ-CHECKOUT-006) is shown
- Test: tests/e2e/checkout.spec.ts > REQ-CHECKOUT-010 (todo)
