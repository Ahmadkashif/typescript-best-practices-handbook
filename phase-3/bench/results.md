# Bench results: TypeScript backend guide (phase 3)

Run date: 2026-10-06/07. Every number here can be reproduced from the scripts in each subfolder. Run `source env.sh` first (it pins Node 24.21.0; set `NODE_DIR` to your own Node 24 install), then `npm install` in the folder, then:

| Folder | Command |
|---|---|
| `http/` | `npx tsc -p . && cp servers/*.js dist/ && ./smoke.sh && ./run.sh 10 3 && node summarize.mjs` |
| `compile/` | `node gen.mjs 400 && ln -sfn ../node_modules proj/node_modules && node run.mjs 5` |
| `validation/` | `node bench.js; node cold.js zod` (also `valibot`, `typebox`, `ajv`) |
| `logging/` | `./run.sh > raw.jsonl && node summarize.mjs` |
| `docker/` | `npm install` (for the lockfile), then `./run.sh` |
| `startup/` | `./build.sh && node run.mjs 25` |

## Machine

| Item | Value |
|---|---|
| CPU | Intel Core i7-10700K @ 3.80GHz, 8C/16T |
| RAM | 31 GiB |
| OS | Linux 7.0.0-34-generic (x86_64) |
| CPU governor | `powersave` (intel_pstate, turbo on). Not tuned, desktop with other apps running, so absolute numbers carry noise of ~5% |
| Node | v24.21.0 (Krypton, current Active LTS), official linux-x64 binary |
| npm | 11.x (bundled) |
| Docker | 29.8.1 |

## Versions verified live (npm registry / nodejs.org, 2026-10-06)

| Thing | Version | Note |
|---|---|---|
| Node LTS | 24.21.0 "Krypton" (Active LTS) | 22.23.3 "Jod" is Maintenance LTS; 26.10.0 is Current (goes LTS in late Oct 2026) |
| typescript | 7.0.2 (`latest`, published 2026-07-08) | TS 7 is the native Go compiler shipped as the `typescript` package with per-platform binaries (`@typescript/typescript-linux-x64`). 6.0.3 is the last JS-based release. `next` = 7.1.0-dev nightlies. `@typescript/native-preview` is now stale (last 7.0.0-dev.20260707) |
| fastify | 5.12.5 | 6.0.0-alpha on `next` |
| express | 5.2.1 | |
| hono / @hono/node-server | 4.13.13 / 2.1.3 | |
| @nestjs/core, platform-fastify | 12.1.2 | |
| zod | 4.6.5 | |
| valibot | 1.5.0 | |
| typebox | 1.3.36 (new `typebox` pkg) / @sinclair/typebox 0.34.52 | |
| ajv | 8.20.0 | |
| pino / winston | 10.4.0 / 3.19.0 | |
| esbuild / tsdown / tsup / tsx | 0.28.2 / 0.23.0 / 8.5.1 / 4.23.15 | |
| autocannon | 8.0.0 | |

## General method

- Each benchmark lives in its own folder with a pinned `package.json` and a run script. Raw output is kept next to it.
- CPU pinning with `taskset` to cut scheduler noise. Warm-up runs are discarded. I report medians.
- These are relative comparisons on one machine. Do not quote the absolute numbers as "framework X does N req/s".

## 1. HTTP frameworks (`http/`)

**Setup.** Each server runs as one Node process pinned to CPU 2, with its HT sibling (CPU 10) left idle. autocannon 8 runs with 4 workers on CPUs 4-7 and 12-15: 100 connections, no pipelining, a 2 s warm-up, then 10 s measured. Each cell is the median of 3 runs. With 7 workers instead of 4, node:http only went from 38.8k to 40.0k req/s, so the load generator is not the bottleneck.
- `GET /` returns `{"hello":"world"}`.
- `POST /orders` sends a realistic 600-byte order (UUID, email, enum, 4 nested items, address). The server parses the JSON, validates it, and returns a computed summary.
- Validation per server: node:http, Express, Hono, `fastify-zod` and Nest all use zod 4 `safeParse`. `fastify` uses idiomatic Fastify: the same schema exported via `z.toJSONSchema` and validated by Fastify's built-in ajv, plus a response schema (fast-json-stringify). Nest is Nest 12 on `@nestjs/platform-fastify` with a zod pipe, compiled by tsc 7 with `experimentalDecorators` and `emitDecoratorMetadata`. That compiled fine on TS 7.0.2.
- Every server was smoke-tested (`smoke.sh`): valid payload gives 200 and an invalid one gives 400. No non-2xx responses or errors showed up in any measured run.

| Server | GET / req/s | p50 / p99 ms | % of node:http | POST /orders (validated) req/s | p50 / p99 ms | % of node:http | non-2xx+errors |
|---|---:|---:|---:|---:|---:|---:|---:|
| node-http | 40,470 | 2 / 4 | 100% | 22,062 | 4 / 8 | 100% | 0 |
| express | 25,026 | 3 / 5 | 62% | 15,546 | 6 / 11 | 70% | 0 |
| hono | 38,404 | 2 / 3 | 95% | 20,834 | 4 / 9 | 94% | 0 |
| fastify | 35,293 | 2 / 4 | 87% | 22,056 | 4 / 8 | 100% | 0 |
| fastify-zod | 34,287 | 2 / 3 | 85% | 20,349 | 4 / 8 | 92% | 0 |
| nest-fastify | 35,786 | 2 / 5 | 88% | 19,477 | 4 / 8 | 88% | 0 |

Raw per-run numbers are in `http/raw/summary.tsv`. Run-to-run spread was under 3%, except fastify-zod POST (19.5k to 21.8k) and nest POST (18.2k to 19.5k).

**Reading it.**
- On hello-world, Hono (95%), Nest-on-Fastify (88%) and Fastify (87%) all sit within about 10% of raw node:http. Express 5 manages 62%, roughly 1.4 to 1.5x slower than the rest.
- On a validated POST, which is closer to a real endpoint, the gap shrinks. JSON parsing and validation dominate. Fastify with its compiled JSON-schema path matches raw node:http (100%), Hono and fastify+zod reach 92 to 94%, Nest 88%, and Express 70%.
- The widely repeated "Fastify is 2 to 3x faster than everything" no longer holds against Hono's Node adapter (`@hono/node-server` 2.x). On this machine Hono was slightly ahead on GET (38.4k vs 35.3k), and Fastify slightly ahead on validated POST (22.1k vs 20.8k). The "Express is much slower" claim does hold for Express 5, but the gap is about 1.4x, not 3x, and it shrinks once real work happens.
- Nest's abstraction costs about 0 to 10% when it runs on the Fastify adapter. Framework choice will not be the bottleneck in an app that does any I/O.

## 2. Compile, build and run path (`compile/`)

**Setup.** `gen.mjs 400` generates a backend-shaped project: 400 modules plus a core lib, about 36k LOC. It uses only erasable syntax and has strict, realistic types: branded IDs, a Result union, discriminated-union events with `assertNever`, mapped and conditional types, a generic repository class with `#private` fields, `as const` objects instead of enums, and `.ts` relative imports. Each module imports 3 earlier modules, and it pulls in `node:crypto` (so `@types/node` is loaded). The tsconfig is strict + `noUncheckedIndexedAccess` + `verbatimModuleSyntax` + `erasableSyntaxOnly` + `rewriteRelativeImportExtensions`, with nodenext resolution. `run.mjs` reports the median of 5 runs after 1 discarded warm-up run, with a CPU-warmer busy loop on another core (see Caveats). Wall time is measured from spawn to exit. RSS comes from GNU `time`. The "start" rows run the whole app: import all 401 modules, execute, print, exit.

| Group | Command | median ms | max RSS MB |
|---|---|---:|---:|
| typecheck | tsc 6.0.3 (JS) --noEmit | 2728 | 499 |
| typecheck | tsc 7.0.2 (native) --noEmit | 304 | 235 |
| typecheck | tsc 7.0.2 --noEmit --singleThreaded | 813 | 224 |
| build | tsc 6.0.3 emit (typecheck + emit) | 3131 | 518 |
| build | tsc 7.0.2 emit (typecheck + emit) | 334 | 265 |
| build | esbuild transpile, unbundled (no typecheck) | 80 | 115 |
| build | esbuild bundle (no typecheck) | 38 | 80 |
| build | tsdown 0.23 bundle (rolldown, no typecheck) | 220 | 257 |
| build | tsup 8.5 bundle (esbuild, no typecheck) | 209 | 90 |
| start | node dist (tsc output, 402 files) | 260 | 76 |
| start | node bundle (esbuild single file) | 128 | 61 |
| start | node src/main.ts (native type stripping) | 425 | 107 |
| start | tsx src/main.ts | 424 | 98 |
| start | node --import tsx src/main.ts | 384 | 97 |
| start | node -e "" (baseline: empty process) | 21 | 44 |

Output sizes: tsc7 dist 1180 KB, esbuild bundle 1019 KB, tsdown 1038 KB, tsup 1019 KB

**Scaling check, typecheck only, 1,600 modules / 144k LOC (3 runs):** tsc 6.0.3 took 7.9 to 8.6 s and about 1.0 GB RSS. tsc 7.0.2 took 1.0 to 1.25 s and about 0.7 GB.

**Reading it.**
- **TS 7 (native, Go) is about 9x faster than TS 6 at typechecking (2.73 s to 0.30 s), and about 9.4x faster at a full `tsc` build (3.13 s to 0.33 s), on this 8-core machine.** It also uses about half the memory at 36k LOC (235 vs 499 MB), but the memory gap narrows at 144k LOC (0.7 vs 1.0 GB). Even forced to `--singleThreaded`, it is still about 3.4x faster, so not all of the speedup comes from parallelism. It emitted JS identical in shape to TS 6, and it accepted `experimentalDecorators` / `emitDecoratorMetadata` (the Nest build in `http/`).
- With TS 7, the old advice "typecheck with tsc, but build with esbuild/swc because tsc is slow" loses most of its force for apps. `tsc` emit (typecheck included) took 334 ms. Unbundled esbuild transpile took 80 ms but checks nothing. tsdown/tsup took about 210 to 220 ms, and most of that is tool start-up; raw esbuild bundles in 38 ms.
- **Cold start: a single-file bundle starts about 2x faster than 402 unbundled ESM files** (128 vs 260 ms; the empty-process floor is 21 ms). The cost is in resolving and loading many ESM modules, not in parsing. The bundle's output is about the same size.
- **Running TS source directly costs start-up time.** Node's native type stripping (unflagged in Node 24, no flags needed) took 425 ms vs 260 ms for the compiled JS of the same code: about +63% here, with about 30 MB more RSS. On this 401-file case, `node --import tsx` (384 ms) and the `tsx` CLI (424 ms) were about as fast as native stripping, because tsx caches its transforms on disk. Conclusion: native stripping is fine for dev, scripts and tests. Production should start compiled JS (bundled if start-up matters).

## 3. Validation libraries (`validation/`)

**Setup.** The same order schema is defined in each library (`schemas.js`): uuid and email formats, an enum, an optional string, a nested array of 4 item objects with int/range checks, and a nested address. The invalid payload has 3 errors. `bench.js` calibrates each batch to about 50 ms, runs 5 warm-up batches, then takes the median of 7 batches, pinned to one core. The invalid column includes building the issue list, since that is what an API returns. Every library is sanity-checked to accept the valid payload and reject the invalid one. `cold.js` measures, in a fresh process, the import of the validator package plus schema build/compile plus the first validation (median of 3).

| Library | valid ops/s | invalid ops/s (incl. building error list) |
|---|---:|---:|
| zod 4 safeParse | 306,537 | 84,346 |
| valibot safeParse | 433,501 | 300,420 |
| typebox Compile().Check | 4,223,132 | 33,354 |
| typebox Value.Check (no JIT) | 48,074 | 31,805 |
| ajv compiled (first error) | 1,320,915 | 4,243,927 |
| ajv compiled (allErrors) | 1,307,317 | 1,255,546 |

| Cold cost (fresh process) | import + build + 1st parse | next 100 parses |
|---|---:|---:|
| valibot | 1.6 ms | 2.9 ms |
| zod 4 | 8.5 ms | 3.0 ms |
| ajv + ajv-formats (from `z.toJSONSchema`) | 67 ms | 0.9 ms |
| typebox `Compile` | 74 ms | 0.65 ms |

**Reading it.**
- **This is not apples to apples.** zod and valibot *parse*: they return a new object with unknown keys stripped and the types narrowed. typebox `Check` and ajv only *check* the input as it is. If you want zod-like stripping from the JIT validators, you pay extra (`removeAdditional`, `Value.Clean`/`Parse`).
- The JIT validators (typebox `Compile`, ajv) are 3 to 14x faster than zod 4 on valid input. typebox's compiler was about 3x faster than ajv here. valibot is about 1.4x faster than zod 4 on valid input and about 3.5x faster on invalid input.
- On the error path, zod 4 is the outlier among the parsers (84k/s vs valibot's 300k/s). typebox's JIT `Errors()` falls back to slow dynamic checking (33k/s). ajv in first-error mode is the fastest of all.
- **In absolute terms, every library costs at most about 3.3 µs per request for this payload.** In the HTTP test, swapping Fastify's ajv path for zod cost about 8% of throughput. Validation is not where a typical API spends its time, so choose for developer experience and type inference (zod/valibot), and reach for a JIT validator only on measured hot paths.
- The JIT validators pay about 65 to 75 ms of compile/import at cold start for a single schema. That matters on serverless; on long-running servers it does not.

## 4. Loggers (`logging/`)

**Setup.** Each logger writes 200k structured lines (4 context fields, a counter and a message) to stdout. The script yields to the event loop every 50 lines, like a server interleaving requests, and the clock stops only once everything is flushed. Each logger runs in a fresh process pinned to one core, 3 runs, median shown. Two stdout targets were tested: a file (`/dev/null`) and a pipe (what a container log driver reads). `console-json` and `stdout-write-json` are hand-rolled `JSON.stringify` lines with no levels, serializers or redaction: a floor, not a logger.

| Logger | file (/dev/null) lines/s | RSS MB | pipe lines/s | RSS MB |
|---|---:|---:|---:|---:|
| console-json | 473,127 | 64 | 401,723 | 63 |
| stdout-write-json | 650,314 | 64 | 544,262 | 64 |
| pino | 382,063 | 77 | 374,158 | 92 |
| pino-sync | 413,614 | 76 | 349,174 | 77 |
| pino-child | 527,285 | 77 | 493,134 | 96 |
| winston | 215,816 | 94 | 199,782 | 94 |

**Reading it.**
- **pino is about 1.8x faster than winston** (382k vs 216k lines/s to a file, 374k vs 200k to a pipe). With a child logger, which pre-serializes bound context such as a request ID, pino reaches 2.5x winston and is faster than hand-rolled `console.log(JSON.stringify(...))`.
- pino's default destination in v10 is asynchronous (sonic-boom). It was about as fast as `sync: true` here, slightly faster to a file and slightly slower to a pipe.
- **Pitfall I hit on the first attempt:** in a tight synchronous loop that never yields to the event loop, async pino buffered everything in memory (RSS reached 225 MB) and looked slower than `console.log`. winston behaved worse (529 MB RSS). Real servers yield constantly, so the table above is the realistic one. Still, the guide should use child loggers per request and should never log in a hot synchronous loop.
- `console.log` alone is not a logger (no levels, redaction or serializers), and at 1.2 to 1.4x below a raw `process.stdout.write` it is not faster than pino either. Use pino.

## 5. Container image size (`docker/`)

**Setup.** The section-6 app (Fastify + pino + zod) is built in a `node:24-slim` build stage, then copied into each of three runtime bases in two shapes: `bundle`, a single minified esbuild file (about 1 MB, no `node_modules`), and `unbundled`, tsc output plus `npm ci --omit=dev` `node_modules`. `run.sh` builds all 6 images, boots each one (`docker run`, listen, exit 0), and records the sizes. Docker 29.8 uses the containerd image store. "Content" is the compressed size, which is what gets pulled. "Disk" is the local unpacked usage.

| Runtime base | Shape | Content (compressed) | Disk (unpacked) | Boots |
|---|---|---:|---:|---|
| `node:24-slim` (Debian, glibc) | base image | 83.4 MB | 332 MB | |
| | bundle | 81.1 MB | 331 MB | yes |
| | unbundled | 83.4 MB | 356 MB | yes |
| `node:24-alpine` (musl) | base image | 62.0 MB | 242 MB | |
| | bundle | 61.9 MB | 243 MB | yes |
| | unbundled | 64.2 MB | 268 MB | yes |
| `gcr.io/distroless/nodejs24-debian13:nonroot` | base image | 55.3 MB | 214 MB | |
| | bundle | **55.6 MB** | **216 MB** | yes |
| | unbundled | 57.9 MB | 240 MB | yes |

(For slim, the bundle image's compressed size is slightly below the base image's because the multi-arch base index is counted differently. Treat differences under 1 MB as noise.)

**Reading it.**
- **The base image decides the size, not your app.** The prod `node_modules` for 3 deps add about 25 MB unpacked (2 to 3 MB compressed); a bundle adds about 1 MB. Distroless is the smallest (about 33% smaller compressed than slim, 11% smaller than alpine), runs as non-root by default, and has no shell or package manager, so the attack surface is smaller.
- Alpine saves about 20 MB over slim, but it runs Node on musl, which is an "experimental" tier platform in Node's support matrix and a known source of native-addon and DNS edge cases. Distroless beats it on size anyway, without leaving glibc.
- Recommendation for the guide: multi-stage build on `node:24-slim`, runtime on `gcr.io/distroless/nodejs24-debian13:nonroot` (or `node:24-slim` if you need a shell for debugging), shipping either the bundle or `--omit=dev` deps. The in-container "ready" times (112 to 203 ms, single shot) follow the same bundled-vs-unbundled pattern as section 6.

## 6. Start-up: ESM vs CJS, bundled vs unbundled, compile cache, TS-direct (`startup/`)

**Setup.** `src/app.ts` is a realistic small service: Fastify 5 + pino 10 + zod 4, a zod-validated env, 2 routes, listen, then close. `build.sh` emits every variant from that one source. `run.mjs` runs all 16 variants round-robin (8 shapes, each with `NODE_COMPILE_CACHE` off and on), 25 measured rounds after 2 warm-up rounds. It runs on CPUs 2-3 with the CPU warmer on CPU 9. "Wall" is spawn to exit; "ready" is the process's own `performance.now()` at `listen`. The interquartile range is tight (±2%).

| Variant | compile cache | wall median ms (p25-p75) | in-process ready ms | max RSS MB |
|---|---|---:|---:|---:|
| ESM unbundled (tsc output) | off | 169 (167-170) | 152 | 82 |
| ESM unbundled (tsc output) | on | 142 (139-145) | 126 | 84 |
| CJS unbundled | off | 167 (165-169) | 150 | 82 |
| CJS unbundled | on | 134 (133-135) | 117 | 83 |
| ESM bundle (esbuild) | off | 107 (106-109) | 100 | 75 |
| ESM bundle (esbuild) | on | 88 (87-89) | 80 | 70 |
| ESM bundle minified | off | 110 (109-113) | 103 | 74 |
| ESM bundle minified | on | 90 (89-92) | 83 | 67 |
| CJS bundle (esbuild) | off | 105 (105-107) | 98 | 74 |
| CJS bundle (esbuild) | on | 87 (86-88) | 80 | 69 |
| TS source, native type stripping | off | 194 (192-197) | 183 | 98 |
| TS source, native type stripping | on | 141 (139-144) | 124 | 84 |
| TS source, node --import tsx | off | 284 (278-286) | 274 | 95 |
| TS source, node --import tsx | on | 252 (250-257) | 242 | 97 |
| TS source, tsx CLI | off | 324 (321-327) | 270 | 95 |
| TS source, tsx CLI | on | 289 (283-297) | 235 | 98 |

**Reading it.**
- **ESM vs CJS does not matter for start-up.** Unbundled: 169 vs 167 ms. Bundled: 107 vs 105 ms. The "CJS starts faster" argument is dead on Node 24, so choose ESM on its merits.
- **Bundling does matter: about 37% faster cold start** (169 to 107 ms) and 7 MB less RSS, for an app with only 3 direct deps. The saving grows with the dependency graph (the 401-module app in section 2 went from 260 to 128 ms). Minifying gains nothing (110 vs 107 ms). It only shrinks the file.
- **`NODE_COMPILE_CACHE` (or `module.enableCompileCache()`) is a free 15 to 25%**: 169 to 142 ms unbundled, 107 to 88 ms bundled. Bundle + compile cache comes to 88 ms, about half of the plain unbundled start. The cache directory has to survive between starts: bake it into the image at build time, or put it on a persistent volume.
- **Running TS directly in production costs start-up time.** Native type stripping took 194 ms vs 169 ms for tsc output (+15%) and 16 MB more RSS. tsx is far worse (284 to 324 ms). Interesting twist: with a compile cache, native stripping (141 ms) matches compiled JS with a cache (142 ms), because the cache stores post-strip code. That makes "node src/app.ts + compile cache" a defensible choice for internal tools. For services, the guide should still ship compiled (bundled) JS.

## Caveats

- **One machine, one run session.** This is a desktop (i7-10700K) with Chrome and other agents running, on the `powersave` governor. Absolute numbers will differ on cloud vCPUs. The ratios are the point.
- **CPU-warmer.** Short-lived processes (start-up and build timings) showed bimodal timings, 105 vs 355 ms for the same command, depending on whether the CPU package was in a deep idle/low-frequency state. For sections 2 and 6 I ran a busy loop pinned to CPU 9 for the whole measurement, which made the IQR ±2%. The first, noisier start-up runs were discarded. If you reproduce without root access to set the `performance` governor, do the same. Sustained benchmarks (HTTP, validation, logging) were not affected.
- **HTTP**: a single process on one core, over loopback, with no pipelining, keep-alive on, and payloads under 1 KB. It measures framework overhead only, not real I/O, and real apps will be DB-bound long before they hit these limits. A different validator per framework (Fastify's ajv vs zod elsewhere) is deliberate: it is the idiomatic path. `fastify-zod` isolates the framework effect.
- **Validation**: parse (zod, valibot: returns a stripped copy) vs check (typebox, ajv: no copy) differ in semantics. One schema shape only; deep recursive or huge-array payloads may rank differently.
- **Logging**: output went to `/dev/null` and a pipe, not to a real disk or log shipper. Formatting time is counted; I/O latency is not.
- **TS 7**: measured on generated code. Real codebases with heavy conditional types or large `.d.ts` dependencies may see a different (usually still large) speedup. The `--singleThreaded` row shows the floor. Not tested: the TS 7 language-service/editor experience, the API for tools that need the compiler API (typescript-eslint type-aware rules, ts-morph), or `--build` mode in monorepos.
- **Docker**: one sample per image for the boot time. Sizes are exact. Image digests are not pinned (the tags were pulled on 2026-10-07).
- Not benchmarked (no cheap, fair setup here): Bun/Deno runtimes, swc, Node cluster/worker scaling, ORM/query-builder overhead.

## What this means for the guide

1. **Framework (11-http-apis, decisions):** Do not justify the framework choice on throughput. Fastify 5, Hono 4 and Nest 12 on Fastify land within about 10% of raw `node:http`. Express 5 is the only clear laggard, at 62 to 70% of node:http (1.4 to 1.6x slower than the others). Rule: **AVOID Express 5 for new services.** The reason is mainly ecosystem/typing; perf is secondary but measurable. **PREFER Fastify** (built-in schema validation/serialization reaches 100% of raw node on validated POSTs, plus the plugin and encapsulation model) or Hono (fastest on hello-world, portable runtime). Nest-on-Fastify is acceptable only for its architecture; its perf tax is 0 to 12%. **MUST NOT** use Nest on its default Express adapter if perf is a stated goal.
2. **Compiler (02-compiler-config, 13-tooling):** **MUST use TypeScript 7.x** (`typescript@7`, native). Typecheck is about 9x faster and uses about half the memory, and it still accepts the decorator flags Nest needs. That turns "typecheck on every commit/pre-push" from painful into free. Verify typescript-eslint / editor tooling compatibility before a hard switch.
3. **Build (15-build-and-deploy):** With TS 7, plain `tsc` emit (about 0.33 s for 36k LOC) is fast enough as the app build, so a separate transpiler buys little for build speed. **PREFER a bundler (esbuild directly, or tsdown) for the deployable artifact** because it starts about 37 to 50% faster and gives a single-file image. Typecheck with `tsc --noEmit` in CI regardless, since bundlers do not typecheck. Minification is optional; it has no start-up benefit.
4. **Runtime (15-build-and-deploy):** **MUST ship compiled JS to production, not `.ts` source.** Native type stripping costs +15% (small app) to +63% (401-module app) in start-up, plus 15 to 30 MB of RSS. tsx is worse. Native stripping is fine for scripts, tests and local dev, and with `erasableSyntaxOnly` it keeps the source portable. **PREFER `tsx` only in dev** if you need non-erasable syntax or watch mode.
5. **Start-up (14-performance):** **PREFER enabling the Node compile cache** (`module.enableCompileCache()` in the entry, or `NODE_COMPILE_CACHE`), warmed at image build time: 15 to 25% faster boot at no cost. ESM vs CJS start-up is a wash, so **MUST use ESM** on its merits; perf is not an argument against it.
6. **Validation (09-validation-config-io):** Validation cost is about 1 to 3 µs per request for a typical payload and costs at most about 8% of HTTP throughput. **PREFER zod 4 (or valibot) for developer experience and inference.** Use JSON-schema JIT (typebox `Compile`, or Fastify's ajv via `z.toJSONSchema` or a type provider) only on measured hot paths. Valibot is 1.4x faster on valid input and 3.5x faster on invalid input, with a much smaller cold-start cost (1.6 vs 8.5 ms). It is a legitimate choice for serverless or edge. JIT validators cost about 70 ms of cold compile, which is bad for serverless.
7. **Logging (16-observability):** **MUST use pino** (1.8x winston, and 2.5x with child loggers), **MUST NOT use winston** in new services, and **MUST NOT use bare `console.log`** for app logs. Bind per-request context with `logger.child()`, which is the fastest path measured. Do not log in tight synchronous loops: async destinations can't drain, and memory balloons.
8. **Container (15-build-and-deploy):** **PREFER `gcr.io/distroless/nodejs24-debian13:nonroot`** as the runtime base: smallest (55.6 MB compressed vs 81 MB slim and 62 MB alpine), non-root, no shell. **AVOID alpine** (musl is an experimental-tier Node platform, and its size advantage is gone). Build stage on `node:24-slim`. App code is under 5% of the image either way.
9. **Versions to pin in the boilerplate:** Node 24.x LTS (24.21.0; note that Node 26 becomes LTS in late October 2026), typescript 7.0.x, fastify 5.12, zod 4.6, pino 10.4, esbuild 0.28 / tsdown 0.23.

STATUS: DONE
