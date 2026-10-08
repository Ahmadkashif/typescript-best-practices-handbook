# Testing rules (TEST)

### TEST-001 Vitest is the test runner for applications
**Level:** MUST
**Rubric:** R5 M5 S4 D4 C4
**Rule:** Applications use Vitest (v5). Zero-dependency libraries may use `node:test`. Do not add Jest or Mocha to new code.
**Why:** In the deep read, Vitest is the runner in every non-Nest TS>=6 repo, and it runs `.ts` files and `#imports` without a transform config.
**Sources:** A-043, A-057, A-072, A-011, phase-3/boilerplate-deep-dive.md

### TEST-002 Test pyramid: unit tests by the file, integration tests through the HTTP layer
**Level:** MUST
**Rubric:** R4 M5 S5 D4 C4
**Rule:** Unit tests sit next to the code as `*.test.ts`. Integration tests in `test/integration/` drive the real app through `app.inject()` (no network), using in-memory adapters or a testcontainer DB. At least one test boots the server on a real socket and hits `/health`.
**Sources:** A-103, A-076, B-05

### TEST-003 Test behaviour through public APIs; don't mock what you own
**Level:** PREFER
**Rubric:** R4 M5 S4 D3 C4
**Rule:** Use fakes for ports (ARCH-003) and do not mock internal modules. `vi.mock` of a house module is a design smell, and it needs a comment explaining why.
**Sources:** B-05, B-09, A-103

### TEST-004 Tests are deterministic
**Level:** MUST
**Rubric:** R4 M5 S4 D4 C5
**Rule:** No real clock, randomness or network in unit tests. Inject the `Clock` (`#src/lib/time.ts`) and id generators. Integration tests clean up their data. Flaky tests are quarantined within a day.
```ts
export type Clock = { now(): Date };
export const fixedClock = (iso: string): Clock => ({ now: () => new Date(iso) });
```
**Sources:** B-05, B-14

### TEST-005 Type-level tests for type utilities
**Level:** MUST (for `src/lib` generics)
**Rubric:** R3 M5 S4 D3 C3
**Rule:** Exported generic helpers (brands, Result, `assertNever`) have `expectTypeOf` assertions.
**Sources:** A-072, B-01

### TEST-006 Typecheck is part of the test gate
**Level:** MUST
**Rubric:** R4 M5 S5 D4 C5
**Rule:** Vitest does not typecheck (it strips types), so CI runs `npm run typecheck` as a separate required step.
**Sources:** A-009, A-066, A-072
