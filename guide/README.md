# TypeScript + Node.js Backend Guide

The house standard for backend TypeScript on Node.js. It is strict and opinionated, and every rule traces back to evidence. Built 2026-10-06/07 from:
- 150 articles, 18 books and a 270-repo boilerplate survey (32 deep-read);
- reproducible benchmarks in `phase-3/bench/`;
- a verified starter in `../boilerplate/`.

**Baseline:** Node 24 LTS (>=24.12; 26 becomes LTS on 2026-10-28) · TypeScript 7.0 (`tsc`) with the TS 6 API for tooling · ESM · Fastify 5 · Zod 4 · pino · Vitest 5 · ESLint 10 + Prettier · tsdown · Docker.

## How to read

- Start with [dos-and-donts.md](dos-and-donts.md), the one-page cheat sheet of every MUST and MUST NOT.
- Each folder has a `README.md` index and a `rules.md`. Every rule uses this format:
  `ID · title · Level · Rubric · Rule · Why · Good/Bad examples · Enforcement · Sources`.
- **Levels:**
  - **MUST / MUST NOT:** at least 2 independent credible sources, or a reproducible measurement. Deviating requires an ADR.
  - **PREFER / AVOID:** the default. Deviate with a comment in the PR.
  - **RESTRICT:** allowed only under the stated condition.
- **Rubric** (1-5 each): **R**eadability, **M**aintainability, **S**calability, **D**eploy/perf, ecosystem **C**onsensus. A low C next to high R/M/S/D marks a deliberate break from popular practice. Example: STRUCT-002, `#imports` over `paths`.
- **Code samples:** fences are `ts` (must compile), `ts fails` (must be rejected by the compiler) or `ts lint` (compiles; caught by lint/review). All of them are typechecked with TS 7.0.2 under the house tsconfig by `phase-5/snippet-check` (`node extract-and-check.ts`).
- **Source IDs:** A-xxx (articles), B-xx (books), V-xx (live version evidence). See `../sources.md`.

## Sections

| # | Folder | Prefix |
|---|---|---|
| 00 | [principles](00-principles/) | PRIN |
| 01 | [language-features](01-language-features/) (220-row USE/RESTRICT/BAN catalog) | LANG |
| 02 | [compiler-config](02-compiler-config/) | TSC |
| 03 | [project-structure](03-project-structure/) | STRUCT |
| 04 | [type-design](04-type-design/) | TYPES |
| 05 | [error-handling](05-error-handling/) | ERR |
| 06 | [design-patterns](06-design-patterns/) | PAT |
| 07 | [architecture](07-architecture/) | ARCH |
| 08 | [async-concurrency](08-async-concurrency/) | ASYNC |
| 09 | [validation-config-io](09-validation-config-io/) | VAL |
| 10 | [data-access](10-data-access/) | DATA |
| 11 | [http-apis](11-http-apis/) | HTTP |
| 12 | [testing](12-testing/) | TEST |
| 13 | [tooling](13-tooling/) | TOOL |
| 14 | [performance](14-performance/) | PERF |
| 15 | [build-and-deploy](15-build-and-deploy/) | BUILD |
| 16 | [observability](16-observability/) | OBS |
| 17 | [security](17-security/) | SEC |
| 18 | [dependencies](18-dependencies/) | DEP |
| | [decisions](decisions/) | ADR-0001..0011 |

## Known gaps between the guide and the boilerplate

The guide never contradicts `boilerplate/`. Where the guide asks for more than the boilerplate does today, the rule says so:
- **Recommended lint additions:** `n/no-process-env`, `n/no-sync`, `consistent-type-assertions: never`, no-default-export, `import/no-restricted-paths`.
- **Actions pinned by tag:** the boilerplate pins actions by tag, not SHA (SEC-006).
- **No compile cache yet** (PERF-008).
- **Base image:** Alpine vs distroless (ADR-0011, OQ-1).

## Rule index (143 rules: 87 MUST, 16 MUST NOT, 34 PREFER, 4 AVOID, 2 RESTRICT)

| ID | Rule | Level | Rubric |
|---|---|---|---|
| PRIN-001 | [The type checker is the first test suite](00-principles/principles.md) | MUST | R4 M5 S5 D3 C5 |
| PRIN-002 | [Write the TypeScript that Node can run](00-principles/principles.md) | MUST | R4 M5 S4 D5 C4 |
| PRIN-003 | [Make illegal states unrepresentable; parse at the edges](00-principles/principles.md) | MUST | R5 M5 S5 D4 C5 |
| PRIN-004 | [Plain functions and modules before classes and frameworks](00-principles/principles.md) | PREFER | R4 M4 S4 D4 C3 |
| PRIN-005 | [Deep modules, small surfaces](00-principles/principles.md) | PREFER | R4 M5 S5 D3 C4 |
| PRIN-006 | [Fail fast on bugs, recover from the expected](00-principles/principles.md) | MUST | R4 M5 S5 D4 C5 |
| PRIN-007 | [Measure before optimizing; benchmark when sources disagree](00-principles/principles.md) | MUST | R3 M4 S4 D5 C4 |
| PRIN-008 | [One way to do each thing](00-principles/principles.md) | MUST | R5 M5 S4 D3 C3 |
| LANG-001 | [No `enum`, `const enum` or `declare enum`](01-language-features/rules.md) | MUST NOT | R4 M4 S4 D5 C4 |
| LANG-002 | [No namespaces with values, no `module Foo {}`, no `import x = require()`](01-language-features/rules.md) | MUST NOT | R4 M5 S4 D5 C5 |
| LANG-003 | [No constructor parameter properties](01-language-features/rules.md) | MUST NOT | R4 M4 S3 D5 C4 |
| LANG-004 | [No decorators (legacy or TC39) in house code](01-language-features/rules.md) | MUST NOT | R3 M3 S3 D4 C3 |
| LANG-005 | [`any` is banned; use `unknown` and narrow](01-language-features/rules.md) | MUST NOT | R4 M5 S5 D3 C5 |
| LANG-006 | [No type assertions to silence the compiler](01-language-features/rules.md) | MUST NOT | R4 M5 S4 D3 C5 |
| LANG-007 | [Use `#private` fields, not the `private` keyword](01-language-features/rules.md) | PREFER | R4 M4 S3 D4 C3 |
| LANG-008 | [Use `using` / `await using` for scoped resources](01-language-features/rules.md) | PREFER | R4 M5 S4 D4 C3 |
| LANG-009 | [Default exports are banned outside tool config files](01-language-features/rules.md) | MUST NOT | R4 M4 S4 D3 C4 |
| LANG-010 | [No `@ts-ignore` / `@ts-nocheck`; `@ts-expect-error` needs a reason](01-language-features/rules.md) | MUST NOT | R4 M5 S4 D3 C5 |
| LANG-011 | [`type` by default, `interface` for extendable object contracts](01-language-features/rules.md) | PREFER | R4 M4 S4 D4 C3 |
| LANG-012 | [Explicit return types on exported functions](01-language-features/rules.md) | PREFER | R4 M4 S4 D4 C3 |
| LANG-013 | [Top-level `await` only in entrypoints](01-language-features/rules.md) | RESTRICT (PREFER) | R4 M4 S3 D4 C3 |
| TSC-001 | [`strict` plus the extra safety flags](02-compiler-config/rules.md) | MUST | R4 M5 S5 D3 C5 |
| TSC-002 | [Module settings mirror Node exactly](02-compiler-config/rules.md) | MUST | R4 M5 S5 D5 C5 |
| TSC-003 | [Erasable syntax only](02-compiler-config/rules.md) | MUST | R4 M5 S4 D5 C4 |
| TSC-004 | [`tsc` typechecks; it does not emit](02-compiler-config/rules.md) | MUST | R4 M5 S4 D5 C4 |
| TSC-005 | [Target the runtime you run](02-compiler-config/rules.md) | MUST | R4 M4 S4 D5 C4 |
| TSC-006 | [No `baseUrl`, no `paths`](02-compiler-config/rules.md) | MUST NOT | R4 M5 S5 D5 C3 |
| TSC-007 | [`skipLibCheck: true`](02-compiler-config/rules.md) | MUST | R4 M3 S5 D5 C5 |
| TSC-008 | [Typecheck tests and config files with the same tsconfig](02-compiler-config/rules.md) | MUST | R4 M5 S4 D3 C4 |
| TSC-009 | [Project references only for multi-package repos](02-compiler-config/rules.md) | RESTRICT | R3 M4 S5 D4 C4 |
| TSC-010 | [Two TypeScript packages: TS 7 for `tsc`, TS 6 for API consumers](02-compiler-config/rules.md) | MUST (until TS 7.1 ships its API) | R3 M4 S4 D5 C3 |
| STRUCT-001 | [ESM only](03-project-structure/rules.md) | MUST | R4 M5 S5 D5 C4 |
| STRUCT-002 | [Aliases via `package.json#imports` only](03-project-structure/rules.md) | MUST | R5 M5 S5 D5 C2 |
| STRUCT-003 | [Explicit file extensions in every relative or alias import](03-project-structure/rules.md) | MUST | R4 M5 S4 D5 C5 |
| STRUCT-004 | [`import type` for types](03-project-structure/rules.md) | MUST | R4 M4 S4 D5 C5 |
| STRUCT-005 | [Only `main.ts` has import-time side effects](03-project-structure/rules.md) | MUST | R4 M5 S4 D4 C4 |
| STRUCT-006 | [Feature files named by role](03-project-structure/rules.md) | PREFER | R5 M4 S4 D3 C3 |
| STRUCT-007 | [Monorepos: npm workspaces, one TS version, internal packages via `exports`](03-project-structure/rules.md) | PREFER | R4 M5 S5 D4 C4 |
| TYPES-001 | [Model variants as discriminated unions and switch exhaustively](04-type-design/rules.md) | MUST | R5 M5 S5 D4 C5 |
| TYPES-002 | [Brand identifiers and validated primitives](04-type-design/rules.md) | MUST | R4 M5 S5 D5 C4 |
| TYPES-003 | [Parse, don't validate](04-type-design/rules.md) | MUST | R5 M5 S5 D4 C5 |
| TYPES-004 | [No sentinel values; use `undefined` or a union](04-type-design/rules.md) | MUST NOT | R5 M5 S4 D4 C4 |
| TYPES-005 | [Readonly by default for data](04-type-design/rules.md) | PREFER | R4 M5 S4 D4 C3 |
| TYPES-006 | [Generics only when they relate two or more positions](04-type-design/rules.md) | AVOID (over-generic code) | R5 M4 S3 D4 C4 |
| TYPES-007 | [Money is integer minor units or a decimal, never a float](04-type-design/rules.md) | MUST | R4 M5 S5 D4 C5 |
| TYPES-008 | [`noUncheckedIndexedAccess` is on; write code that respects it](04-type-design/rules.md) | MUST | R4 M5 S4 D3 C3 |
| ERR-001 | [Throw only `Error` instances; wrap with `cause`](05-error-handling/rules.md) | MUST | R4 M5 S4 D4 C5 |
| ERR-002 | [Expected domain failures are returned as a `Result`](05-error-handling/rules.md) | PREFER | R4 M5 S4 D5 C3 |
| ERR-003 | [One `AppError` hierarchy with stable codes](05-error-handling/rules.md) | MUST | R5 M5 S5 D4 C4 |
| ERR-004 | [Never swallow errors](05-error-handling/rules.md) | MUST NOT | R4 M5 S4 D4 C5 |
| ERR-005 | [Narrow `unknown` in `catch` before use](05-error-handling/rules.md) | MUST | R4 M5 S4 D3 C5 |
| ERR-006 | [Crash on programmer errors and unhandled rejections](05-error-handling/rules.md) | MUST | R4 M5 S5 D5 C5 |
| ERR-007 | [Never leak internals to clients](05-error-handling/rules.md) | MUST NOT | R4 M4 S4 D4 C5 |
| PAT-001 | [No Singleton classes](06-design-patterns/rules.md) | MUST NOT | R4 M5 S4 D4 C4 |
| PAT-002 | [Factory functions over classes for services](06-design-patterns/rules.md) | PREFER | R4 M4 S4 D4 C3 |
| PAT-003 | [Builders only for test data](06-design-patterns/rules.md) | AVOID (in production code) | R4 M4 S3 D4 C3 |
| PAT-004 | [Strategy = a function or a record of handlers](06-design-patterns/rules.md) | PREFER | R5 M5 S4 D4 C4 |
| PAT-005 | [Events: return them as values; use emitters only for in-process fan-out](06-design-patterns/rules.md) | PREFER | R4 M4 S4 D4 C3 |
| PAT-006 | [Cross-cutting behaviour via higher-order functions](06-design-patterns/rules.md) | PREFER | R4 M4 S4 D4 C3 |
| PAT-007 | [Inheritance at most one level deep](06-design-patterns/rules.md) | AVOID | R4 M4 S3 D4 C4 |
| ARCH-001 | [Modular monolith by default](07-architecture/rules.md) | MUST | R4 M5 S4 D5 C4 |
| ARCH-002 | [Organize by feature, not by technical layer](07-architecture/rules.md) | MUST | R5 M5 S5 D3 C5 |
| ARCH-003 | [Ports and adapters only at real I/O seams](07-architecture/rules.md) | MUST (at seams) / AVOID (elsewhere) | R4 M5 S5 D4 C4 |
| ARCH-004 | [Pure DI in one composition root; no DI container](07-architecture/rules.md) | MUST | R5 M5 S4 D5 C3 |
| ARCH-005 | [A use case is a function; a transaction script is fine for CRUD](07-architecture/rules.md) | PREFER | R5 M4 S4 D4 C3 |
| ARCH-006 | [No CQRS or event sourcing unless it is the core domain](07-architecture/rules.md) | AVOID | R3 M3 S4 D3 C4 |
| ARCH-007 | [Dependency direction: http -> service -> data; domain depends on nothing](07-architecture/rules.md) | MUST | R4 M5 S5 D3 C4 |
| ASYNC-001 | [No floating promises](08-async-concurrency/rules.md) | MUST NOT | R4 M5 S5 D4 C5 |
| ASYNC-002 | [Never block the event loop](08-async-concurrency/rules.md) | MUST NOT | R4 M4 S5 D5 C5 |
| ASYNC-003 | [Bounded concurrency for fan-out](08-async-concurrency/rules.md) | MUST | R4 M4 S5 D5 C4 |
| ASYNC-004 | [Every outbound I/O has a timeout and is cancellable](08-async-concurrency/rules.md) | MUST | R4 M5 S5 D5 C5 |
| ASYNC-005 | [CPU-bound work in a pooled worker, never one worker per request](08-async-concurrency/rules.md) | MUST | R3 M4 S5 D5 C4 |
| ASYNC-006 | [Retries are bounded, jittered and only for idempotent operations](08-async-concurrency/rules.md) | MUST | R4 M5 S5 D4 C5 |
| ASYNC-007 | [Streams via `pipeline` from `node:stream/promises`](08-async-concurrency/rules.md) | MUST | R4 M5 S5 D5 C5 |
| ASYNC-008 | [Request context via `AsyncLocalStorage`, not parameter threading of loggers](08-async-concurrency/rules.md) | PREFER | R4 M4 S4 D4 C3 |
| VAL-001 | [Every untrusted input is parsed by a schema at the boundary](09-validation-config-io/rules.md) | MUST | R5 M5 S5 D4 C5 |
| VAL-002 | [Zod 4 is the single validation library](09-validation-config-io/rules.md) | MUST | R5 M5 S4 D4 C4 |
| VAL-003 | [Env is parsed once at boot into a frozen, typed config](09-validation-config-io/rules.md) | MUST | R5 M5 S5 D5 C5 |
| VAL-004 | [Use `--env-file` for local `.env`; no `dotenv` in production code](09-validation-config-io/rules.md) | PREFER | R4 M4 S4 D4 C4 |
| VAL-005 | [`NODE_ENV=production` in every deployed environment](09-validation-config-io/rules.md) | MUST | R4 M4 S4 D5 C4 |
| VAL-006 | [Validate outbound data you don't control](09-validation-config-io/rules.md) | PREFER | R4 M5 S4 D3 C4 |
| DATA-001 | [SQL-transparent, typed query layer](10-data-access/rules.md) | MUST | R4 M5 S5 D5 C4 |
| DATA-002 | [Versioned, reviewed SQL migrations; never `push` in shared environments](10-data-access/rules.md) | MUST | R4 M5 S5 D5 C5 |
| DATA-003 | [One repository port per aggregate; no generic `Repository<T>`](10-data-access/rules.md) | PREFER | R4 M5 S4 D4 C3 |
| DATA-004 | [Transactions are scoped callbacks](10-data-access/rules.md) | MUST | R4 M5 S5 D4 C5 |
| DATA-005 | [Small pools sized by formula](10-data-access/rules.md) | MUST | R3 M4 S5 D5 C5 |
| DATA-006 | [Transactional outbox for events that must follow a write](10-data-access/rules.md) | MUST (when publishing events) | R3 M5 S5 D4 C5 |
| DATA-007 | [IDs: generated in the app, typed with brands](10-data-access/rules.md) | PREFER | R4 M4 S5 D4 C3 |
| HTTP-001 | [Fastify 5 is the HTTP framework](11-http-apis/rules.md) | MUST (new Node services) | R4 M5 S5 D5 C4 |
| HTTP-002 | [Every route declares schemas for params, query, body and response](11-http-apis/rules.md) | MUST | R5 M5 S5 D4 C4 |
| HTTP-003 | [Route handlers are thin](11-http-apis/rules.md) | MUST | R5 M5 S4 D3 C4 |
| HTTP-004 | [One central error handler emitting RFC 9457 problem+json](11-http-apis/rules.md) | MUST | R4 M5 S5 D4 C4 |
| HTTP-005 | [Liveness and readiness are separate endpoints](11-http-apis/rules.md) | MUST | R4 M5 S5 D5 C5 |
| HTTP-006 | [Server limits are explicit](11-http-apis/rules.md) | MUST | R4 M4 S5 D5 C5 |
| HTTP-007 | [Graceful shutdown: stop accepting, fail readiness, drain, exit with a deadline](11-http-apis/rules.md) | MUST | R4 M5 S5 D5 C5 |
| HTTP-008 | [Shed load instead of queueing forever](11-http-apis/rules.md) | PREFER | R3 M4 S5 D5 C4 |
| HTTP-009 | [Version and document the API from the schemas](11-http-apis/rules.md) | PREFER | R4 M5 S4 D3 C4 |
| TEST-001 | [Vitest is the test runner for applications](12-testing/rules.md) | MUST | R5 M5 S4 D4 C4 |
| TEST-002 | [Test pyramid: unit tests by the file, integration tests through the HTTP layer](12-testing/rules.md) | MUST | R4 M5 S5 D4 C4 |
| TEST-003 | [Test behaviour through public APIs; don't mock what you own](12-testing/rules.md) | PREFER | R4 M5 S4 D3 C4 |
| TEST-004 | [Tests are deterministic](12-testing/rules.md) | MUST | R4 M5 S4 D4 C5 |
| TEST-005 | [Type-level tests for type utilities](12-testing/rules.md) | MUST (for `src/lib` generics) | R3 M5 S4 D3 C3 |
| TEST-006 | [Typecheck is part of the test gate](12-testing/rules.md) | MUST | R4 M5 S5 D4 C5 |
| TOOL-001 | [ESLint 10 flat config with type-aware typescript-eslint](13-tooling/rules.md) | MUST | R4 M5 S4 D3 C4 |
| TOOL-002 | [Prettier formats; ESLint does not format](13-tooling/rules.md) | MUST | R5 M4 S4 D3 C4 |
| TOOL-003 | [Git hooks are fast and mirror CI](13-tooling/rules.md) | MUST | R4 M4 S4 D3 C4 |
| TOOL-004 | [Scripts are the interface](13-tooling/rules.md) | MUST | R5 M5 S4 D4 C4 |
| TOOL-005 | [No TS runner dependencies for development](13-tooling/rules.md) | PREFER | R4 M5 S4 D4 C3 |
| TOOL-006 | [Revisit the lint stack when TS 7.1 ships](13-tooling/rules.md) | PREFER (tracked) | R3 M4 S4 D4 C3 |
| PERF-001 | [Measure, then optimize](14-performance/rules.md) | MUST | R4 M5 S4 D5 C5 |
| PERF-002 | [The framework is not your bottleneck; pick for features](14-performance/rules.md) | PREFER | R4 M4 S4 D4 C4 |
| PERF-003 | [Production starts compiled, bundled JavaScript](14-performance/rules.md) | MUST | R4 M4 S4 D5 C4 |
| PERF-004 | [Use pino child loggers, and never log in tight synchronous loops](14-performance/rules.md) | MUST | R4 M4 S5 D5 C5 |
| PERF-005 | [Keep Zod by default; switch hot endpoints to JIT validation only when measured](14-performance/rules.md) | PREFER | R4 M4 S4 D4 C4 |
| PERF-006 | [Reuse connections; use undici for hot outbound HTTP](14-performance/rules.md) | PREFER | R3 M4 S5 D5 C4 |
| PERF-008 | [Enable Node's compile cache in production images](14-performance/rules.md) | PREFER | R4 M4 S4 D5 C3 |
| PERF-007 | [Scale out with processes, not threads; size the pool to the CPU quota](14-performance/rules.md) | PREFER | R4 M4 S5 D5 C4 |
| BUILD-001 | [Typecheck with tsc, emit with a bundler](15-build-and-deploy/rules.md) | MUST | R4 M5 S4 D5 C4 |
| BUILD-002 | [Multi-stage Dockerfile: deps -> build -> prod-deps -> runtime](15-build-and-deploy/rules.md) | MUST | R4 M5 S5 D5 C5 |
| BUILD-003 | [Run `node` directly as a non-root user; exec-form CMD](15-build-and-deploy/rules.md) | MUST | R4 M5 S5 D5 C5 |
| BUILD-004 | [Base image: pinned Node LTS; the variant is chosen by ADR](15-build-and-deploy/rules.md) | MUST (pinning) / PREFER (variant) | R3 M4 S4 D5 C3 |
| BUILD-005 | [No migrations or other one-off jobs in the container CMD](15-build-and-deploy/rules.md) | MUST NOT | R4 M5 S5 D4 C4 |
| BUILD-006 | [CI: quality, test matrix, build plus smoke test plus image](15-build-and-deploy/rules.md) | MUST | R4 M5 S5 D4 C4 |
| BUILD-007 | [Health endpoints wired to the orchestrator](15-build-and-deploy/rules.md) | MUST | R4 M5 S5 D5 C5 |
| BUILD-008 | [Source maps on in production](15-build-and-deploy/rules.md) | PREFER | R4 M4 S4 D3 C4 |
| OBS-001 | [Structured JSON logs to stdout with pino](16-observability/rules.md) | MUST | R4 M5 S5 D5 C5 |
| OBS-002 | [Every log line in a request carries the request id](16-observability/rules.md) | MUST | R4 M5 S5 D4 C5 |
| OBS-003 | [OpenTelemetry loaded before app code, instrumentations selected](16-observability/rules.md) | PREFER | R3 M4 S5 D3 C4 |
| OBS-004 | [Expose event-loop and process health metrics](16-observability/rules.md) | PREFER | R3 M4 S5 D5 C4 |
| OBS-005 | [Log levels mean something](16-observability/rules.md) | MUST | R4 M4 S4 D4 C4 |
| SEC-001 | [Treat `npm install` as remote code execution](17-security/rules.md) | MUST | R3 M5 S5 D4 C5 |
| SEC-002 | [Secrets come from the environment or a secret manager; never the repo or the image](17-security/rules.md) | MUST | R4 M5 S5 D5 C5 |
| SEC-003 | [HTTP hardening defaults](17-security/rules.md) | MUST | R4 M4 S5 D4 C5 |
| SEC-004 | [Parameterized queries only](17-security/rules.md) | MUST | R4 M5 S5 D4 C5 |
| SEC-005 | [Containers run as non-root with a minimal surface](17-security/rules.md) | MUST | R3 M4 S5 D5 C5 |
| SEC-006 | [CI supply-chain hygiene](17-security/rules.md) | MUST | R3 M5 S5 D4 C4 |
| SEC-007 | [The Node permission model is defense in depth, not a sandbox](17-security/rules.md) | PREFER (CLIs/scripts), AVOID relying on it for untrusted code | R3 M3 S3 D3 C4 |
| SEC-008 | [Use timing-safe comparisons and vetted crypto](17-security/rules.md) | MUST | R3 M4 S4 D4 C5 |
| DEP-001 | [Every new runtime dependency is justified in the PR](18-dependencies/rules.md) | MUST | R4 M5 S4 D4 C4 |
| DEP-002 | [One lockfile, committed; exact CI installs](18-dependencies/rules.md) | MUST | R4 M5 S5 D5 C5 |
| DEP-003 | [Automated, grouped, delayed updates](18-dependencies/rules.md) | MUST | R3 M5 S4 D4 C4 |
| DEP-004 | [ESM-only packages; no dual builds for internal libraries](18-dependencies/rules.md) | MUST | R4 M5 S4 D4 C4 |
| DEP-005 | [Pin the toolchain](18-dependencies/rules.md) | MUST | R4 M5 S4 D4 C4 |
