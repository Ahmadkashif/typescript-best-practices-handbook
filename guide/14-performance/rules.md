# Performance rules (PERF)

All numbers come from `phase-3/bench/results.md`: Node 24.21.0 on an i7-10700K, medians, reproducible scripts in `phase-3/bench/`. Treat them as relative, not absolute.

## Measured facts this section relies on

| Question | Result |
|---|---|
| Framework throughput, validated POST (% of raw node:http) | Fastify (ajv path) 100%, Hono 94%, Fastify + Zod provider 92%, Nest-on-Fastify 88%, Express 5 70% |
| Framework throughput, hello-world GET | Hono 95%, Nest-Fastify 88%, Fastify 87%, Express 62% |
| Typecheck, 36k LOC | tsc 6.0.3: 3,094 ms / 494 MB. **tsc 7.0.2: 408 ms / 241 MB (about 7.6x faster)** |
| Cold start, 401-module app | Bundle 193 ms. Unbundled compiled JS 346 ms. Native type stripping 562 ms. tsx 585 ms |
| Cold start, small Fastify app | Bundle 107 ms (88 ms with compile cache). Unbundled 169 ms. ESM and CJS are equal (169 vs 167 ms). Type stripping 194 ms |
| Image size (compressed) | distroless 55.6 MB, alpine 61.9 MB, slim 81.1 MB. App code is under 5% of it |
| Validation (valid payload, ops/s) | Zod 4: 307k. Valibot: 434k. TypeBox compiled: 4.2M. ajv: 1.3M. Every library costs at most about 3.3 µs per request |
| Logging (lines/s to a pipe) | pino 374k (child logger 493k), winston 200k, `console.log(JSON)` 402k |

### PERF-001 Measure, then optimize
**Level:** MUST
**Rubric:** R4 M5 S4 D5 C5
**Rule:** Any optimization PR includes a before/after measurement: autocannon for HTTP, `--cpu-prof` or a flame graph for CPU, `process.memoryUsage()` or a heap snapshot for memory. Micro-optimizations without numbers are rejected.
**Sources:** A-094, A-095, A-130, PRIN-007

### PERF-002 The framework is not your bottleneck; pick for features
**Level:** PREFER
**Rubric:** R4 M4 S4 D4 C4
**Rule:** Do not migrate frameworks for speed. Once validation and JSON are involved, Fastify, Hono and Nest-on-Fastify are within about 12% of each other. Express 5 is about 1.4x slower, which is AVOID for new services but not a migration trigger on its own.
**Sources:** phase-3/bench/results.md section 1, A-077, A-142

### PERF-003 Production starts compiled, bundled JavaScript
**Level:** MUST
**Rubric:** R4 M4 S4 D5 C4
**Rule:** Production runs `node dist/main.js` built by tsdown. Do not run `.ts` sources (type stripping is about 60% slower to start) or thousands of unbundled modules (about 1.8x slower to start) in production.
**Sources:** phase-3/bench/results.md section 2, A-010, A-066

### PERF-004 Use pino child loggers, and never log in tight synchronous loops
**Level:** MUST
**Rubric:** R4 M4 S5 D5 C5
**Rule:** Use `request.log` or `logger.child({...})` for request context, because bound fields are serialized once. A loop that logs without yielding makes async pino buffer without limit (measured 225 MB RSS).
**Sources:** phase-3/bench/results.md section 4, A-084, A-122

### PERF-005 Keep Zod by default; switch hot endpoints to JIT validation only when measured
**Level:** PREFER
**Rubric:** R4 M4 S4 D4 C4
**Rule:** Zod via the type provider costs about 8% of throughput on a validated POST. If a profiled endpoint needs it, export the same schema with `z.toJSONSchema` and let Fastify's ajv validate it. The schema stays the single source of truth.
**Sources:** phase-3/bench/results.md sections 1 and 3, A-079, A-117, A-118

### PERF-006 Reuse connections; use undici for hot outbound HTTP
**Level:** PREFER
**Rubric:** R3 M4 S5 D5 C4
**Rule:** Use keep-alive agents and connection pools for every upstream. For high-volume service-to-service calls use `undici.request`, or an undici `Pool`, over global `fetch` (A-100 reports about 3x). Always consume or cancel response bodies.
**Sources:** A-100, A-105

### PERF-008 Enable Node's compile cache in production images
**Level:** PREFER
**Rubric:** R4 M4 S4 D5 C3
**Rule:** Call `module.enableCompileCache()` at the top of the entry, or set `NODE_COMPILE_CACHE` to a directory that is warmed during `docker build`. Measured: 15-25% faster boot (bundle: 107 to 88 ms). The boilerplate does not do this yet (see open questions).
**Sources:** phase-3/bench/results.md section 6, catalog (Node compile cache)

### PERF-007 Scale out with processes, not threads; size the pool to the CPU quota
**Level:** PREFER
**Rubric:** R4 M4 S5 D5 C4
**Rule:** Run one Node process per container and scale with replicas. Use `cluster` only on bare VMs. Set `UV_THREADPOOL_SIZE` only when profiling shows fs/crypto/dns queueing. Respect the container CPU limit (`os.availableParallelism()`).
**Sources:** A-078, A-076, A-097
