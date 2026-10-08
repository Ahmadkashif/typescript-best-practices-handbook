# Phase 2: Discovery index

Completed 2026-10-06.

| Corpus | File | Count | Quota | Notes |
|---|---|---|---|---|
| 2A TS + Node feature catalog | `ts-feature-catalog.md` | 220 rows (117 type-system/syntax, 61 compiler/CLI, 42 Node/ES runtime) | every feature | Covers TS 1.x-7.0 and Node 22-26. Ends with a 6.0/7.0 migration checklist. Release notes for 1.x-5.6 come from the handbook pages, 5.7-7.0 were fetched live |
| 2B Articles | `articles.md` | **150** (A-001..A-150) | >=100 (target 150) | Both parts list claim clusters per guide section |
| 2C Books | `books.md` | **18** (B-01..B-18) | >=10 | Publisher pages, TOCs, reviews and talks only |
| 2D Boilerplates (metadata) | `boilerplates.csv`, `boilerplates.md` | **270** valid TS backend repos (from 340 scanned out of 839 candidates) | >=100 (target 200) | `scripts/survey.mjs` reads only API metadata. Raw JSON is in `scripts/` |
| 2D Boilerplates (deep read) | `repos/` (gitignored shallow clones, 30 repos) | 30 cloned | >=25 | The deep read is owned by the parallel "boilerplate" agent and lives in `phase-3/boilerplate-deep-dive.md` |

## Version evidence (V-ids, cited by the guide)

| ID | Fact | Source |
|---|---|---|
| V-01 | `typescript@latest` = 7.0.2 (2026-07-08), Go native; `next` = 7.1.0-dev | `npm view typescript dist-tags time` |
| V-02 | TS 7.0 has no JS API. `@typescript/typescript6` 6.0.2 provides `tsc6` + the API. Dual-install recipe | devblogs.microsoft.com/typescript/announcing-typescript-7-0/ |
| V-03 | typescript-eslint 8.71.1 peer `typescript >=4.8.4 <6.1.0` | `npm view typescript-eslint peerDependencies` |
| V-04 | Node type stripping Stable since 24.12.0 / 25.2.0. `--experimental-transform-types` removed in 26.0.0 | nodejs.org/api/typescript.html |
| V-05 | Node 24 Krypton = Active LTS (24.21.0). 26 = Current, becomes LTS 2026-10-28. 22 = Maintenance until 2027-04-30 | github.com/nodejs/Release, nodejs.org/dist/index.json |
| V-06 | Library versions on 2026-10-06: fastify 5.12.5, hono 4.13.13, express 5.2.1, nest 12.1.2, zod 4.6.5, valibot 1.5.0, pino 10.4.0, vitest 5.0.3, eslint 10.12.0, biome 2.5.15, drizzle 0.45.3, kysely 0.29.6, prisma 8.0.0-rc.20 (`latest` is an RC), tsx 4.23.15, tsdown 0.23.0, lefthook 2.1.17 | `npm view` |

## Headline survey signals (from boilerplates.md)

- Frameworks across all 270: NestJS and Express lead. Among repos active in the last 12 months, NestJS leads, with Express, Fastify and Hono following.
- CJS still dominates the old corpus. ESM's share rises sharply in active repos and in TS>=6 adopters.
- Path aliases: `tsconfig paths` is the majority method. `package.json#imports` appears in only 1 repo. That is a consensus-vs-evidence gap, resolved in phase-3/deep-dive.md (Node and TS docs, TS 7 removed `baseUrl`).
- Testing: Jest still leads overall. Vitest leads among TS>=6 adopters.
- Linting: ESLint leads. Biome and oxlint are rising in active repos.
- `noUncheckedIndexedAccess` appears in under 5% of repos, and OpenTelemetry in under 3%. The boilerplates are weaker on these than the article consensus.
