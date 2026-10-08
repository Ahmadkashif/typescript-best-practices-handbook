# ADR-0008 Test runner: Vitest 5

- **Status:** Accepted
- **Decision:** Vitest 5 with two projects:
  - `unit`: colocated `src/**/*.test.ts`
  - `integration`: `test/integration`, driving Fastify `inject()` plus one real-socket boot test

  Coverage uses v8, with thresholds of 80% lines, 80% functions, 75% branches and 80% statements. `node:test` is allowed for zero-dependency libraries.
- **Evidence:** Vitest is used in 14 of 32 deep-read repos, by every non-Nest TS>=6 repo, and by 38% of TS>=6 survey adopters. Sources: A-043, A-057, A-072.
- **Rubric:** R5 M5 S4 D4 C4
