# CONTENT requirements

Content, assets and SEO.

### REQ-CONTENT-001 - Real square product photography

- Status: draft
- Priority: should
- Source: spec / TODO
- Description: Products are shown with real square photographs on a neutral background.
- Acceptance:
  - Given a product
  - When its images are displayed
  - Then they are real photographs, square aspect ratio, on a neutral background
- Test: tests/e2e/content.spec.ts > REQ-CONTENT-001 (todo)

### REQ-CONTENT-002 - Per-page title and meta description

- Status: implemented
- Priority: should
- Source: spec / TODO
- Description: Every page sets its own document title and meta description.
- Acceptance:
  - Given any page
  - When it renders
  - Then it sets a page-specific `<title>` and a meta description
- Test: none (not functional behaviour; outside the e2e scope)

### REQ-CONTENT-003 - Contact cards reveal on a click anywhere

- Status: verified
- Priority: could
- Source: user, 2026-09-27
- Description: On the contact page, clicking anywhere on the e-mail or phone card reveals that contact detail, not only clicking its "show" link.
- Acceptance:
  - Given the contact page with the e-mail and phone still hidden
  - When the visitor clicks anywhere on the e-mail (or phone) card
  - Then the card shows the e-mail as a `mailto:` link (or the phone as a `tel:` link)
  - And keyboard users can still reveal it via the single focusable "show" button
- Test: tests/e2e/content.spec.ts > REQ-CONTENT-003
