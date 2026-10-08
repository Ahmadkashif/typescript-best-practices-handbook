# Phase 1: Scoping

Date: 2026-10-06. All versions below were verified live (npm registry `npm view`, nodejs.org/dist/index.json, nodejs/Release, TS devblog) on this date.

## 1. Version baseline (verified live)

| Component | Version / status | Evidence |
|---|---|---|
| TypeScript (npm `typescript@latest`) | **7.0.2** (released 2026-07-08), the native Go compiler ("Corsa"). `next` = 7.1.0-dev.20261006 | `npm view typescript dist-tags`; devblogs "Announcing TypeScript 7.0" |
| TS 7 JS API | **None in 7.0.** 7.1 is expected to ship a new, different API. Tools that embed the compiler (typescript-eslint, ts-morph, Vue/Angular/Svelte checkers) must use `@typescript/typescript6` (6.0.2, ships `tsc6` + the 6.0 API) | TS 7.0 announcement |
| TS 6.0 | 6.0.2 (2026-03-23), 6.0.3 (2026-04-16): last JS-based compiler; deprecation bridge to 7 | npm time |
| `@typescript/native-preview` | 7.0.0-dev.20260707.2, now superseded by `typescript@7` | npm |
| typescript-eslint | 8.71.1, peer `typescript >=4.8.4 <6.1.0`, so it **cannot** load TS 7 directly. Use the documented alias `"typescript": "npm:@typescript/typescript6@^6.0.2"` plus `"@typescript/native": "npm:typescript@^7.0.2"` | `npm view typescript-eslint peerDependencies` |
| TS 7 removed options | `target: es5`, `downlevelIteration`, `moduleResolution: node/node10/classic`, `module: amd/umd/system/none`, `baseUrl`, `esModuleInterop:false`, `alwaysStrict:false`, `import ... asserts`, `module` keyword for namespaces | TS 7.0 announcement |
| TS 7 new defaults | `strict: true`, `module: esnext`, `noUncheckedSideEffectImports: true`, `stableTypeOrdering: true`, `rootDir: ./`, `types: []` | TS 7.0 announcement |
| Node.js LTS | **24.x "Krypton" Active LTS** (latest 24.21.0, 2026-09-07). 22.x Jod = Maintenance (EOL 2027-04-30). **26.x = Current, becomes LTS 2026-10-28** (latest 26.10.0) | nodejs/Release, dist index |
| Node type stripping | **Stable** since v24.12.0 / v25.2.0. `--experimental-transform-types` removed in v26.0.0. No enums, runtime namespaces, parameter properties, import-aliases or decorators. Ignores tsconfig. Requires `.ts` extensions. Disabled in node_modules | nodejs.org/api/typescript.html (v26.10.0 docs) |
| Local env | node v24.15.0, npm 11.12.1, Docker 29.8.1 (available), gh available | `node -v` etc. |

Other live versions used by the stack decisions: fastify 5.12.5, hono 4.13.13, express 5.2.1, @nestjs/core 12.1.2, zod 4.6.5, valibot 1.5.0, pino 10.4.0, vitest 5.0.3, eslint 10.12.0, @biomejs/biome 2.5.15, drizzle-orm 0.45.3, kysely 0.29.6, prisma 8.0.0-rc.20 (latest tag is an RC), tsx 4.23.15, tsdown 0.23.0, esbuild 0.28.2, lefthook 2.1.17, husky 9.1.7, @types/node 26.6.4, fastify-type-provider-zod 7.0.0.

## 2. Boundaries

- **IN:** backend Node.js + TypeScript: HTTP APIs, background workers, CLIs, internal libraries, and monorepos made of these.
- **OUT:** frontend/React/SSR frameworks; Deno and Bun as primary targets. They appear only in runtime/deploy comparisons.
- **Runtime target:** Node 24 LTS minimum (`engines.node >=24.12`, so type stripping is stable), tested on 26. Move the floor to 26 after 2026-10-28.

## 3. Rule format (binding for guide/)

```
### <AREA>-<NNN> <Short rule title>
**Level:** MUST | MUST NOT | PREFER | AVOID
**Rubric:** R<1-5> M<1-5> S<1-5> D<1-5> C<1-5>   (Readability, Maintainability, Scalability, Deploy/Perf, Consensus)
**Rule:** one imperative sentence.
**Why:** 1-3 sentences.
**Good / Bad:** fenced `ts` examples (all typechecked in phase-5/snippet-check)
**Enforcement:** tsconfig flag | lint rule | CI check | review-only
**Sources:** ids from sources.md (A-xxx articles, B-xx books, V-xx version evidence, plus phase-3 files). MUST/MUST NOT needs >=2 independent sources or a measurement
```

Area prefixes: PRIN, LANG, TSC, STRUCT, TYPES, ERR, PAT, ARCH, ASYNC, VAL, DATA, HTTP, TEST, TOOL, PERF, BUILD, OBS, SEC, DEP.

Promotion rule: MUST/MUST NOT needs >=2 independent credible sources or a reproducible measurement in phase-3/bench. Otherwise the rule is PREFER/AVOID, or it is dropped.

## 4. Guide tree

Final, as in plan.md section 5A (00-principles .. 18-dependencies + decisions/), each folder with a README.md index.

## 5. Scoping implications found already

1. "Which TypeScript" is now a two-package question: `typescript@7` for `tsc` (typecheck/emit), `@typescript/typescript6` for tools that need the API. The boilerplate must prove this dual install works with typescript-eslint.
2. TS 7 removed `baseUrl`, and Node ignores tsconfig `paths`. That favors `package.json#imports` (`#src/*`) for aliases, which Node, TS (nodenext) and bundlers all resolve natively.
3. Node's stable type stripping makes `erasableSyntaxOnly` the natural language subset: enums, namespaces, parameter properties and legacy decorators are out.
