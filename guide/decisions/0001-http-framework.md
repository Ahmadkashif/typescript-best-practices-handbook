# ADR-0001 HTTP framework: Fastify 5

- **Status:** Accepted (2026-10-06)
- **Decision:** New Node HTTP services use **Fastify 5** with `fastify-type-provider-zod`.
  - Hono 4 is allowed by ADR when edge or multi-runtime portability is a hard requirement.
  - Express 5 is AVOID for new services.
  - NestJS is AVOID for new services.
- **Options considered:** Fastify, Hono, Express 5, NestJS 12, raw `node:http`.
- **Evidence:**
  - **Bench (phase-3/bench section 1), validated POST as % of node:http:** Fastify 100%, Hono 94%, Fastify+Zod 92%, Nest-on-Fastify 88%, Express 70%. Speed does not separate Fastify from Hono; it does rule out Express.
  - **Built-in features:** Fastify ships pino, schema validation and serialization, `inject()`, `onClose` and plugin encapsulation, so no glue code is needed (boilerplate deep dive).
  - **Nest:** it requires `experimentalDecorators` and `emitDecoratorMetadata`, which conflicts with LANG-004 and `erasableSyntaxOnly`. It compiles on TS 7, but it cannot run under type stripping.
  - **Survey:** Nest and Express lead overall on legacy weight. Among the 32 deep-read repos, Fastify is third.
- **Rubric:** Fastify R4 M5 S5 D5 C3 · Hono R5 M4 S4 D5 C3 · Express R4 M3 S3 D3 C5 · Nest R3 M4 S4 D3 C4
- **Consequences:** Route schemas are mandatory (HTTP-002). Express middleware needs `@fastify/express` or a rewrite.
- **Sources:** A-077, A-117, A-138, A-142, A-149, phase-3/bench/results.md, phase-3/boilerplate-deep-dive.md
