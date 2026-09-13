# BUILD requirements

Build, quality and workflow rules. Source of truth is `.verorules/instructions.md`
and `package.json`.

### REQ-BUILD-001 - check, lint and build must pass

- Status: verified
- Priority: must
- Source: TODO
- Description: The project must pass type/svelte checks, linting and a production build.
- Acceptance:
  - Given the repository
  - When `pnpm check`, `pnpm exec eslint .` and `pnpm build` are run
  - Then all three complete without errors
- Test: tests/e2e/build.spec.ts > REQ-BUILD-001

### REQ-BUILD-002 - Do not run the dev server

- Status: implemented
- Priority: must
- Source: instructions
- Description: The agent must never start the dev server; the user runs it separately.
- Acceptance:
  - Given a task that would normally need a running app
  - When the agent works on it
  - Then it does not run `pnpm dev` or any dev-server command
- Test: n/a (workflow rule, enforced by convention)

### REQ-BUILD-003 - Style with Tailwind CSS v4

- Status: verified
- Priority: should
- Source: instructions
- Description: Styling uses Tailwind CSS v4 utilities; new bespoke CSS is avoided in favor of utilities and existing design tokens.
- Acceptance:
  - Given a new or changed UI element
  - When it is styled
  - Then it uses Tailwind utility classes (and existing tokens) rather than new bespoke CSS
- Test: tests/e2e/build.spec.ts > REQ-BUILD-003
