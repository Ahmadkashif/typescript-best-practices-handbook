# Architecture rules (ARCH)

### ARCH-001 Modular monolith by default
**Level:** MUST
**Rubric:** R4 M5 S4 D5 C4
**Rule:** A new backend starts as one deployable made of feature modules. Splitting out a service needs an ADR that names the concrete driver: independent scaling, team ownership, or a different runtime profile.
**Sources:** A-148, A-104, B-18, B-08

### ARCH-002 Organize by feature, not by technical layer
**Level:** MUST
**Rubric:** R5 M5 S5 D3 C5
**Rule:** Each feature is one folder under `src/modules/<feature>/`. The folder holds its routes, schemas, service and data access, and exposes its public API only through `index.ts`. Top-level `controllers/`, `services/` and `models/` folders are banned.
**Enforcement:** the boilerplate bans `../` imports (`no-restricted-imports`), so cross-folder imports must use `#src/...` and are visible in review. Recommended addition once you have 2+ modules: `import/no-restricted-paths` zones between `src/modules/*`.
**Sources:** A-076, A-102, B-13, B-08

### ARCH-003 Ports and adapters only at real I/O seams
**Level:** MUST (at seams) / AVOID (elsewhere)
**Rubric:** R4 M5 S5 D4 C4
**Rule:** Third-party APIs, message brokers, email, clocks and randomness get a port `type` plus an adapter. The domain imports no infrastructure. Do not add interfaces for pure in-process code that has a single implementation.
```ts
// port (owned by the domain)
export type PaymentGateway = { charge(input: { cents: bigint; token: string }, signal?: AbortSignal): Promise<{ id: string }> };
// adapter (owned by infrastructure); validates the vendor response (VAL-006)
export function createFakeGateway(): PaymentGateway {
  let n = 0;
  return { async charge() { n += 1; return { id: `ch_${n}` }; } };
}
```
**Sources:** A-103, B-09, B-06, B-14

### ARCH-004 Pure DI in one composition root; no DI container
**Level:** MUST
**Rubric:** R5 M5 S4 D5 C3
**Rule:** `src/container.ts` (the composition root, `createContainer(config, overrides)`) creates the infrastructure (config, logger, db, clients) and passes it to module factories. No `tsyringe`, `inversify` or `typedi`. Nest's container is acceptable only in an ADR-approved Nest service.
**Why:** Containers need decorators and `reflect-metadata` (banned by LANG-004). Explicit wiring can be traced with go-to-definition.
**Sources:** A-101, B-03, B-09, phase-2/boilerplates.md (most non-Nest repos use manual wiring)

### ARCH-005 A use case is a function; a transaction script is fine for CRUD
**Level:** PREFER
**Rubric:** R5 M4 S4 D4 C3
**Rule:** Do not create `XUseCase` classes with an `execute()` method. Domain modelling (aggregates, value objects) is used where invariants exist. Plain CRUD stays thin.
**Sources:** B-08, B-10, B-13

### ARCH-006 No CQRS or event sourcing unless it is the core domain
**Level:** AVOID
**Rubric:** R3 M3 S4 D3 C4
**Sources:** B-07, B-18, B-12

### ARCH-007 Dependency direction: http -> service -> data; domain depends on nothing
**Level:** MUST
**Rubric:** R4 M5 S5 D3 C4
**Rule:**
- Routes call services. Services call data-access functions and ports. Shared `lib/` depends on nothing in `modules/`.
- No cycles between modules.
- Cross-module calls go through the other module's `index.ts`.
**Enforcement:** `import/no-cycle` (or `madge --circular` in CI), plus the ARCH-002 lint pattern.
**Sources:** B-09, B-13, A-076
