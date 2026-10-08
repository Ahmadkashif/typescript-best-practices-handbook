# Phase 3: Deep dive

Scope of this file: feature verdicts, article claim clusters with conflict resolution, and the mapping of book patterns to TS idioms. Two parallel agents own the other Phase 3 work:
- the boilerplate deep read (25+ repos) and its tallies: `phase-3/boilerplate-deep-dive.md`
- the benchmarks: `phase-3/bench/` (`results.md`)

Their outputs feed Phase 4. Where this file needs their data, it says "-> bench" or "-> boilerplate".

## 3.1 Feature verdicts (final)

The full 220-row table is in `phase-2/ts-feature-catalog.md` and is republished as `guide/01-language-features/catalog.md`. The reconciled verdicts:

**BAN (MUST NOT)**
- **Enums and namespaces:** `enum`, `const enum`, `declare enum`; `namespace`/`module` with values; `import x = require()`; `export =`.
- **Classes and decorators:** parameter properties; legacy `experimentalDecorators` and `emitDecoratorMetadata`/`reflect-metadata`; TC39 decorators in house code.
- **Type escapes:**
  - `any`, except in generic constraints;
  - `{}`/`Object`/`Function` as types;
  - `as`-casts that override the checker, including `as unknown as T`;
  - non-null `!`; definite-assignment `!`;
  - `@ts-ignore`/`@ts-nocheck`.
- **Module style:** default exports (tool configs excepted); triple-slash references; `declare global` (except the Node typings and a single `env.d.ts`).
- **Removed or legacy config:**
  - `baseUrl`; `moduleResolution: node10/classic`;
  - `module: amd/umd/system/none`; `target: es5`;
  - `downlevelIteration`; `outFile`; `ignoreDeprecations`;
  - Node's `--experimental-transform-types`.

**RESTRICT (allowed only under the stated condition)**
- **Unchecked type-level tools:** `x is T` predicates only in tested parsers. Overloads only when a union or generic cannot express the API. Conditional, mapped and recursive types and `infer` only in `src/lib/` with type tests.
- **Classes:** abstract classes only where a framework requires them; `private` is replaced by `#private`. Declaration merging and module augmentation only in one `src/types/*.d.ts` per library.
- **Modules:** top-level `await` only in entrypoints. Dynamic `import()` only for optional or lazy dependencies. Barrel `index.ts` files only as the public API of a feature module, never re-exporting the whole tree.
- **Compiler/Node features:** `isolatedDeclarations` is a MUST for published libraries and optional for apps. Project references only once a repo has 3+ packages. `worker_threads` only for CPU-bound work, and pooled. The permission model only as defense in depth for CLIs and scripts.
- **Temporal / `Map.getOrInsert`:** only once the minimum Node is 26 (LTS from 2026-10-28). Until then use `Date` plus the time helpers in `lib/time.ts`.

**USE (MUST / PREFER)**
- **Type system:** discriminated unions plus `assertNever`; branded types; `satisfies`; `as const`; `unknown`; `readonly`; inferred type predicates (5.5); `NoInfer`; `const` type parameters; template literal types for keys.
- **Resources and runtime:** `using`/`await using`. `Error` `cause`; `AbortSignal.timeout`/`AbortSignal.any`; `structuredClone`; `node:` specifiers; `process.loadEnvFile`/`--env-file` for local dev only; `util.parseArgs` for CLIs; `node:test` mocks are not used (Vitest is the runner).
- **Compiler flags:** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, `isolatedModules`, `moduleDetection: force`, `module`/`moduleResolution: nodenext`, explicit `types: ["node"]` and `rootDir`.

**Reconciliation notes**
- `exactOptionalPropertyTypes`: A-052 calls it invasive and A-053 says libraries need it. The house turns it on because of TYPES-004 (absent vs undefined is meaningful). Dependencies are excluded by `skipLibCheck`. Severity is PREFER-level for existing codebases, MUST for new ones.
- `interface` vs `type`: A-028 favours `type`, A-059 favours `interface` (checker speed). Final: `type` by default, `interface` for extendable contracts. Under TS 7 the checker-speed argument shrinks (V-01, A-001).
- `noUncheckedIndexedAccess`: survey adoption is under 5%, but the article consensus is strong (A-050, A-007, A-008). The evidence beats boilerplate inertia, so MUST.

## 3.2 Article claim clusters: consensus, conflicts, resolutions

Inputs: `phase-2/articles.md` (150 rows, clusters at the end of each part). The table lists only resolutions that change a guide rule.

| # | Topic | Conflict | Resolution (rubric-driven) | Guide rule |
|---|---|---|---|---|
| C1 | TS 7 vs typescript-eslint | typescript-eslint needs TS <6.1 (V-03). TS 7 has no API (V-02). Biome v2 type-aware rules catch about 75% of floating promises (A-040) | Dual install: `typescript` aliased to `@typescript/typescript6` for tools, `@typescript/native` = TS 7 for `tsc`. Keep typescript-eslint for type-aware rules. Revisit when TS 7.1 ships its API | TOOL-001, TSC-010, ADR-0009 |
| C2 | Ship `.ts` (type stripping) vs compiled `.js` | No source decides it. Stripping can't touch `node_modules` (A-010) and costs startup | -> bench (start time). Default: compile/bundle for prod, use stripping for dev, scripts and tests | BUILD-001, ADR-0010 |
| C3 | Aliases: tsconfig `paths` (survey majority) vs `package.json#imports` (Node and TS docs) | Popularity vs. correctness | `#imports`: Node, TS `nodenext` and bundlers all resolve it with no runtime shim. `baseUrl` is removed in TS 7 (A-001, A-014, A-016). R5 M5 S5 D5 vs C2 | STRUCT-002, ADR-0003 |
| C4 | Errors: Result everywhere vs exceptions vs Effect | A-036/A-054 vs A-039/A-074 vs A-037/A-069 | Hybrid. A tiny in-house `Result` for expected domain failures. A typed `AppError` hierarchy for boundary and infrastructure errors, mapped to RFC 9457. Programmer errors crash. Effect = AVOID (paradigm cost) | ERR-*, ADR-0005 |
| C5 | Vitest vs node:test | DX vs zero dependencies | Vitest for apps (TS>=6 adopters lead with Vitest). node:test is acceptable for zero-dependency libraries | TEST-001 |
| C6 | Fastify vs Express vs Hono vs Nest | Speed (A-077: Fastify about 1.8x Express on hello-world) vs DX and popularity (Nest and Express lead the survey) vs portability (Hono) | -> bench. Prior: Fastify for Node-only services (schemas, encapsulation, built-in pino, speed); Hono if edge portability is a hard requirement; Nest AVOID (decorators are non-erasable, LANG-004) | HTTP-001, ADR-0001 |
| C7 | Zod vs TypeBox (Fastify) | TypeBox is native JSON Schema; Zod has DX, ecosystem and Standard Schema | Zod 4 as the single validator across env, HTTP, queue and DB JSON. `fastify-type-provider-zod` gives typed routes. TypeBox only if JSON Schema must be the source of truth | VAL-002, ADR-0004 |
| C8 | Drizzle vs Prisma vs Kysely | Prisma's `latest` is an 8.0 RC (V-06) | Drizzle (or Kysely): SQL-transparent, no binary, versioned SQL migrations. Prisma AVOID until 8.0 ships GA | DATA-001, ADR-0007 |
| C9 | Base image: slim vs distroless vs Alpine vs Chainguard | A-133 vs A-126 vs A-134 | -> bench (image sizes). Prior: build on `node:24-*-slim`, run on distroless `nodejs24 nonroot` if it boots, else slim. Alpine AVOID (musl) | BUILD-004, ADR-0011 |
| C10 | NODE_ENV per environment vs NODE_ENV=production everywhere | A-119/A-120 | `NODE_ENV=production` in every deployed environment. Behaviour differences come from explicit, validated config keys | VAL-005 |
| C11 | Full OTel auto-instrumentation vs selective | A-086/A-124 vs A-135 (about 80% throughput cost) | Use OTel, but enable only the http, fastify, pg and undici instrumentations, loaded via `--import`. Logs and metrics first | OBS-003 |
| C12 | Hexagonal everywhere vs vertical slices | A-103 vs A-102 | Feature (vertical) modules at the top level. Ports and adapters only at real I/O seams | ARCH-001, ARCH-003 |
| C13 | DI container (Nest, tsyringe, inversify) vs pure DI | A-142 vs A-101 | Pure DI via factory functions in one composition root. Containers need decorators and reflect-metadata (banned) | ARCH-004, ADR-0006 |
| C14 | `noUncheckedIndexedAccess` false positives | A-051 vs A-050 | MUST, with idioms (`for...of`, `.at()` plus a check) | TYPES-008 |
| C15 | "Use TS sparingly" (A-076) vs strict-everywhere (A-088..A-093) | Wording | Strict TS everywhere. "Sparingly" means no type gymnastics (TYPES-006) | PRIN-001 |
| C16 | Lint/format: ESLint+Prettier vs Biome vs oxlint | Survey: ESLint 54% of TS>=6 adopters; Biome/oxlint rising | ESLint (flat config) + typescript-eslint `strictTypeChecked` for type-aware rules. Prettier for formatting, or Biome-format if the boilerplate agent picks it (-> boilerplate) | TOOL-*, ADR-0009 |

Consensus with no conflict (becomes MUST directly, with 2+ sources each):
- **Language and modules:** ESM-only (A-015, A-049, A-143); explicit `.ts`/`.js` extensions (A-075, A-010); no floating promises (A-021, A-040).
- **Errors:** `Error` `cause` (A-038, A-074); operational vs programmer errors (A-039, A-076); RFC 9457 problem details (A-147, A-076).
- **Validation and config:** parse at the boundary (A-019, A-121); env validated at boot (A-058, A-119, A-120).
- **Logging:** pino NDJSON to stdout with redaction (A-084, A-085, A-122).
- **Health and shutdown:**
  - Graceful shutdown: readiness off, then drain, then a forced exit timeout (A-087, A-139).
  - Liveness doesn't check dependencies (A-123).
  - `keepAliveTimeout` above the load balancer's idle timeout (A-137).
- **Containers:**
  - Multi-stage build, non-root user, `npm ci --omit=dev`, `.dockerignore` (A-081, A-083, A-128).
  - Run `node` directly, not `npm start` (A-081, A-083).
- **Runtime performance:** never block the event loop (A-078, A-130); pooled workers for CPU work (A-136); stream backpressure via `pipeline` (A-125); `undici` for hot outbound calls (A-100).
- **Database:** small connection pools (A-105, A-106); expand/contract migrations (A-114); outbox (A-113).
- **Supply chain:**
  - Lockfile plus `npm ci`; `--ignore-scripts`; a release-age cooldown (A-082, A-131, A-132).
  - Actions pinned to SHAs (A-141); trusted publishing (A-127).
- **HTTP hardening:** body limits, rate limits and helmet (A-080, A-129, A-145, A-146).

## 3.3 Book patterns -> TS idioms

Source: `phase-2/books.md` (B-01..B-18). Verdict "pays off" means the pattern appears as a rule. "Ceremony" means a rule bans or discourages its class-heavy form.

| Pattern (book) | Verdict | TS-idiomatic form | Rule |
|---|---|---|---|
| Singleton (B-04) | Ceremony | One module-scoped instance, created in the composition root and passed down | PAT-001 |
| Factory Method / Abstract Factory (B-04) | Factory function pays off; Abstract Factory is ceremony | `createX(deps): X` returning an object literal; a record of factories | PAT-002 |
| Builder (B-04) | Test data only | `buildUser(overrides?: Partial<User>)` | PAT-003 |
| Strategy (B-04, B-03) | Pays off | A function parameter or `Record<Kind, Handler>` | PAT-004 |
| State / Visitor (B-04, B-11) | Pays off | Discriminated union + exhaustive `switch` + `assertNever` | TYPES-001 |
| Observer (B-03) | Pays off, bounded | Typed `EventEmitter` wrappers; domain events returned as values | PAT-005 |
| Adapter / Gateway / Anti-corruption layer (B-04, B-06, B-10) | Pays off strongly | Port `type` + one adapter module per vendor | ARCH-003 |
| Facade (B-04, B-13) | Pays off | Feature module `index.ts` | ARCH-002 |
| Decorator (wrapping, B-04) | Pays off | Higher-order functions `withRetry`, `withTimeout` | PAT-006 |
| `@Decorators` + reflection DI | Ceremony / banned | Explicit wiring | LANG-004, ARCH-004 |
| Repository (B-06, B-07, B-10) | Pays off only for aggregates with invariants | Function module over the query builder; no generic `Repository<T>` | DATA-003 |
| Unit of Work (B-10) | Ceremony | `db.transaction(async (tx) => ...)` | DATA-004 |
| Value Object (B-06, B-11) | Pays off | Branded type + smart constructor | TYPES-002 |
| Result / Railway (B-11) | Pays off for expected errors; monad libraries are ceremony | Small `Result<T,E>` union + `ok`/`err` | ERR-002 |
| Use-case class per action (B-09) | Ceremony for CRUD | Transaction-script function per use case (B-08) | ARCH-005 |
| Ports & Adapters / Clean (B-09) | Pays off at I/O seams only | Domain imports no infrastructure; enforced by lint | ARCH-003 |
| Timeout / Circuit breaker / Bulkhead (B-14) | Pays off | `AbortSignal.timeout`, bounded concurrency, breaker on flaky dependencies | ASYNC-004, ASYNC-006 |
| Outbox (B-12, A-113) | Pays off when emitting events | Outbox row in the same transaction | DATA-006 |
| CQRS / Event sourcing (B-07, B-18) | Ceremony unless it is the core domain | Plain queries | ARCH-006 |
| Modular monolith (B-18, A-148) | Default | Feature modules with enforced import boundaries | ARCH-001 |
