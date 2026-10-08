# Observability rules (OBS)

### OBS-001 Structured JSON logs to stdout with pino
**Level:** MUST
**Rubric:** R4 M5 S5 D5 C5
**Rule:** Use one `pino` logger, created in the composition root. Log NDJSON to stdout and let the platform ship it. No `console.log` in `src/`. `pino-pretty` only in dev, as a CLI pipe or transport, never in prod.
```ts
import { pino } from 'pino';
export const logger = pino({
  level: 'info',
  redact: { paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token'], censor: '[redacted]' },
});
logger.info({ orderId: 'o_1' }, 'order created');
```
**Enforcement:** `no-console` lint rule in `src/`. Do not use winston in new services: pino is measured at 1.8x winston's throughput, and 2.5x with child loggers (phase-3/bench section 4).
**Sources:** A-084, A-085, A-122, A-076, phase-3/bench/results.md section 4

### OBS-002 Every log line in a request carries the request id
**Level:** MUST
**Rubric:** R4 M5 S5 D4 C5
**Rule:** Use the framework's request-scoped child logger (`request.log` in Fastify), or the ALS logger (ASYNC-008). Accept `x-request-id` from a trusted proxy, otherwise generate a UUID. Echo it in the response header and in error bodies.
**Sources:** A-084, A-122, A-147

### OBS-003 OpenTelemetry loaded before app code, instrumentations selected
**Level:** PREFER
**Rubric:** R3 M4 S5 D3 C4
**Rule:** Tracing is loaded with `node --import ./dist/instrumentation.js`, which must run before any other import. Enable only the needed instrumentations (http/undici, fastify, pg). Do not enable `auto-instrumentations-node` wholesale, because its measured cost reached about 80% of throughput (A-135). Sample in production.
**Sources:** A-086, A-124, A-135

### OBS-004 Expose event-loop and process health metrics
**Level:** PREFER
**Rubric:** R3 M4 S5 D5 C4
**Rule:** Export event-loop delay (`perf_hooks.monitorEventLoopDelay`), event-loop utilization, heap usage and request latency histograms. Shed load on saturation (`@fastify/under-pressure`, HTTP-008).
**Sources:** A-150, A-140, A-130

### OBS-005 Log levels mean something
**Level:** MUST
**Rubric:** R4 M4 S4 D4 C4
**Rule:**
- `fatal`: the process is about to exit.
- `error`: a request or job failed, and a human may need to act.
- `warn`: a degraded state that recovered.
- `info`: lifecycle and business events.
- `debug`/`trace`: off in production.
- Never log secrets or full request bodies.
**Sources:** A-122, A-080
