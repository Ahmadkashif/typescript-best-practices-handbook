# Phase 3: Boilerplate deep dive

Owner: "boilerplate" agent. Date: 2026-10-06. Inputs: `phase-2/boilerplates.csv` + `phase-2/boilerplates.md` (metadata survey of 270 repos, by the main agent).

## 1. Method

- Candidate pool: the 91 repos active in the last 12 months from `boilerplates.csv`, ranked by stars, plus the most-starred older reference repos (Sairyss, w3tecch, notiz-dev, gonzaloplaza) as a "what the old guard did" baseline.
- 37 repos shallow-cloned (`git clone --depth 1 --no-recurse-submodules`) into `phase-2/repos/<owner>_<repo>/`. Nothing in them was installed or executed. Facts were read with `grep`/`find` and by JSON-parsing `package.json` (read, never `require`d).
- 5 clones were dropped from the tally because they are not server boilerplates: `honojs/starter` (template index only), `CodelyTV/typescript-basic-skeleton` (no server), `sezRR/nodejs-typescript-template` (hello world), `fastify/fastify-cli` (CLI tool; only used for its `eject-ts` template), `bayukurniawan30/morphic-cms` (a CMS app). **Deep-read set: n = 32.**
- Per repo I read: `package.json` (type, imports, scripts, deps), every `tsconfig*.json`, Dockerfile(s), `.github/workflows/*`, hook/lint/format config files, the entrypoint (`main.ts`/`server.ts`/`index.ts`), the env/config module, the error handler and the health module when present.
- Tally script (reads only): `scratchpad/tally.mjs` logic, detection by dependency names and grep. Caveat: monorepos merge sub-package deps, so a few cells are approximate (noted below).

## 2. Tally (n = 32 deep-read server boilerplates)

| Dimension | Counts |
|---|---|
| framework | nestjs 11, express 9, fastify 6, hono 3, none/other 3 |
| module | cjs 18, esm 14 |
| alias | none 15, tsconfig-paths 15, pkg#imports 2 |
| validation | zod 15, class-validator 7, typebox 5, none 5 |
| env | zod-schema 11, @nestjs/config 7, dotenv-raw 6, fastify env-schema 4, raw process.env 4 |
| logger | console/none 10, pino 9, winston 9, pino(builtin) 4 |
| errors | framework default 16, Result+classes 8, error classes 8 |
| di | manual 18, nest 11, awilix 1, inversify 1, typedi 1 |
| orm | none 11, typeorm 7, prisma 7, drizzle 5, knex 2 |
| test | vitest 14, jest 13, none 4, tap 1 |
| lint | eslint 18, biome 7, oxlint 5, none 2 |
| format | prettier 19, none 7, biome 6 |
| build | tsc 16, swc 8, tsup 4, none 2, tsdown 1, esbuild 1 |
| hooks | husky 16, none 13, lefthook 3 |
| strict | yes 26, no 6 |
| nuia | no 26, yes 6 |
| vms | no 29, yes 3 |
| eso | no 30, yes 2 |
| iso | no 21, yes 11 |
| tsModule | esnext 10, commonjs 10, nodenext 9, (fastify-tsconfig) 2, node16 1 |
| ts | 6.0.3 6, 5.9.3 5, 5.7.3 3, 5.9.2 3, 7.0.2 3, 6.0.2 2, 5.3.3 1, 4.7.4 1, - 1, 4.9.5 1, 5.0.0 1, 5.1.6 1, 5.2.2 1, 4.6.3 1, 5.6.3 1, 3.6.3 1 |
| docker | none 12, 2-stage 9, 3-stage 6, 1-stage 3, 4-stage 2 |
| runtimeBase | none 12, node:alpine 9, base 3, oven/bun:alpine 2, ${NODE_IMAGE} 1, node:slim 1, node:${NODE_VERSION}-alpine 1, node: 1, node:bookworm-slim 1, gcr.io/distroless/nodejs: 1 |
| nonroot | no 20, yes 12 |
| ci | gha 25, none 7 |
| shutdown | yes 22, no 10 |
| health | no 17, yes 15 |


Legend: `nuia` = noUncheckedIndexedAccess, `vms` = verbatimModuleSyntax, `eso` = erasableSyntaxOnly, `iso` = isolatedModules. `runtimeBase: base` = an earlier `FROM node:*-alpine AS base` stage, so it counts as alpine (alpine total = 12 of 20 Dockerfiles).

### Per-repo matrix

| repo | framework | module | alias | validation | env | logger | errors | di | orm | test | lint | format | build | hooks | strict | nuia | vms | eso | iso | tsModule | ts | docker | runtimeBase | nonroot | ci | shutdown | health |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| AtaDevPro_nestjs-api-starter | nestjs | esm | none | class-validator | @nestjs/config | console/none | framework default | nest | typeorm | vitest | oxlint | prettier | tsc | none | yes | no | no | no | yes | nodenext | 6.0.2 | 3-stage | node:alpine | yes | gha | yes | yes |
| DriftOS_fastify-starter | fastify | esm | tsconfig-paths | typebox | fastify env-schema | pino | Result+classes | manual | prisma | vitest | eslint | prettier | tsup | husky | yes | yes | no | no | no | esnext | 5.3.3 | 2-stage | node:alpine | yes | gha | yes | yes |
| Joker666_hono-starter | hono | esm | none | zod | zod-schema | pino | framework default | manual | drizzle | none | biome | prettier | tsc | none | yes | no | no | no | no | nodenext | 5.7.3 | 3-stage | base | yes | none | yes | no |
| KhaledSaeed18_node-express-boilerplate | express | cjs | none | zod | zod-schema | pino | Result+classes | manual | prisma | vitest | eslint | prettier | tsc | husky | yes | no | no | no | no | commonjs | 6.0.3 | 3-stage | node:alpine | no | gha | yes | yes |
| MarkNjunge_nest-boilerplate | nestjs | cjs | tsconfig-paths | class-validator | raw process.env | winston | Result+classes | nest | typeorm | jest | eslint | none | swc | husky | no | no | no | no | no | esnext | 6.0.3 | 2-stage | ${NODE_IMAGE} | no | gha | yes | no |
| NarHakobyan_awesome-nest-boilerplate | nestjs | esm | none | zod | @nestjs/config | console/none | framework default | nest | typeorm | jest | eslint | prettier | swc | husky | yes | yes | yes | no | yes | esnext | 5.9.2 | 4-stage | node:slim | no | gha | yes | yes |
| Sairyss_domain-driven-hexagon | nestjs | cjs | tsconfig-paths | zod | zod-schema | console/none | Result+classes | nest | none | jest | eslint | prettier | tsc | none | yes | no | no | no | no | commonjs | 4.7.4 | none | none | no | none | yes | no |
| SyahrulBhudiF_Hono-Starter-Code | hono | cjs | none | zod | zod-schema | winston | framework default | manual | drizzle | vitest | biome | biome | tsc | none | yes | no | no | no | no | esnext | - | 2-stage | oven/bun:alpine | yes | none | yes | yes |
| ToniR7_express-typescript-starter | express | esm | pkg#imports | zod | zod-schema | winston | error classes | manual | none | vitest | oxlint | none | tsc | husky | yes | yes | no | yes | yes | nodenext | 7.0.2 | 3-stage | base | yes | gha | yes | yes |
| andrechristikan_ack-nestjs-boilerplate | nestjs | esm | tsconfig-paths | zod | zod-schema | pino | Result+classes | nest | prisma | vitest | eslint | prettier | swc | husky | yes | no | yes | no | yes | nodenext | 6.0.3 | 3-stage | base | yes | gha | yes | yes |
| brocoders_nestjs-boilerplate | nestjs | cjs | none | class-validator | zod-schema | console/none | framework default | nest | typeorm | jest | eslint | prettier | swc | husky | no | no | no | no | no | commonjs | 5.9.3 | 1-stage | node:alpine | no | gha | yes | no |
| dataquail_functional-domain-driven-hexagon | none/other | esm | tsconfig-paths | zod | dotenv-raw | console/none | Result+classes | manual | none | vitest | eslint | prettier | tsc | husky | yes | yes | no | no | yes | nodenext | 5.7.3 | none | none | no | gha | no | no |
| edwinhern_express-typescript | express | cjs | tsconfig-paths | zod | zod-schema | pino | framework default | manual | none | vitest | biome | biome | tsup | none | yes | no | no | no | no | esnext | 5.9.2 | 4-stage | node:alpine | yes | gha | yes | yes |
| fastify_demo | fastify | esm | none | typebox | fastify env-schema | pino(builtin) | framework default | manual | knex | none | eslint | none | tsc | none | no | no | no | no | no | (fastify-tsconfig) | 6.0.3 | none | none | no | gha | yes | yes |
| gonzaloplaza_express-ts-ddd | express | cjs | none | none | dotenv-raw | winston | error classes | awilix | prisma | jest | eslint | prettier | tsc | none | yes | no | no | no | no | commonjs | 4.9.5 | 2-stage | node:alpine | yes | gha | no | yes |
| jellydn_fastify-starter | fastify | cjs | none | typebox | fastify env-schema | pino(builtin) | framework default | manual | none | tap | biome | biome | tsup | husky | no | no | no | no | no | (fastify-tsconfig) | 5.9.3 | 2-stage | node:alpine | no | gha | yes | yes |
| jsynowiec_node-typescript-boilerplate | none/other | esm | none | none | raw process.env | console/none | framework default | manual | none | vitest | eslint | prettier | tsc | none | yes | yes | no | no | yes | nodenext | 6.0.2 | none | none | no | gha | no | no |
| mehdihadeli_nestjs-vertical-slice-template | nestjs | cjs | tsconfig-paths | class-validator | @nestjs/config | pino | Result+classes | nest | typeorm | vitest | eslint | prettier | none | husky | no | no | no | no | yes | nodenext | 5.9.2 | none | none | no | gha | yes | yes |
| mikemajesty_nestjs-microservice-boilerplate-api | nestjs | cjs | tsconfig-paths | zod | @nestjs/config | pino | error classes | nest | typeorm | jest | eslint | prettier | swc | husky | yes | no | no | no | no | commonjs | 5.0.0 | 2-stage | node:${NODE_VERSION}-alpine | yes | gha | yes | yes |
| milis92_nestjs-boilerplate | nestjs | cjs | tsconfig-paths | zod | @nestjs/config | pino | error classes | nest | drizzle | vitest | eslint | prettier | swc | lefthook | yes | no | no | no | yes | nodenext | 5.9.3 | none | none | no | gha | no | yes |
| nirnejak_hono-bun-starter | hono | esm | tsconfig-paths | zod | raw process.env | console/none | framework default | manual | drizzle | none | oxlint | none | tsc | husky | yes | no | no | yes | no | esnext | 7.0.2 | 1-stage | oven/bun:alpine | no | gha | no | no |
| notiz-dev_nestjs-prisma-starter | nestjs | cjs | none | class-validator | @nestjs/config | console/none | framework default | nest | prisma | jest | eslint | prettier | swc | none | no | no | no | no | no | commonjs | 5.1.6 | 2-stage | node: | no | gha | yes | no |
| practicajs_practica | fastify | cjs | tsconfig-paths | typebox | raw process.env | pino | error classes | manual | prisma | jest | eslint | prettier | tsc | none | yes | yes | no | no | yes | commonjs | 5.2.2 | none | none | no | gha | yes | no |
| santoshshinde2012_node-boilerplate | express | cjs | none | none | dotenv-raw | winston | error classes | manual | none | jest | eslint | prettier | tsc | husky | yes | no | no | no | no | node16 | 5.7.3 | 2-stage | node:bookworm-slim | yes | gha | yes | yes |
| tjuandev_node-joker | express | esm | pkg#imports | zod | zod-schema | console/none | framework default | manual | none | vitest | biome | biome | tsc | lefthook | yes | no | no | no | no | nodenext | 5.9.3 | none | none | no | none | no | no |
| typv_nest-turbo-starter | nestjs | cjs | tsconfig-paths | class-validator | @nestjs/config | winston | Result+classes | nest | none | jest | oxlint | prettier | tsup | husky | yes | no | no | no | yes | esnext | 6.0.3 | none | none | no | none | no | no |
| vitorsalgado_create-nodejs-ts | none/other | esm | none | none | dotenv-raw | console/none | framework default | manual | none | jest | eslint | prettier | tsc | husky | yes | no | no | no | no | esnext | 4.6.3 | 2-stage | gcr.io/distroless/nodejs: | yes | gha | yes | no |
| vyancharuk_nodejs-api-boilerplate | express | cjs | tsconfig-paths | zod | zod-schema | winston | error classes | inversify | knex | jest | none | none | tsc | none | yes | no | no | no | yes | commonjs | 5.6.3 | none | none | no | none | yes | no |
| w3tecch_express-typescript-boilerplate | express | cjs | none | class-validator | dotenv-raw | winston | error classes | typedi | typeorm | jest | none | none | none | none | yes | no | no | no | no | commonjs | 3.6.3 | 1-stage | node:alpine | no | none | no | no |
| yeasin2002_express-ts-starter | express | esm | tsconfig-paths | zod | zod-schema | winston | framework default | manual | drizzle | none | biome | biome | tsdown | lefthook | yes | no | yes | no | no | esnext | 5.9.3 | none | none | no | gha | no | no |
| yonathan06_fastify-typescript-starter | fastify | esm | none | typebox | fastify env-schema | pino(builtin) | framework default | manual | none | vitest | biome | biome | esbuild | none | yes | no | no | no | no | esnext | 7.0.2 | 3-stage | node:alpine | yes | gha | yes | no |
| zrosenbauer_fastify-prisma | fastify | cjs | tsconfig-paths | none | dotenv-raw | pino(builtin) | framework default | manual | prisma | vitest | oxlint | none | swc | husky | yes | no | no | no | no | commonjs | 6.0.3 | none | none | no | gha | no | no |

## 3. What the code actually does (qualitative, per dimension)

**Framework.** NestJS leads the raw count (11/32), Express is second (9), Fastify third (6), Hono 3. The trend in the metadata survey is the same (active: Nest 36%, Express 23%, Fastify 14%, Hono 9%). Every Nest repo needs `experimentalDecorators` + `emitDecoratorMetadata` (all 11 set them), which rules out `erasableSyntaxOnly`, Node type stripping and esbuild/oxc-style isolated transpilers without SWC metadata plugins (8 of the 11 ship `.swcrc` for exactly that reason). The Express repos all hand-roll what Fastify ships: request validation middleware, pino-http wiring, error middleware and shutdown. The Fastify repos (fastify/demo, yonathan06, jellydn, DriftOS, practica, zrosenbauer) get a structured logger, schema validation, `inject()` for HTTP tests without a socket, `onClose` hooks and `return503OnClosing` for free.

**Module system.** ESM 14/32 (44%) here vs 30% of all active repos in the metadata survey, and ESM is the majority among repos created or migrated in 2026 (ToniR7, tjuandev, AtaDevPro, ack-nestjs, NarHakobyan, yonathan06). The CJS repos are mostly older Nest templates on `module: commonjs`. ESM repos that run on Node use `module: nodenext` (9) and explicit extensions; bundler repos use `moduleResolution: bundler`.

**Aliases.** 15 use `tsconfig paths`, which needs a runtime helper (`tsconfig-paths/register`, `tsc-alias`, or a bundler) because Node ignores `paths`, and `baseUrl` is gone in TS 7. Only 2 repos use `package.json#imports` (ToniR7: `"#/*": "./src/*"`, tjuandev: `"#src/*": "./src/*"`), and both are 2026 ESM repos that run `.ts` directly on Node: the alias works in Node, TypeScript (`nodenext`), Vite/Vitest and every bundler with zero helpers. tjuandev still duplicates the map in `paths` (redundant under nodenext).

**tsconfig.** `strict` is near-universal (26/32). The stricter flags are rare: `noUncheckedIndexedAccess` 6, `verbatimModuleSyntax` 3, `erasableSyntaxOnly` 2 (both TS 7 repos running on type stripping), `exactOptionalPropertyTypes` 3 (practica, NarHakobyan, dataquail). The strictest configs belong to practica (all of `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `useUnknownInCatchVariables`) and NarHakobyan; those are the templates for our flag list. `skipLibCheck: true` is universal. TS 7.0.2 is already used by 3 repos (ToniR7, yonathan06, nirnejak); TS 6.0.x by 8.

**Validation.** Zod dominates (15/32, and 32% of active repos in the survey); class-validator is tied to Nest (7); TypeBox is the Fastify-native choice (5). Zod 4 repos use `z.coerce` for env and `safeParse` at the edge. No repo uses Valibot or ArkType in depth.

**Env config.** The converged pattern (11 repos: Khaled, edwinhern, ToniR7, Joker666, ack-nestjs, ...) is a single module that parses `process.env` with a Zod object schema at import time and exits non-zero with `z.flattenError(...).fieldErrors` on failure. Fastify repos use `@fastify/env`/`env-schema` (JSON Schema, same idea). 10 repos still read raw `process.env` or `dotenv` without validation (anti-pattern). The 2026 repos drop `dotenv` for `node --env-file=.env` (fastify/demo, ToniR7).

**Logger.** pino 13 (incl. 4 Fastify built-in), winston 9, console/none 10. Every repo created/updated in 2026 that has a logger uses pino except ToniR7. fastify/demo's pattern is the best seen: pretty transport only when `process.stdout.isTTY`, JSON otherwise, and a comment explicitly saying not to key logging off `NODE_ENV`.

**Error model.** 16 rely on framework defaults (Nest exception filters or none). The 16 that define one use either an `AppError` base class with a stable `code`/`statusCode`/`isOperational|isCatastrophic` (practica, Khaled, santoshshinde, Sairyss `ExceptionBase` with `code` + `toJSON`) mapped to HTTP in one central handler, or a `Result<T,E>` for domain operations (Sairyss, dataquail with Effect, ack-nestjs, KhaledSaeed18). practica's `covertUnknownToAppError` + "crash on catastrophic errors" is the reference implementation of the Node best-practices advice.

**DI.** Manual wiring 18, Nest container 11, a DI library only 3 (awilix, inversify, typedi; all in old repos). Outside Nest, nobody adopts a container in 2026; the modern repos build dependencies in one place (a composition root) and pass them down.

**ORM / query builder.** none 11, Prisma 7, TypeORM 7 (all Nest), Drizzle 5 (rising, all 2025-26 repos), Knex 2, Kysely 0. Survey-wide among active repos: Prisma 30%, TypeORM 23%, Drizzle 13%.

**Test runner.** Vitest 14 vs Jest 13 (Jest only in older/Nest repos; every repo on TS >= 6 outside Nest uses Vitest). Integration tests are mostly `supertest` against Express or `app.inject()` on Fastify. Separate unit/integration configs appear in Khaled (`vitest.unit.config.ts`, `vitest.integration.config.ts`) and AtaDevPro (`vitest.config.e2e.ts`).

**Lint / format.** ESLint 18 (flat config `eslint.config.mjs` in every repo touched since 2025; `typescript-eslint` meta-package), Biome 7, oxlint 5 (all 2026). Prettier 19 vs Biome 6. Type-aware linting (`recommendedTypeChecked`/`strictTypeChecked`) appears in ack-nestjs, NarHakobyan, Khaled; oxlint `--type-aware` in dataquail.

**Build.** tsc 16, swc 8 (Nest), tsup 4, tsdown 1, esbuild 1. tsup's README now points users to tsdown; the newest repos (yeasin2002) use tsdown. Two TS-7 repos have no build at all and run `node src/app.ts` (type stripping) in production (ToniR7).

**Git hooks.** husky 16 (+ lint-staged in most), lefthook 3, none 13. commitlint is common in the Nest group (7).

**Dockerfile.** 20/32 ship one. Multi-stage is the norm (17 of 20). Runtime base: `node:<ver>-alpine` 12, `-slim`/`bookworm-slim` 2, distroless 1, bun 2. Only 12/20 drop root (`USER node` or a created user). Patterns worth copying: separate prod-deps stage with `--omit=dev --ignore-scripts` (edwinhern, ToniR7, NarHakobyan), BuildKit cache mounts for the package store (edwinhern), `HEALTHCHECK` (6 repos), `tini`/`dumb-init` (3). Bugs seen: edwinhern installs deps on `node:23-slim` (glibc) and copies `node_modules` into `node:23-alpine` (musl), which breaks native addons; KhaledSaeed18 runs migrations in `CMD` (couples deploy and boot) and runs as root; several still use EOL Node 16/18 images.

**CI.** GitHub Actions in 25/32. Typical job: checkout, setup-node (from `.nvmrc`/`.node-version` in 9 repos), `npm ci`, lint, typecheck, test, build; the better ones split jobs (jsynowiec: lint/tests in parallel, build `needs` both) and build the Docker image in CI (AtaDevPro runs `docker compose build` + e2e).

**Graceful shutdown.** 22/32 handle `SIGTERM`. Quality varies: edwinhern/ToniR7/Khaled call `server.close()` and then `process.exit()` in the same tick (Khaled exits before close completes), only edwinhern has a hard-kill timeout. Fastify repos use `close-with-grace` (fastify/demo, jellydn) which wraps signals + `uncaughtException`/`unhandledRejection` + a delay; Nest repos use `enableShutdownHooks()`.

**Health checks.** 15/32. Nest repos use `@nestjs/terminus` with DB indicators; others expose a single `/health` returning 200. Only ack-nestjs/AtaDevPro separate liveness from readiness via indicators; fastify/demo uses `@fastify/under-pressure` (event-loop delay/heap) to return 503 under load.

## 4. Live version check (2026-10-06, `npm view` + nodejs.org/dist/index.json)

typescript 7.0.2 (`next` 7.1.0-dev.20261006.1) · @typescript/typescript6 6.0.2 · typescript-eslint 8.71.1 (peer `typescript >=4.8.4 <6.1.0`, so it needs the TS 6 API package) · eslint 10.12.0 · @eslint/js 10.0.1 · prettier 3.9.9 · fastify 5.12.5 · fastify-type-provider-zod 7.0.0 (peer zod >=4.1.5, fastify ^5.5) · zod 4.6.5 · pino 10.4.0 · pino-pretty 13.2.0 · close-with-grace 2.5.0 · vitest 5.0.3 · tsdown 0.23.0 · tsx 4.23.15 · @types/node 26.6.4 · husky 9.1.7 · lint-staged 17.6.0 · lefthook 2.1.17 · @biomejs/biome 2.5.15 · oxlint 1.87.0 · hono 4.13.13 · express 5.2.1 · @nestjs/core 12.1.2 · drizzle-orm 0.45.3 · kysely 0.29.6 · testcontainers 12.2.0 · Node: 24.21.0 "Krypton" is Active LTS; 26.10.0 is Current (LTS on 2026-10-28). Local: node 24.15.0, npm 11.12.1, Docker 29.8.1.

## 5. Proposed stack

One decision per line: **decision** — justification — sources (tally = section 2 of this file, survey = `phase-2/boilerplates.md`).

1. **Runtime: Node 24 LTS (`engines.node >=24.12`), CI also on 26** — 24 is Active LTS; 24.12 is where type stripping went stable; 26 becomes LTS 2026-10-28 — nodejs/Release schedule, nodejs.org/api/typescript.html, `phase-1/scope.md`.
2. **Framework: Fastify 5** — ships pino logging, schema validation/serialization, `inject()` testing, `onClose` hooks and 503-on-close, which every Express repo re-implements by hand; no decorators (Nest needs `experimentalDecorators`/`emitDecoratorMetadata`, which conflicts with `erasableSyntaxOnly` and type stripping); third by count (6/32, 14% active) but the only top-3 option compatible with decisions 4-5 without glue — tally; survey; fastify/demo, fastify.dev docs. (Re-check against `phase-3/bench/results.md`.)
3. **Module system: ESM only (`"type": "module"`), `module`/`moduleResolution: nodenext`** — ESM share grows from 30% (active) to 42% (TS >= 6) and is the norm in 2026 repos; TS 7 defaults to ESM; nodenext is what Node actually does — tally; survey; TS 7.0 release notes.
4. **Import alias: `package.json#imports` with `"#src/*": "./src/*"`, specifiers carry `.ts`** — resolved natively by Node, TS nodenext, Vite/Vitest and bundlers; `paths` needs runtime helpers and `baseUrl` is removed in TS 7; used by the two newest ESM repos (ToniR7, tjuandev) — Node docs "Subpath imports", TS 7.0 notes, tally (alias row).
5. **tsconfig: `strict` + `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`, `noUnusedLocals/Parameters`, `verbatimModuleSyntax`, `isolatedModules`, `erasableSyntaxOnly`, `allowImportingTsExtensions` + `noEmit`, `noUncheckedSideEffectImports`, `skipLibCheck`** — union of the strictest real configs (practica, NarHakobyan, jsynowiec, ToniR7); `erasableSyntaxOnly` keeps every file runnable by Node type stripping and any isolated transpiler — tally (tsconfig rows), TS handbook tsconfig reference.
6. **TypeScript: `typescript@7` (tsgo) for typechecking, `@typescript/typescript6` aliased as `typescript` for typescript-eslint** — TS 7 is `latest` and much faster; typescript-eslint 8.71 peers `<6.1.0` and TS 7.0 has no JS API — `npm view`, TS 7.0 announcement, `phase-1/scope.md`.
7. **Dev loop: `node --watch --env-file-if-exists=.env src/main.ts` (no tsx/ts-node)** — stable type stripping makes the TS runner dependency unnecessary; ts-node is the most common dev runner (45% active) but unmaintained-for-ESM; fastify/demo and ToniR7 already use `--env-file`/plain node — Node docs, tally.
8. **Build: tsdown bundle of `src/main.ts` to one ESM file, dependencies external** — tsup (the incumbent bundler) now redirects to tsdown; bundling removes alias/extension rewriting from the runtime path and gives a single-file `dist`; tsc-emit is the most common build (16/32) but would need `rewriteRelativeImportExtensions` and cannot rewrite `#src` — tally (build row), tsup README.
9. **Validation: Zod 4 via `fastify-type-provider-zod`** — Zod is the top validator overall and among active/TS 6 repos (15/32; 32-33%); one schema gives runtime validation + static types + response serialization — tally, survey, zod.dev.
10. **Env config: one `config/env.ts` that parses `process.env` with a Zod schema at startup, fails fast with flattened field errors, returns a frozen typed object; no `dotenv`, use `--env-file-if-exists` in dev** — converged pattern in 11/32 (Khaled, edwinhern, ToniR7, Joker666) — tally, Node `--env-file` docs.
11. **Logger: pino (Fastify's built-in instance), JSON in production, pino-pretty only when stdout is a TTY, `redact` for auth/cookie headers** — pino is the 2026 majority (13/32) and Fastify's native logger; TTY switch from fastify/demo — tally, fastify/demo `server.ts`, getpino.io.
12. **Error model: thrown `AppError` subclasses with a stable string `code` + HTTP status, converted once in a central Fastify `setErrorHandler` to RFC 9457 `application/problem+json`; unknown errors become 500 with no internals leaked; programmer errors crash via close-with-grace** — the defined error models in the tally all use a coded base class + one central handler (practica, Sairyss, Khaled); no Result library (only 8/32, and mostly Nest/Effect-specific) — practica, Sairyss, goldbergyoni/nodebestpractices §2, RFC 9457.
13. **DI: manual composition root (`src/container.ts`), dependencies passed as function arguments; no container library** — manual wiring 18/32, DI libraries 3/32 and none in 2026 repos — tally (di row).
14. **Data access: repository interface per feature + in-memory adapter in the boilerplate; when a DB is added, use Drizzle ORM (or Kysely for SQL-first teams)** — Prisma leads by count but needs a codegen step and generated client; Drizzle is TS-only, has no codegen step and is the fastest-growing choice in 2025-26 repos (5/32, all recent); keeping the DB out keeps the boilerplate bootable with zero infra — tally (orm row), survey.
15. **Tests: Vitest 5; unit tests colocated as `*.test.ts`, integration tests in `test/integration/` using `app.inject()` plus one real-socket boot test** — Vitest is the runner of every non-Nest TS >= 6 repo (14/32; 38% of TS >= 6); `inject()` is Fastify's documented test path — tally, fastify.dev Testing guide.
16. **Lint: ESLint 10 flat config + typescript-eslint `strictTypeChecked` + `stylisticTypeChecked` (type-aware); format: Prettier 3 with `eslint-config-prettier`** — ESLint 18/32 and Prettier 19/32 are the consensus; Biome/oxlint are rising (7 and 5) but lack the full type-aware rule set — tally (lint/format rows), typescript-eslint docs.
17. **Git hooks: husky 9 + lint-staged (pre-commit: prettier + eslint on staged files)** — husky 16/32 vs lefthook 3/32 — tally (hooks row).
18. **Dockerfile: 4 stages on `node:24-alpine` (deps → build → prod-deps with `npm ci --omit=dev --ignore-scripts` → runtime), BuildKit npm cache mount, runtime copies only `dist/` + prod `node_modules`, `USER node`, `NODE_ENV=production`, exec-form `CMD ["node","dist/main.js"]`, `HEALTHCHECK` via `node -e fetch(...)`, same libc in every stage** — multi-stage 17/20, alpine 12/20; fixes the root-user and glibc→musl bugs seen in the tally — tally (docker rows), Docker docs, nodejs/docker-node best practices.
19. **CI: GitHub Actions; `setup-node` from `.nvmrc` with npm cache; jobs: quality (format check, lint, typecheck), test (matrix Node 24/26), build + `docker build`** — GHA 25/32; job split from jsynowiec/AtaDevPro — tally (ci row).
20. **Graceful shutdown: `close-with-grace` around `app.close()` with a configurable delay; readiness flips to 503 while closing; listen on `0.0.0.0` in containers** — the only pattern seen that awaits close, handles fatal errors and has a timeout; Fastify-team library (fastify/demo, jellydn) — tally, close-with-grace README.
21. **Health: `GET /health` (liveness, always 200 while the process serves) and `GET /ready` (readiness: runs registered dependency checks, 503 when any fails or during shutdown)** — 15/32 have health checks but only the Nest/terminus ones split liveness and readiness, which Kubernetes probes need — tally, Kubernetes probe docs.
22. **Utils lib in `src/lib/`: `assertNever`, branded IDs (`Brand<T, Name>` + Zod brand), integer-minor-unit decimal math on `bigint`, `retry` with exponential backoff + full jitter + `AbortSignal`, an injectable `Clock` + duration helpers** — required by plan 5B; no dependency needed for any of them.
23. **Package manager: npm with committed `package-lock.json` and `npm ci`** — npm is the most common (37% active, 42% TS >= 6) and ships with Node, so the Dockerfile and CI need no corepack step — survey (pm row).

STATUS: STACK-PROPOSED

## 6. Cross-check against `phase-3/bench/results.md`

Checked 2026-10-06 after the bench agent published sections 1-3 (HTTP, compile/build/start, validation). No measurement contradicts a proposed decision, so no decision changed. Details:

- **Framework (decision 2): kept Fastify, but the reason is features, not speed.** Validated POST: Fastify 100% of node:http, Hono 94%, fastify+zod 92%, Nest-on-Fastify 88%, Express 5 70%. Fastify and Hono are within noise of each other, so performance does not decide between them. Fastify still wins on what the boilerplate needs built in (pino, schema validation, `inject()`, `onClose`, 503-on-close). Express's 1.4x deficit backs the decision not to use it. The bench also shows Nest 12 compiles fine on TS 7 with `experimentalDecorators`/`emitDecoratorMetadata`. My objection to Nest is about `erasableSyntaxOnly`/type stripping and decorator metadata, not TS 7 support, so that wording stands.
- **Validation (decision 9): kept Zod.** Zod via the type provider costs about 8% of throughput against Fastify's ajv path, and at most about 3.3 µs per request. The bench's own conclusion is "choose for DX and inference (zod/valibot); use JIT validators only on measured hot paths". Recorded as a known trade-off: for a hot endpoint, export the schema with `z.toJSONSchema` and let Fastify's ajv validate it.
- **TypeScript 7 for typecheck (decision 6): confirmed.** About 7.6x faster than TS 6 (408 vs 3094 ms at 36k LOC). The boilerplate typechecks in 0.3 s.
- **Bundle for production, type stripping only for dev (decisions 7-8): confirmed.** A single-file bundle starts 1.8x faster than 402 unbundled files (193 vs 346 ms). Native type stripping adds about 60% to start-up (562 ms). So `npm run dev` uses `node src/main.ts`, and production runs the tsdown bundle. tsdown (235 ms) is slower than raw esbuild (39 ms), but that is tool start-up and irrelevant for a CI build. tsdown stays for its config file and node defaults.

## 7. Adjustments made while building `boilerplate/`

- `pino` dropped as a direct dependency: Fastify bundles it and the code only needs Fastify's logger types.
- Pretty logging is an explicit `LOG_FORMAT=pretty` setting, not fastify/demo's TTY detection. `pino-pretty` is a dev dependency, so a `docker run -t` (TTY) in production would otherwise crash on a missing transport.
- Branded IDs: `Brand<T, Name>` is defined as `T & z.$brand<Name>`, the same type Zod's `.brand()` produces, so there is one brand system instead of two. One contained cast inside the generic `uuidId()` factory works around Zod's deferred conditional type.
- tsdown emits `.mjs` by default. `fixedExtension: false` keeps `dist/main.js` (the package is `"type": "module"`).
- typescript-eslint `return-await: always` was removed. It fights Fastify's thenable `reply`; the `strictTypeChecked` default (`in-try-catch`) is kept.
- Added a `BAD_REQUEST` error code for Fastify's own 4xx errors (malformed JSON, 413, 415), so they are not mislabelled as `VALIDATION_FAILED`.
- Prettier: `singleQuote: true` + `printWidth: 100`, nothing else. singleQuote is 17 of 20 among the cloned repos that set it.
- `fastify-type-provider-zod@7` declares `@fastify/swagger` and `openapi-types` as required peers. npm 11 installs them automatically, so they also land in the production `node_modules` (included in the 26.6 MB layer). Accepted. They also make OpenAPI generation a one-line addition.
- A `#test/*` import alias was added next to `#src/*`, so ESLint's "no `../` imports" rule holds in tests too.
- husky's `prepare` runs safely when the boilerplate sits inside a parent repo: husky 9 returns early with ".git can't be found" and does not touch the parent's `core.hooksPath` (verified with `git config --get core.hooksPath` on the research-facility repo: unset).

## 8. Boilerplate delivered (`boilerplate/`)

```
boilerplate/
  package.json            ESM, engines >=24.12, imports {#src/*, #test/*}, scripts, lint-staged
  package-lock.json
  tsconfig.json           strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes + erasableSyntaxOnly + verbatimModuleSyntax + ... (noEmit)
  tsdown.config.ts        bundle src/main.ts -> dist/main.js, deps external, sourcemaps
  vitest.config.ts        projects: unit (src/**/*.test.ts) + integration (test/integration), v8 coverage thresholds
  eslint.config.js        flat config: js recommended + typescript-eslint strictTypeChecked + stylisticTypeChecked, bans enum/namespace/../ imports, prettier last
  .prettierrc.json  .prettierignore  .editorconfig  .nvmrc (24)  .gitignore  .dockerignore  .env.example
  .husky/pre-commit       npx lint-staged
  .husky/pre-push         typecheck + unit tests
  Dockerfile              4 stages on node:24.21.0-alpine3.23, npm cache mounts, --ignore-scripts, USER node, HEALTHCHECK, exec-form CMD
  .github/workflows/ci.yml  quality (format/lint/typecheck) | test matrix Node 24+26 with coverage | build + boot smoke test + docker build (buildx, gha cache)
  README.md               commands, layout, conventions, ops (health/shutdown/logs), env table, TS7/ESLint dual install, Docker, CI
  src/
    main.ts               config -> container -> app -> listen; close-with-grace (readiness off, app.close, force exit after SHUTDOWN_GRACE_MS)
    app.ts                buildApp(container): Fastify + Zod type provider, timeouts, body limit, error handling, routes
    container.ts          composition root (clock, lifecycle, readiness checks, services, dispose)
    config/env.ts (+ .test.ts)          Zod env schema, loadConfig(env) pure + frozen, ConfigError
    http/error-handler.ts               RFC 9457 problem+json; Zod validation, AppError, Fastify 4xx, unknown -> 500; 404 handler
    http/health.ts                      /health (liveness), /ready (checks with AbortSignal timeout, 503 on shutdown)
    lib/errors.ts (+ test)              AppError + ValidationError/NotFound/Conflict/Unauthenticated/Forbidden/ServiceUnavailable, toError
    lib/logger.ts                       pino options, redaction, optional pretty
    lib/assert-never.ts (+ test)
    lib/brand.ts (+ test)               Brand<T, Name>, uuidId(name) -> { schema, parse, create }
    lib/decimal.ts (+ test)             bigint minor units: parse/format/add/sub/mul (half-even)/allocate, safeIntAdd
    lib/retry.ts (+ test)               retry() with exponential backoff, full jitter, shouldRetry, AbortSignal, onRetry
    lib/time.ts (+ test)                SECOND..DAY, Clock, systemClock, fixedClock, addMs, toIsoUtc, isExpired
    modules/todos/                      todo.schema.ts, todo.repository.ts (port + in-memory), todo.service.ts (+ test), todo.routes.ts
  test/
    helpers.ts                          createTestApp(): real wiring, silent logger, fixed clock
    integration/health.test.ts          liveness, readiness ok/fail/timeout, 503 during shutdown
    integration/todos.test.ts           CRUD, 400 validation, malformed JSON, params/query validation, 404 domain + route, 500 without leaks
    integration/server.test.ts          real socket listen on port 0, fetch /health, clean close
```

## 9. Verification (`phase-5/verify.log`, script `phase-5/verify.sh`)

Run on 2026-10-06, Node 24.15.0, npm 11.12.1, Docker 29.8.1. **OVERALL: PASS.**

| Step | Result |
|---|---|
| clean (`rm -rf node_modules dist coverage`) + `npm ci` | pass (tsc 7.0.2, tsc6 6.0.3, eslint 10.12.0, fastify 5.12.5 resolved) |
| `npm run format:check` | pass (failed on the first run because README.md was not Prettier-formatted; fixed, re-run passed) |
| `npm run typecheck` (tsc 7) | pass, 0.3 s |
| `npm run lint` (type-aware, `--max-warnings=0`) | pass |
| `npm run test:coverage` | 11 files, 38 tests pass; 94.9% statements, 88.1% branches, 96.0% lines |
| `npm run build` (tsdown) | pass, `dist/main.js` 13.4 kB + map |
| start built server, `curl /health` | HTTP 200 `{"status":"ok"}`; `/ready` 200; POST /v1/todos 201; bad id 400 problem+json |
| SIGTERM | logs "shutdown signal received" then "shutdown complete", exit 0 |
| `docker build` | pass (first cold build 46 s; cached 1.8 s). Image 271 MB as reported by `docker image ls`; app layers 26.7 MB (node_modules 26.6 MB, dist 61 kB) |
| `docker run` + `curl /health` | HTTP 200, runs as user `node`; `docker stop` takes 0.13 s, exit code 0, and node as PID 1 logs both shutdown lines |
| extra: hadolint | only DL3066 (info: non-numeric `USER node`) |
| extra: actionlint on ci.yml | pass (after renaming an unused loop variable flagged by shellcheck) |
| extra: dev mode `node src/main.ts` (type stripping, no build) | /health 200, exit 0 on SIGTERM |
| extra: invalid env (`PORT=notaport`) | one JSON fatal line naming PORT, exit 1 |

Not verified locally: the GitHub Actions workflow itself (it was linted with actionlint, not executed on GitHub), and Node 26 (only 24.15.0 is installed here; CI's matrix covers 26).

STATUS: DONE
