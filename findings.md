# Findings: Opinionated TypeScript + Node.js Backend Guide & Boilerplate

**Topic dir:** `research/typescript-backend-guide/` · **Completed:** 2026-10-07 · **Plan status:** Complete

## Executive summary

As of 2026-10-06, `typescript@latest` is **7.0.2**, the native Go compiler, released 2026-07-08. It has **no JS API**. typescript-eslint 8.71 still requires `typescript <6.1`. The working setup is the TS team's documented dual install:
- `@typescript/native` (`npm:typescript@^7.0.2`) supplies `tsc`.
- `typescript` (`npm:@typescript/typescript6@^6.0.2`) supplies the API for linters.

TS 7 also removes `baseUrl`, `node10`/`classic` resolution and ES5. It defaults `strict` on and `types` to `[]`.

**Node 24 "Krypton" is Active LTS** (24.21.0). Its type stripping has been stable since 24.12. **Node 26 becomes LTS on 2026-10-28.**

These facts, plus the evidence below, produce a standard built on four ideas:
1. Write only **erasable TypeScript**: no enums, namespaces, parameter properties or decorators.
2. Use **ESM** with `package.json#imports` aliases.
3. **Parse at the boundaries** with Zod.
4. Typecheck with **TS 7**, but ship **bundled JS**.

Evidence base:
- **Articles:** 150 (A-001..A-150).
- **Books:** 18 (B-01..B-18).
- **Feature catalog:** 220 rows (34 BAN / 59 RESTRICT / 128 USE).
- **Boilerplates:** 270 surveyed via GitHub metadata (from 839 candidates), 32 read in depth.
- **Benchmarks:** six reproducible suites.

Key measurements:
- **Typechecking:** TS 7 is about 7.6x faster than TS 6 (408 vs 3,094 ms at 36k LOC) and uses half the memory.
- **Framework throughput** (validated POST, as % of raw node:http): Fastify 100%, Hono 94%, Fastify+Zod 92%, Nest-on-Fastify 88%, Express 5 70%.
- **Start-up:** a bundle starts 37–50% faster than unbundled output. Running `.ts` directly via type stripping costs +15–63%. ESM and CJS start-up are equal. Node's compile cache saves another 15–25%.
- **Logging:** pino is 1.8x faster than winston.
- **Validation:** Zod costs at most about 3.3 µs per request.
- **Images (compressed):** distroless 55.6 MB, alpine 61.9 MB, slim 81.1 MB.

Deliverables:
- **Guide:** 143 rules (87 MUST, 16 MUST NOT, 34 PREFER, 4 AVOID, 2 RESTRICT) and 11 ADRs. All 41 code samples are typechecked with TS 7.0.2, and 0 problems remain.
- **Boilerplate:** passes every verification step, including Docker.

## Top 30 rules

1. **PRIN-001 (MUST):** zero errors under the house tsconfig. Never weaken a flag.
2. **PRIN-002 / TSC-003 (MUST):** erasable syntax only (`erasableSyntaxOnly`, `isolatedModules`).
3. **LANG-001 (MUST NOT):** no `enum`/`const enum`. Use `as const` objects plus unions.
4. **LANG-002 / LANG-003 (MUST NOT):** no namespaces with values, no `import =`, no parameter properties.
5. **LANG-004 (MUST NOT):** no decorators and no `emitDecoratorMetadata` in house code.
6. **LANG-005 (MUST NOT):** no `any`. Use `unknown` and narrow.
7. **LANG-006 (MUST NOT):** no `as`/`as unknown as`/`!` to silence the checker. Use `satisfies` and parsers.
8. **TSC-001 (MUST):** `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `noImplicitOverride`/`Returns` + `noPropertyAccessFromIndexSignature` + `noUnused*`.
9. **TSC-002 (MUST):** `module`/`moduleResolution: nodenext`, `verbatimModuleSyntax`, `moduleDetection: force`.
10. **TSC-006 (MUST NOT):** no `baseUrl` and no `paths`.
11. **TSC-010 (MUST):** TS 7 `tsc` for typechecking plus the `@typescript/typescript6` alias for typescript-eslint, until TS 7.1 ships its API.
12. **STRUCT-001 (MUST):** ESM only.
13. **STRUCT-002 (MUST):** aliases only via `package.json#imports` (`#src/*.ts`); `../` imports banned. This deliberately overrides the survey majority (`paths`).
14. **STRUCT-005 (MUST):** only `main.ts` has import-time side effects. `buildApp()` never listens.
15. **TYPES-001 (MUST):** discriminated unions with an exhaustive `switch` plus `assertNever`.
16. **TYPES-002 (MUST):** branded IDs and validated scalars via smart constructors or Zod brands.
17. **TYPES-003 / VAL-001 (MUST):** parse, don't validate. Every untrusted input goes through a schema at the boundary.
18. **TYPES-007 (MUST):** money is integer minor units (`bigint`) or a decimal, never a float.
19. **ERR-001 (MUST):** throw only `Error`s, and wrap with `cause`.
20. **ERR-003 / HTTP-004 (MUST):** one `AppError` hierarchy (`code`, `status`, `expose`), mapped centrally to RFC 9457 problem+json.
21. **ERR-006 (MUST):** crash (graceful, non-zero exit) on programmer errors and unhandled rejections.
22. **ASYNC-001 (MUST NOT):** no floating promises (type-aware lint).
23. **ASYNC-004 (MUST):** every outbound I/O has a timeout or cancellation (`AbortSignal.timeout`/`any`).
24. **VAL-003 (MUST):** env is parsed once at boot into a frozen typed config. Nothing else reads `process.env`.
25. **ARCH-002 / ARCH-004 (MUST):** feature folders, and pure DI in one composition root (`src/container.ts`). No DI container.
26. **HTTP-001 / HTTP-002 (MUST):** Fastify 5 with Zod schemas for params, query, body and response on every route.
27. **HTTP-005 / HTTP-007 (MUST):** separate `/health` (liveness) and `/ready` (readiness). Graceful shutdown: fail readiness, drain, then exit with a deadline.
28. **OBS-001 (MUST):** pino NDJSON to stdout with redaction. No `console.log`, no winston.
29. **PERF-003 / BUILD-001 (MUST):** `tsc` is the type gate. Production runs a tsdown bundle (`node dist/main.js`), never `.ts` sources.
30. **BUILD-002 / BUILD-003 / SEC-001 (MUST):**
    - Multi-stage image, non-root, exec-form `node` CMD (never `npm start`).
    - `npm ci --ignore-scripts`.
    - Release-age cooldown on dependency updates.

## Decision summary (ADRs in `guide/decisions/`)

| ADR | Decision |
|---|---|
| 0001 | **Fastify 5** + `fastify-type-provider-zod`. Hono by ADR for edge/multi-runtime. Express 5 and NestJS AVOID for new services |
| 0002 | **ESM only**, nodenext. ESM and CJS start-up measured equal |
| 0003 | **`package.json#imports`** (`#src/*`, `#test/*`) with `.ts` extensions |
| 0004 | **Zod 4** everywhere. Valibot by ADR for serverless. JIT validation only on measured hot paths |
| 0005 | **AppError + RFC 9457**, crash on bugs. In-house `Result` PREFER for multi-outcome domain logic. No neverthrow/Effect |
| 0006 | **Pure DI**, composition root `src/container.ts` |
| 0007 | **Repository port per feature** + in-memory adapter. **Drizzle** (or Kysely) for the first database. Prisma AVOID while 8.0 is an RC |
| 0008 | **Vitest 5** with unit + integration projects and v8 coverage thresholds |
| 0009 | **ESLint 10 strictTypeChecked + Prettier + husky/lint-staged**. TS 7 `tsc` + TS 6 API alias |
| 0010 | **Dev:** `node --watch --env-file-if-exists=.env src/main.ts`. **Prod:** tsdown bundle |
| 0011 | **Alpine** as built. Distroless is an open question (OQ-1) |

## Boilerplate summary and verification

`boilerplate/` contains:
- **Runtime:** Node ≥24.12, ESM, `#src`/`#test` imports, the house strict tsconfig (`noEmit`).
- **Entry and wiring:**
  - `main.ts`: config → container → app → listen, plus close-with-grace shutdown.
  - `app.ts`: Fastify + Zod provider, timeouts, body limit.
  - `container.ts`: composition root.
- **Config and HTTP:**
  - `config/env.ts`: Zod env schema, frozen, fails fast.
  - `http/error-handler.ts`: RFC 9457.
  - `http/health.ts`: `/health` and `/ready` (dependency checks with timeouts, 503 during shutdown).
- **Utilities (`lib/`):**
  - `AppError` family, pino options with redaction.
  - `assertNever`, `Brand`/`uuidId`.
  - bigint decimal math with half-even rounding and allocation.
  - retry with exponential backoff, full jitter and `AbortSignal`.
  - time helpers and an injectable `Clock`.
- **Example module:** `todos` (schema / repository port + in-memory adapter / service / routes).
- **Tests:** Vitest unit + integration (`inject()` and a real-socket boot test).
- **Tooling:** ESLint 10 type-aware, Prettier, husky (pre-commit lint-staged; pre-push typecheck + unit tests).
- **Docker:** 4-stage Dockerfile on `node:24.21.0-alpine3.23`, `USER node`, `HEALTHCHECK`, exec-form CMD.
- **CI:** GitHub Actions with three jobs: quality; a test matrix on Node 24 and 26; build + boot smoke test + docker build.
- **README** with the commands.

**Verification (`phase-5/verify.log`, OVERALL: PASS; Node 24.15.0, npm 11.12.1, Docker 29.8.1):**

| Step | Result |
|---|---|
| Clean install (`npm ci`) | pass. Resolved tsc 7.0.2 and tsc6 6.0.3 |
| `format:check` | pass. Failed once on README formatting, fixed and re-run |
| typecheck (TS 7) | pass, 0.3 s |
| lint (type-aware, `--max-warnings=0`) | pass |
| test + coverage | 11 files / 38 tests pass. 94.9% statements, 88.1% branches, 96.0% lines |
| build | pass. `dist/main.js` is 13.4 kB |
| Start built server, `curl /health` | **200**. `/ready` 200. POST 201. Invalid input returns 400 problem+json |
| SIGTERM | clean shutdown, exit 0 |
| `docker build` | pass. Image is 271 MB unpacked; app layers are 26.7 MB |
| `docker run` + `/health` | 200, runs as `node`. `docker stop` took 0.13 s, exit 0 |
| Extras | hadolint: info only. actionlint: pass. Dev mode via type stripping: 200. Invalid env: one fatal JSON line, exit 1 |
| My re-check on 2026-10-07 | typecheck ok; 11 files / 38 tests pass |

Not verified: the GHA workflow actually running on GitHub (it was only linted), and a local Node 26 run (CI's matrix covers 26).

**Guide snippet check** (`phase-5/snippet-check/`, TS 7.0.2, house flags plus `esnext.disposable`): 41 samples, 37 that must compile and 4 that must fail. **0 problems.**

## Benchmark highlights (`phase-3/bench/results.md`)

Machine: i7-10700K, Node 24.21.0, medians. Read the ratios, not the absolute numbers.

- **HTTP (req/s):**
  - GET: node:http 40.5k, Hono 38.4k, Nest-Fastify 35.8k, Fastify 35.3k, Express 25.0k.
  - Validated POST: Fastify 22.1k, node:http 22.1k, Hono 20.8k, Fastify+Zod 20.3k, Nest 19.5k, Express 15.5k.
- **Typecheck at 36k LOC:** tsc 6 took 3,094 ms / 494 MB; tsc 7 took 408 ms / 241 MB. At 144k LOC: 8 s vs 1.1 s.
- **Start-up (small app):**
  - Bundle 107 ms, 88 ms with compile cache.
  - Unbundled 169 ms.
  - Type stripping 194 ms; tsx 284–324 ms.
  - ESM equals CJS.
- **Validation (valid ops/s):** Zod 4 307k, Valibot 434k, TypeBox compiled 4.2M, ajv 1.3M.
- **Logging (lines/s to a pipe):** pino 374k (child logger 493k), winston 200k.
- **Image size (compressed):** distroless 55.6 MB, alpine 61.9 MB, slim 81.1 MB.

## Open questions

- **OQ-1 Runtime base image: Alpine (as built) vs distroless (bench).**
  - *Boilerplate agent's position:* Alpine is the deep-read majority (12 of 20 Dockerfiles). Using one image in every stage avoids glibc/musl mixing. It is verified working.
  - *Bench agent's position:* build on `node:24-slim` and run on `gcr.io/distroless/nodejs24-debian13:nonroot`. It is smaller (55.6 vs 61.9 MB compressed), non-root by default, and has no shell. musl is an experimental-tier Node platform, so AVOID Alpine.
  - *Status:* recorded in ADR-0011 and BUILD-004. The guide does not diverge from `boilerplate/`. Proposed: switch to distroless in the next boilerplate iteration, once the HEALTHCHECK (`node -e`, needs no shell) and close-with-grace behaviour are re-verified.
- **OQ-2 TS 7.1 API (expected around Oct 2026).** Drop the `@typescript/typescript6` alias once typescript-eslint supports TS 7.1. Then re-benchmark Biome v2 and oxlint type-aware rules; Biome's floating-promise coverage is about 75% of typescript-eslint's.
- **OQ-3 ORM overhead was not benchmarked.** The Drizzle/Kysely-over-Prisma choice rests on articles and the survey trend, plus Prisma's `latest` being an 8.0 RC. Benchmark it once a real database adapter is added.
- **OQ-4 Guide requirements the boilerplate does not meet yet:**
  - GHA actions are pinned by tag, not commit SHA (SEC-006).
  - No Node compile cache (PERF-008, worth 15–25% of boot time).
  - Recommended lint additions: `n/no-process-env`, `n/no-sync`, `consistent-type-assertions: never`, no-default-export, `import/no-restricted-paths`.
  - Each gap is flagged in the relevant rule and in `guide/README.md`.
- **OQ-5 Node 26 LTS (2026-10-28).** Raise `engines` to ≥26, then allow Temporal and `Map.getOrInsert` (currently RESTRICT).
- **OQ-6 Express 5 numbers come from one machine.** Its 1.4x gap supports AVOID, not a mandate to migrate existing services.

## Where things are

- **Guide:** `research/typescript-backend-guide/guide/`
  - `README.md`: how to read it, the rubric, and the full 143-rule index with levels and rubric scores.
  - `dos-and-donts.md`: one page of every MUST and MUST NOT.
  - `00-principles` … `18-dependencies`: each has a README and `rules.md`. `01-language-features/catalog.md` is the full USE/RESTRICT/BAN table.
  - `decisions/0001–0011`: the ADRs.
- **Boilerplate:** `research/typescript-backend-guide/boilerplate/`. Commands are in its README.
- **Working files:**
  - `phase-1/scope.md`
  - `phase-2/` (`ts-feature-catalog.md`, `articles.md`, `books.md`, `boilerplates.csv`/`.md`, `discovery.md`, `scripts/`)
  - `phase-3/deep-dive.md`, `phase-3/boilerplate-deep-dive.md`, `phase-3/bench/`
  - `phase-4/synthesis.md`
  - `phase-5/verify.log`, `phase-5/snippet-check/`
  - `sources.md`
- **Ignored:** `.gitignore` covers `phase-2/repos/` (32+ untrusted shallow clones, never executed), `node_modules/` and `dist/`.
