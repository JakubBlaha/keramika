---
name: requirements-authoring
description: Captures requirements, rules, and expected behaviors for the keramika eshop into the repo in a structured, testable format. Use whenever the user states a new requirement or rule, describes an expected behavior, or asks to capture, document, add, or update requirements. Produces atomic, uniquely-IDed requirements with Given/When/Then acceptance criteria that map to Playwright tests. Do not use for writing the tests themselves, for app code, or for unrelated documentation.
license: MIT
metadata:
  author: keramika
---

# Requirements Authoring

Turn a requirement the user gives in chat into a durable, testable record in the
repo. Every requirement must be atomic (one behavior), uniquely identified, and
written so a Playwright test can later verify it.

## When to activate

- The user states a new requirement, rule, or constraint for the eshop.
- The user describes an expected behavior ("it should ...", "we need to ...").
- The user asks to capture / document / add / update requirements.

Do NOT use this skill to write the actual tests, to change app code, or for
unrelated docs.

## Where requirements live

```
docs/requirements/
  README.md          # system explanation + master coverage table
  catalog.md         # data model, products, instances, availability
  product-detail.md  # /produkt/[slug] behavior
  listing.md         # /produkty and /produkty/[category]
  gallery.md         # /galerie
  home.md            # homepage
  cart.md            # /kosik
  checkout.md        # /objednavka
  i18n.md            # localization rules
  build.md           # build/quality/workflow rules
  content.md         # content, assets, SEO
  a11y.md            # accessibility
  design.md          # visual design direction
```

Pick the area file that best fits. If none fits, create a new area file and add
its area code to the list below.

## ID scheme

Format: `REQ-<AREA>-<NNN>` where `<AREA>` is uppercase and `<NNN>` is a
zero-padded, per-area sequential counter (001, 002, ...).

Current area codes: `CATALOG`, `PRODUCT`, `LISTING`, `HOME`, `CART`,
`CHECKOUT`, `GALLERY`, `I18N`, `BUILD`, `CONTENT`, `A11Y`, `DESIGN`.

Rules:

- IDs are permanent. Never renumber, reuse, or delete an ID. To retire a
  requirement, set its status to `removed` and keep the block.
- The next number for an area is (highest existing number in that file) + 1.

## Requirement template

Each requirement is a level-3 heading block in its area file:

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

Field values:

- Status: `draft` | `approved` | `implemented` | `verified` | `removed`
  - `draft`: captured but not agreed/built.
  - `approved`: agreed, not built.
  - `implemented`: code exists.
  - `verified`: code exists AND a passing test references the ID.
  - `removed`: retired; kept for history.
- Priority: `must` | `should` | `could`.
- Source: who asked + ISO date (e.g. `user, 2026-09-12`, or `spec` / `TODO`).
- Description: one sentence, one behavior.
- Acceptance: one or more Given/When/Then triples. Keep them observable and
  concrete so they translate directly into Playwright assertions.
- Test: the intended Playwright file and test title (`tests/e2e/<area>.spec.ts >
REQ-<AREA>-<NNN>`). Suffix `(todo)` until the test exists.
  Non-functional requirements (visual design, fixed copy, SEO, tooling) are
  not e2e-tested: use `Test: none (not functional behaviour; outside the e2e scope)`.

## How requirements map to tests

- Tests are Playwright e2e specs under `tests/e2e/`, one file per area.
- Each test title MUST include the requirement ID so traceability is greppable,
  e.g. `test('REQ-CATALOG-001 - shows thumbnail strip for multi-image instance', ...)`.
- Writing tests is a SEPARATE task. This skill only guarantees the requirement
  is captured in a test-ready shape and leaves the `Test:` line as `(todo)`.
- A requirement becomes `verified` only once a passing test references its ID.

## Procedure

1. Identify the area file (create one if needed; register its area code above).
2. Determine the next ID for that area.
3. Write the requirement block using the template. If the user gave a fuzzy
   statement, split it into multiple atomic requirements rather than one broad
   one.
4. For any user-facing copy, note the i18n obligation (keys in both
   `messages/cs.json` and `messages/en.json`) either in the acceptance criteria
   or as a linked `REQ-I18N-*`.
5. Add/update the row in the `docs/requirements/README.md` coverage table
   (ID, title, status, test).
6. Run the capture checklist. Only then report the requirement as captured.

## Capture checklist

- [ ] Atomic: the requirement describes exactly one testable behavior.
- [ ] Unique ID: `REQ-<AREA>-<NNN>`, not previously used.
- [ ] Acceptance: at least one Given/When/Then triple, observable outcomes.
- [ ] Status/Priority/Source filled in honestly.
- [ ] Test line present (`(todo)` until the test exists).
- [ ] Added to the area file AND the README coverage table.
- [ ] i18n considered for any user-facing copy (both cs and en).

## Notes

- Follow `.verorules/instructions.md` at all times (never run `pnpm dev`, use
  Tailwind, route copy through Paraglide).
- Keep acceptance criteria implementation-independent where possible: describe
  what the user observes, not how the code achieves it.
