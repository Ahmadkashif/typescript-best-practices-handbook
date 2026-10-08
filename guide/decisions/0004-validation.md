# ADR-0004 Validation: Zod 4

- **Status:** Accepted
- **Decision:** Zod 4 is the only validation library, used for env, HTTP (via the type provider) and external data.
- **Evidence:**
  - Most used validator in the deep read (15 of 32) and among TS>=6 adopters.
  - Standard Schema compatible (A-116).
  - Bench: 307k valid parses/s, at most about 3.3 µs per request, about 8% throughput cost vs Fastify's ajv path.
- **Alternatives:**
  - Valibot is 1.4-3.5x faster with a 1.6 ms cold start: the PREFER-able option for serverless/edge by ADR.
  - TypeBox/ajv are 3-14x faster but only check; they are reserved for measured hot paths via `z.toJSONSchema`.
  - class-validator needs decorators: banned.
- **Rubric:** Zod R5 M5 S4 D4 C4
