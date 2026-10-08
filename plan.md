# Research Plan: Opinionated TypeScript + Node.js Backend Guide & Boilerplate

**Topic dir:** `research/typescript-backend-guide/`
**Created:** 2026-10-06
**Status:** Complete (2026-10-07)

## Context

The user wants a single, strict, no-wiggle-room house standard for writing backend TypeScript on Node.js. It should be built from evidence, not taste. There are two deliverables:

1. **`guide/`**: a hierarchical documentation tree of rules (MUST / MUST NOT), each backed by sources and judged on readability, maintainability, scalability, deployability and performance.
2. **`boilerplate/`**: a production-ready TypeScript server starter, chosen by surveying open-source boilerplates. It must install, typecheck, lint, test, build and boot on day one.

## Research Questions

1. What is the complete TypeScript feature set as of the latest stable release (including the native/Go compiler status), and which features should we use, restrict or ban on the backend?
2. What do the top 100–200 Node/TS best-practice and performance articles agree on, and where do they disagree?
3. Which design-pattern and architecture books apply to TS/Node, and which patterns actually pay off (vs. ceremony)?
4. What do the best open-source TS server boilerplates converge on (framework, module system, aliases, validation, logging, testing, build, Docker, CI)?
5. Which choices give the most benefit in deployment (build speed, image size, cold start, runtime perf)?

## Opinion Rubric (applied to every rule)

Each candidate practice is scored 1–5 on: **Readability · Maintainability · Scalability · Deploy/Perf · Ecosystem consensus**. A rule becomes MUST/MUST NOT only with ≥2 independent credible sources or a reproducible measurement. Otherwise it is marked PREFER/AVOID or dropped.

## Success Criteria

- Feature catalog covers every TS language/compiler feature with a verdict: USE / RESTRICT / BAN.
- ≥100 articles consumed (target 150), each logged with URL, date, author credibility, and extracted claims.
- ≥10 design-pattern/architecture books catalogued with key takeaways (from publisher pages, TOCs, reviews, author talks; no pirated copies).
- ≥100 boilerplate repos surveyed via metadata (target 200), with ≥25 read in depth; a choices matrix with tallies.
- `guide/` tree complete, with every rule following the rule format below and every code sample typechecked.
- `boilerplate/` passes: `install → typecheck → lint → test → build → start → /health returns 200` (+ `docker build` if Docker is available).

---

## Phase 1: Scoping

**Goal:** Lock down versions, boundaries and the rule format.

- Confirm current stable versions: TypeScript (incl. TS 7 / native `tsgo` status), Node LTS, and Node's native type-stripping status.
- Scope IN: backend Node.js + TS (HTTP APIs, workers, CLIs, libraries). Scope OUT: frontend/React, Deno/Bun as primary targets (they appear only as deploy/runtime comparisons).
- Define the rule format: `ID (e.g. TYPES-004) · Rule · Level (MUST/MUST NOT/PREFER/AVOID) · Why · Good/Bad example · Enforcement (tsconfig flag / lint rule / CI check) · Sources`.
- Finalize the guide tree outline (below).

**Output:** `phase-1/scope.md`

---

## Phase 2: Discovery

**Goal:** Gather all four raw corpora. Log progressively so the work can be resumed.

- **2A Feature catalog:** TS handbook plus every release note (1.x → latest) and Node features relevant to TS (type stripping, `node:test`, `--env-file`, permission model, etc.). → `phase-2/ts-feature-catalog.md`
- **2B Article corpus (100–200):** official docs, Node.js best-practices repo, Matt Pocock/Total TypeScript, TS team blogs, Node core/TSC blogs, engineering blogs (Netflix, Shopify, Vercel, Cloudflare, etc.) and perf write-ups. One row per article: URL, date, credibility, claims. → `phase-2/articles.md`
- **2C Books:** design patterns (GoF adapted to TS), DDD, Clean/Hexagonal architecture, Effective TypeScript, Programming TypeScript, Node.js Design Patterns, Refactoring, functional TS, etc. → `phase-2/books.md`
- **2D Boilerplate survey:** use `gh search repos` / `gh api` (topics: typescript, nodejs, boilerplate, starter, template, api, fastify, express, hono, nestjs). Record stars, last commit, framework, module system, alias method, validation, ORM, logger, test runner, linter, build tool, Docker, CI. → `phase-2/boilerplates.csv` + `phase-2/boilerplates.md`

**Output:** `phase-2/discovery.md` (index + counts)

---

## Phase 3: Deep Analysis

**Goal:** Turn the corpora into scored opinions.

- Verdict for every catalog feature (e.g. `enum` → BAN in favor of `as const` unions; `namespace` → BAN; `satisfies`, `using`, discriminated unions, branded types → USE).
- Cluster article claims by guide section; note consensus vs. conflict and resolve each conflict with the rubric.
- Map book patterns to TS idioms, and flag which patterns are ceremony in TS (e.g. class-heavy Singleton/Factory vs. modules and functions).
- Deep-read 25+ top boilerplates and tally the converged choices.
- Run small reproducible benchmarks where the claims conflict (e.g. framework req/s, tsc vs. tsgo vs. type-stripping build/start time, image sizes). Keep scripts under `phase-3/bench/`.

**Output:** `phase-3/deep-dive.md` (+ `phase-3/bench/`)

---

## Phase 4: Synthesis

**Goal:** Freeze the opinions.

- Final rulebook: every rule with an ID, level, rubric score and sources.
- Decision records for big choices (framework, ESM, aliases via `package.json#imports` vs. `paths`, validation lib, error model, DI approach, ORM/query builder, test runner, lint/format tool, build/bundle, container base image).
- Boilerplate spec derived from the decisions.

**Output:** `phase-4/synthesis.md`

---

## Phase 5: Output

### 5A `guide/` tree (Markdown, one topic per file, `README.md` index per folder)

```
guide/
  README.md                 — how to read, rule-ID index, rubric
  dos-and-donts.md          — one-page cheat sheet of all MUST/MUST NOT
  00-principles/
  01-language-features/     — full catalog with USE/RESTRICT/BAN
  02-compiler-config/       — tsconfig, strict flags, module resolution
  03-project-structure/     — layout, aliases, imports/exports, monorepos
  04-type-design/           — unions, branded types, parse-don't-validate, generics
  05-error-handling/
  06-design-patterns/       — which patterns, TS-idiomatic forms, anti-patterns
  07-architecture/          — layering, modules, DI, boundaries
  08-async-concurrency/
  09-validation-config-io/
  10-data-access/
  11-http-apis/
  12-testing/
  13-tooling/               — lint, format, git hooks
  14-performance/
  15-build-and-deploy/      — build, bundle, Docker, startup, CI
  16-observability/
  17-security/
  18-dependencies/
  decisions/                — ADRs from Phase 4
```

All code samples are typechecked by extracting them into a scratch project under `phase-5/snippet-check/`.

### 5B `boilerplate/`

Stack chosen by Phase 4. It must include from day one:
- Strict tsconfig and an import alias setup
- Validated env config
- Structured logger
- HTTP server with health/readiness checks and graceful shutdown
- Central error model (typed errors or a Result type)
- Request validation
- DI/composition root
- Example feature module
- A utils lib: `assertNever`, branded IDs, safe number/decimal math, retry/backoff, time helpers
- Unit and integration tests
- Lint/format config, git hooks
- Multi-stage Dockerfile (small runtime image)
- CI workflow
- `README.md` with commands

**Verification (must pass, with logs saved to `phase-5/verify.log`):** clean install → typecheck → lint → test → build → start the built server → `curl /health` returns 200 → `docker build` (if available).

### 5C Final
- Write `sources.md` (all articles, books, repos, docs).
- Return the full `findings.md` content as the final message (exec summary, top 30 rules, decision summary, boilerplate summary, open questions). The orchestrator saves it.

---

## Agent Execution Notes

- One `general-purpose` Agent runs everything autonomously, with all tools allowed (Bash, Read, Write, Edit, WebFetch, WebSearch, Glob, Grep, `gh`).
- Name the Phase 3 file `phase-3/deep-dive.md`. Never write `findings.md`, `analysis.md` or any report-named file, and never work around that guard.
- Append to the phase files as work progresses, so a continuation Agent can resume from them if context runs out.
- Treat downloaded repos as untrusted: clone into isolated dirs under `phase-2/repos/` (gitignored, shallow) and do not run their scripts.

## Verification (orchestrator)

After the Agent returns: save `findings.md`, spot-check that `guide/` has all folders, and rerun `npm ci && npm run typecheck && npm test && npm run build` in `boilerplate/`.
