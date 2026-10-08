# ADR-0006 Dependency injection: pure DI, composition root

- **Status:** Accepted
- **Decision:** `src/container.ts` `createContainer(config, overrides)` builds every dependency, and factories receive them as arguments. No DI container library.
- **Evidence:**
  - Manual wiring in 18 of 32 deep-read repos.
  - DI libraries appear in only 3 repos, all old.
  - Containers need decorators and reflect-metadata (banned).
  - A-101, B-03, B-09.
- **Rubric:** R5 M5 S4 D5 C3
