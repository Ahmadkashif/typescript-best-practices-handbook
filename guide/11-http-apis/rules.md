# HTTP API rules (HTTP)

### HTTP-001 Fastify 5 is the HTTP framework
**Level:** MUST (new Node services)
**Rubric:** R4 M5 S5 D5 C4
**Rule:** New HTTP services use Fastify 5 with the Zod type provider. Hono is allowed by ADR when edge or multi-runtime portability is a hard requirement. Express is acceptable only for existing services. NestJS is AVOID for new services, because it requires non-erasable decorators (LANG-004).
**Why:** Fastify has built-in pino logging, schema-driven validation and serialization, `inject()` for tests, encapsulated plugins and lifecycle hooks. It also has the best measured throughput (see 14-performance / phase-3/bench).
**Sources:** A-077, A-117, A-142, A-149, A-138, phase-3/bench/results.md, phase-3/boilerplate-deep-dive.md, ADR-0001

### HTTP-002 Every route declares schemas for params, query, body and response
**Level:** MUST
**Rubric:** R5 M5 S5 D4 C4
**Rule:** Define route schemas with Zod through `fastify-type-provider-zod`. Handlers get typed `request` objects and need no casts. Response schemas stop extra fields (secrets) from leaking and speed up serialization.
```ts
import Fastify from 'fastify';
import { z } from 'zod';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';

const app = Fastify().withTypeProvider<ZodTypeProvider>();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.get('/users/:id', {
  schema: {
    params: z.object({ id: z.uuid() }),
    response: { 200: z.object({ id: z.uuid(), email: z.email() }) },
  },
}, async (req) => ({ id: req.params.id, email: 'a@example.com' }));
```
**Sources:** A-117, A-079, A-080

### HTTP-003 Route handlers are thin
**Level:** MUST
**Rubric:** R5 M5 S4 D3 C4
**Rule:** A handler takes the parsed input, calls one service function, and maps the result to a status code and body. Business logic in handlers is banned.
**Sources:** B-09, A-076, A-102

### HTTP-004 One central error handler emitting RFC 9457 problem+json
**Level:** MUST
**Rubric:** R4 M5 S5 D4 C4
**Rule:** `setErrorHandler` maps errors as follows:
- `AppError` uses its own `status` and `code`.
- Validation errors become 400 with a field list.
- Anything else becomes 500 with no internals.

The response content type is `application/problem+json`, with fields `type`, `title`, `status`, `detail`, `instance`, plus `code` and `requestId`.
**Sources:** A-147, A-076, A-080, ERR-003

### HTTP-005 Liveness and readiness are separate endpoints
**Level:** MUST
**Rubric:** R4 M5 S5 D5 C5
**Rule:** `GET /health` (liveness) returns 200 while the process can serve and checks no dependencies. `GET /ready` (readiness) runs the dependency checks and returns 503 when any fails, and also during shutdown.
**Sources:** A-123, A-087, phase-3/boilerplate-deep-dive.md

### HTTP-006 Server limits are explicit
**Level:** MUST
**Rubric:** R4 M4 S5 D5 C5
**Rule:** Set `bodyLimit` (default 1 MiB or less), `requestTimeout`, `connectionTimeout`, and a `keepAliveTimeout` greater than the load balancer's idle timeout (for example 65 s against an ALB's 60 s).
**Sources:** A-137, A-080, A-146

### HTTP-007 Graceful shutdown: stop accepting, fail readiness, drain, exit with a deadline
**Level:** MUST
**Rubric:** R4 M5 S5 D5 C5
**Rule:** On SIGTERM/SIGINT:
1. Mark not-ready.
2. Call `app.close()` (Fastify stops accepting connections and drains in-flight requests).
3. Close pools.
4. Exit 0.

A hard deadline (default 10 s) forces exit 1. The same path handles fatal errors (ERR-006). The boilerplate implements this with `close-with-grace`.
**Sources:** A-087, A-139, A-123, A-081

### HTTP-008 Shed load instead of queueing forever
**Level:** PREFER
**Rubric:** R3 M4 S5 D5 C4
**Rule:** Register `@fastify/under-pressure` with event-loop delay and heap thresholds, and return 503 with `Retry-After` when they are exceeded.
**Sources:** A-140, A-078

### HTTP-009 Version and document the API from the schemas
**Level:** PREFER
**Rubric:** R4 M5 S4 D3 C4
**Rule:** Generate OpenAPI from the route schemas (`@fastify/swagger` with the Zod transform). Never maintain a hand-written spec next to the code. Breaking changes get a new path version (`/v2`) or a new field, never a silent change.
**Sources:** A-117, A-079
