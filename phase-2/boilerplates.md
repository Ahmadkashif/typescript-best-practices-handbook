# Phase 2D: Boilerplate survey

Method: `gh search repos` (27 keyword queries + 7 topic queries, sorted by stars) plus 9 direct lookups gave about 1,100 unique repos. A backend-keyword and noise filter (frontend/mobile/PHP/etc.) left 839 candidates; the top 340 by stars were scanned with `phase-2/scripts/survey.mjs`. It reads only GitHub API metadata (package.json, tsconfig.json, recursive file tree): no cloning, no code execution. Repos without a package.json or TypeScript were dropped.

**Surveyed (valid TS backend repos): 270** · active in last 12 months (pushed >= 2025-10-01, not archived): 91 · on TS >= 6: 24

Raw rows: `boilerplates.csv`. Detection is heuristic (dependency names), so "none" can also mean "custom".

## Tallies

| Dimension | All (n=270) | Active last 12 months (n=91) | TS>=6 adopters (n=24) |
|---|---|---|---|
| framework | express 90 (33%), nestjs 73 (27%), fastify 36 (13%), other 34 (13%), hono 29 (11%), koa 4 (1%), elysia 4 (1%) | nestjs 33 (36%), express 21 (23%), other 14 (15%), fastify 13 (14%), hono 8 (9%), elysia 2 (2%) | nestjs 9 (38%), fastify 4 (17%), other 4 (17%), express 4 (17%), hono 3 (13%) |
| moduleSystem | cjs 229 (85%), esm 41 (15%) | cjs 64 (70%), esm 27 (30%) | cjs 14 (58%), esm 10 (42%) |
| alias | none 181 (67%), tsconfig-paths 87 (32%), pkg-imports 2 (1%) | none 52 (57%), tsconfig-paths 37 (41%), pkg-imports 2 (2%) | none 14 (58%), tsconfig-paths 9 (38%), pkg-imports 1 (4%) |
| validation | none 113 (42%), class-validator 73 (27%), zod 53 (20%), joi 16 (6%), typebox 7 (3%), express-validator 3 (1%), yup 3 (1%), valibot 1 (0%), ajv 1 (0%) | zod 29 (32%), class-validator 28 (31%), none 26 (29%), typebox 4 (4%), joi 1 (1%), express-validator 1 (1%), yup 1 (1%), valibot 1 (1%) | zod 8 (33%), none 7 (29%), class-validator 6 (25%), typebox 2 (8%), valibot 1 (4%) |
| orm | none 72 (27%), prisma 54 (20%), typeorm 46 (17%), drizzle 41 (15%), mongoose 40 (15%), knex 6 (2%), sequelize 4 (1%), raw-driver 3 (1%), mikro-orm 3 (1%), kysely 1 (0%) | prisma 27 (30%), none 23 (25%), typeorm 21 (23%), drizzle 12 (13%), mongoose 5 (5%), knex 2 (2%), sequelize 1 (1%) | none 8 (33%), prisma 7 (29%), typeorm 5 (21%), drizzle 3 (13%), knex 1 (4%) |
| logger | none/console 141 (52%), winston 52 (19%), pino(builtin) 28 (10%), pino 26 (10%), morgan-only 22 (8%), bunyan 1 (0%) | none/console 43 (47%), winston 18 (20%), pino 14 (15%), pino(builtin) 10 (11%), morgan-only 6 (7%) | none/console 12 (50%), pino(builtin) 4 (17%), pino 4 (17%), winston 3 (13%), morgan-only 1 (4%) |
| test | jest 124 (46%), none 97 (36%), vitest 31 (11%), mocha 12 (4%), tap 5 (2%), ava 1 (0%) | jest 42 (46%), none 27 (30%), vitest 20 (22%), tap 2 (2%) | vitest 9 (38%), none 8 (33%), jest 7 (29%) |
| linter | eslint 152 (56%), none 69 (26%), tslint 21 (8%), biome 19 (7%), oxlint 9 (3%) | eslint 56 (62%), biome 14 (15%), none 12 (13%), oxlint 9 (10%) | eslint 13 (54%), oxlint 6 (25%), biome 4 (17%), none 1 (4%) |
| formatter | prettier 141 (52%), none 110 (41%), biome 19 (7%) | prettier 55 (60%), none 22 (24%), biome 14 (15%) | prettier 11 (46%), none 9 (38%), biome 4 (17%) |
| build | tsc 117 (43%), none 59 (22%), nest-cli(tsc) 50 (19%), swc 27 (10%), webpack 7 (3%), tsup 5 (2%), esbuild 3 (1%), tsdown 1 (0%), rollup 1 (0%) | tsc 37 (41%), swc 17 (19%), nest-cli(tsc) 16 (18%), none 15 (16%), tsup 3 (3%), esbuild 2 (2%), tsdown 1 (1%) | tsc 10 (42%), swc 5 (21%), none 4 (17%), nest-cli(tsc) 4 (17%), esbuild 1 (4%) |
| devRunner | ts-node 137 (51%), other 51 (19%), tsx 39 (14%), ts-node-dev 25 (9%), nodemon 14 (5%), nest start 4 (1%) | ts-node 41 (45%), tsx 26 (29%), other 15 (16%), ts-node-dev 5 (5%), nodemon 3 (3%), nest start 1 (1%) | tsx 9 (38%), ts-node 8 (33%), other 6 (25%), nest start 1 (4%) |
| docker | no 152 (56%), yes 118 (44%) | yes 56 (62%), no 35 (38%) | yes 15 (63%), no 9 (38%) |
| compose | no 156 (58%), yes 114 (42%) | yes 54 (59%), no 37 (41%) | yes 15 (63%), no 9 (38%) |
| ci | none 165 (61%), gha 97 (36%), circle 8 (3%) | gha 57 (63%), none 33 (36%), circle 1 (1%) | gha 20 (83%), none 4 (17%) |
| hooks | none 181 (67%), husky 83 (31%), lefthook 6 (2%) | none 44 (48%), husky 42 (46%), lefthook 5 (5%) | none 12 (50%), husky 12 (50%) |
| pm | npm 114 (42%), yarn 58 (21%), pnpm 47 (17%), none 29 (11%), bun 22 (8%) | npm 34 (37%), pnpm 30 (33%), yarn 10 (11%), bun 9 (10%), none 8 (9%) | npm 10 (42%), pnpm 7 (29%), none 4 (17%), bun 3 (13%) |
| strict | yes 144 (53%), no 126 (47%) | yes 51 (56%), no 40 (44%) | no 12 (50%), yes 12 (50%) |
| nuia | no 259 (96%), yes 11 (4%) | no 84 (92%), yes 7 (8%) | no 22 (92%), yes 2 (8%) |
| di | manual/none 180 (67%), nest 73 (27%), inversify 6 (2%), tsyringe 6 (2%), typedi 3 (1%), awilix 2 (1%) | manual/none 54 (59%), nest 33 (36%), tsyringe 2 (2%), awilix 1 (1%), inversify 1 (1%) | manual/none 15 (63%), nest 9 (38%) |
| otel | no 265 (98%), yes 5 (2%) | no 87 (96%), yes 4 (4%) | no 22 (92%), yes 2 (8%) |
| config | dotenv 119 (44%), none 95 (35%), @nestjs/config 49 (18%), envalid 4 (1%), env-var 2 (1%), @t3-oss/env-core 1 (0%) | dotenv 36 (40%), none 28 (31%), @nestjs/config 25 (27%), @t3-oss/env-core 1 (1%), envalid 1 (1%) | none 11 (46%), @nestjs/config 6 (25%), dotenv 5 (21%), @t3-oss/env-core 1 (4%), envalid 1 (4%) |
| tsRes | unset 147 (54%), node 76 (28%), bundler 23 (9%), nodenext 22 (8%), node16 2 (1%) | unset 45 (49%), node 17 (19%), nodenext 16 (18%), bundler 11 (12%), node16 2 (2%) | unset 9 (38%), nodenext 7 (29%), bundler 5 (21%), node 3 (13%) |
