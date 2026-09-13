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

- Status: verified
- Priority: should
- Source: spec / TODO
- Description: Every page sets its own document title and meta description.
- Acceptance:
  - Given any page
  - When it renders
  - Then it sets a page-specific `<title>` and a meta description
- Test: tests/e2e/content.spec.ts > REQ-CONTENT-002
