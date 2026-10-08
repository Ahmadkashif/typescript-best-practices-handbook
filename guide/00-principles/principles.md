# Principles

Rubric key: R = Readability, M = Maintainability, S = Scalability, D = Deploy/Perf, C = Ecosystem consensus (each 1-5). Source IDs are listed in `../../sources.md`.

### PRIN-001 The type checker is the first test suite
**Level:** MUST
**Rubric:** R4 M5 S5 D3 C5
**Rule:** Code MUST compile with zero errors under the house `tsconfig` (see 02-compiler-config). Do not weaken a flag to make code compile.
**Why:** Strictness is now TypeScript's default (TS 7 turns `strict` on by default). Every large migration report (Airbnb, Bloomberg, Figma, Slack) credits the checker with catching bugs before they ship.
**Enforcement:** CI `npm run typecheck` (`tsc --noEmit`). Any PR that relaxes `tsconfig` needs an ADR.
**Sources:** A-001, A-007, A-088, A-089, A-092, A-093, B-01

### PRIN-002 Write the TypeScript that Node can run
**Level:** MUST
**Rubric:** R4 M5 S4 D5 C4
**Rule:** Use only *erasable* TypeScript syntax, meaning types that can be deleted to leave valid JavaScript. That excludes enums, namespaces with values, parameter properties, `import =` and legacy decorators.
**Why:** Node 24.12+/25.2+ strips types natively, and that support is stable. TS 5.8 added `erasableSyntaxOnly` to enforce the subset. The code stays "JavaScript plus types", so tests, scripts and dev runs need no transpiler.
**Enforcement:** `"erasableSyntaxOnly": true`.
**Sources:** A-009, A-010, A-024, A-025, V-04

### PRIN-003 Make illegal states unrepresentable; parse at the edges
**Level:** MUST
**Rubric:** R5 M5 S5 D4 C5
**Rule:** Untrusted data (HTTP, env, queue, DB JSON, files) MUST be parsed into precise domain types at the boundary. Inner code MUST NOT re-validate or carry `unknown`/`any` around.
**Sources:** A-019, A-121, B-11, B-01

### PRIN-004 Plain functions and modules before classes and frameworks
**Level:** PREFER
**Rubric:** R4 M4 S4 D4 C3
**Rule:** The default unit is an exported function or a factory function returning an object. Use a class only when you need identity plus encapsulated mutable state, or when a framework requires it.
**Why:** Most GoF creational patterns are ceremony in a language with first-class functions and ES modules (see 06-design-patterns).
**Sources:** B-03, B-04, B-13, B-15, B-17

### PRIN-005 Deep modules, small surfaces
**Level:** PREFER
**Rubric:** R4 M5 S5 D3 C4
**Rule:** Each feature module exports a small public API from its `index.ts`. Everything else is private to the module.
**Sources:** B-13, B-08, A-102, A-104

### PRIN-006 Fail fast on bugs, recover from the expected
**Level:** MUST
**Rubric:** R4 M5 S5 D4 C5
**Rule:** Programmer errors crash the process, and the orchestrator restarts it. Expected (operational/domain) failures are values or typed errors that the caller handles.
**Sources:** A-039, A-076, B-14

### PRIN-007 Measure before optimizing; benchmark when sources disagree
**Level:** MUST
**Rubric:** R3 M4 S4 D5 C4
**Rule:** Performance claims in reviews MUST cite a measurement (phase-3/bench or a profiler) or an authoritative source.
**Sources:** A-078, A-094, A-130, B-12

### PRIN-008 One way to do each thing
**Level:** MUST
**Rubric:** R5 M5 S4 D3 C3
**Rule:** Where this guide picks a tool or idiom (validation, logging, errors, tests, aliases), alternatives MUST NOT be added without an ADR in `decisions/`.
**Why:** Consistency beats local optimality in a shared codebase. Mixed idioms are the most common complaint in large-codebase migration retrospectives.
**Sources:** A-088, A-092, B-05
