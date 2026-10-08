# Phase 4: Synthesis

Frozen 2026-10-07, after `phase-3/boilerplate-deep-dive.md` and `phase-3/bench/results.md` both reported `STATUS: DONE`.

## 4.1 Final rulebook

**143 rules:** 87 MUST, 16 MUST NOT, 34 PREFER, 4 AVOID, 2 RESTRICT, across 19 areas. Each rule has an ID, level, rubric score (R/M/S/D/C) and sources.

The canonical index, with levels and rubric scores, is `guide/README.md`. The full text is in `guide/<area>/rules.md`, and the MUST/MUST NOT cheat sheet is `guide/dos-and-donts.md`.

How rules were promoted:
- MUST/MUST NOT needs at least 2 independent sources, or a bench measurement (phase-1 rule).
- Rules whose evidence was a single source or a book opinion were downgraded to PREFER/AVOID. Examples:
  - ERR-002 Result: PREFER, because the boilerplate's CRUD module doesn't need it.
  - LANG-007 `#private`.
  - PAT-*.
- Where enforcement exists only in recommended lint additions, the rule says so instead of claiming the boilerplate enforces it.

## 4.2 Decision records

Full text: `guide/decisions/0001..0011`.

| ADR | Decision | Deciding evidence |
|---|---|---|
| 0001 Framework | Fastify 5 + Zod type provider. Hono by ADR. Express and Nest AVOID | Bench: Fastify 100% of node:http on validated POST, Hono 94%, Express 70%. Built-in pino, schemas and inject. Nest needs decorators |
| 0002 Modules | ESM only, nodenext | Bench: ESM = CJS start-up. TS 7 default. `require(esm)` stable |
| 0003 Aliases | `package.json#imports` `#src/*` | Node/TS docs. TS 7 removed `baseUrl`. Deliberate break from the survey majority (`paths`) |
| 0004 Validation | Zod 4 | Deep-read majority. About 3.3 µs per request. Valibot by ADR for serverless |
| 0005 Errors | AppError + RFC 9457 + crash on bugs. Result PREFER for domain outcomes | Deep-read error models. A-039, A-147 |
| 0006 DI | Pure DI, `src/container.ts` | 18 of 32 repos use manual wiring. Containers need decorators |
| 0007 Data | Repository port per feature + in-memory adapter. Drizzle/Kysely for the first DB. Prisma AVOID (8.0 is an RC) | Survey trend. Live versions |
| 0008 Tests | Vitest 5, unit + integration projects | TS>=6 adopters |
| 0009 Toolchain | ESLint strictTypeChecked + Prettier + husky. TS 7 `tsc` + `@typescript/typescript6` alias | typescript-eslint peer `<6.1`. TS 7 has no API. 7.6x typecheck speed-up |
| 0010 Build/run | Dev: `node --watch src/main.ts`. Prod: tsdown bundle `dist/main.js` | Bench: the bundle starts 37-50% faster. Type stripping costs +15-63% |
| 0011 Image | Alpine as built. Distroless proposed (OQ-1) | Bench: distroless 55.6 MB vs alpine 61.9 MB vs slim 81.1 MB. Deep read: alpine majority |

## 4.3 Boilerplate spec (as built by the boilerplate agent; verified)

- **Language and modules:** Node >=24.12, ESM, `#src/*` and `#test/*` imports, the house tsconfig (`noEmit`, `erasableSyntaxOnly`, strict+).
- **App structure:**
  - `main.ts`: config -> container -> app -> listen; close-with-grace shutdown.
  - `app.ts`: the Fastify factory.
  - `container.ts`: the composition root.
  - `config/env.ts`: Zod env.
  - `http/error-handler.ts`: RFC 9457.
  - `http/health.ts`: `/health` and `/ready`.
  - `lib/`: errors, logger, assert-never, brand, decimal (bigint), retry (backoff + jitter + AbortSignal), time (Clock).
  - `modules/todos`: schema/repository/service/routes.
- **Tests:** Vitest unit + integration (inject plus a real socket), coverage thresholds.
- **Tooling:** ESLint 10 type-aware, Prettier, husky (pre-commit lint-staged, pre-push typecheck + unit tests).
- **Image:** 4-stage alpine Dockerfile, non-root, HEALTHCHECK.
- **CI:** GHA with quality / test matrix 24+26 / build + smoke + docker jobs.
- **Docs:** README.

## 4.4 Conflicts resolved, and still open

All 16 article conflicts (C1-C16) are resolved in `phase-3/deep-dive.md` section 3.2. Remaining open items, also listed in the findings:
- **OQ-1** Runtime base image: Alpine (as built) vs distroless (bench).
- **OQ-2** When TS 7.1 ships its API, drop the TS 6 alias and re-evaluate Biome/oxlint.
- **OQ-3** ORM overhead was not benchmarked.
- **OQ-4** Pinning GHA actions to SHAs, compile cache and extra lint rules: guide requirements the boilerplate doesn't meet yet.
- **OQ-5** Node 26 LTS on 2026-10-28: raise the floor and adopt Temporal.
